package org.hotel.service.client;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.RoomType;
import org.hotel.domain.User;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.repository.UserRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.BookingDomainService;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.request.booking.BookingItemRequest;
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.hotel.service.dto.client.response.booking.RoomTypeAvailabilityDTO;
import org.hotel.service.mapper.client.ClientBookingMapper;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClientBookingService {

    private final Logger log = LoggerFactory.getLogger(ClientBookingService.class);

    private final BookingRepository bookingRepository;
    private final ClientBookingMapper clientBookingMapper;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingDomainService bookingDomainService; // Injected

    public ClientBookingService(
        BookingRepository bookingRepository,
        ClientBookingMapper clientBookingMapper,
        UserRepository userRepository,
        RoomTypeRepository roomTypeRepository,
        RoomRepository roomRepository,
        BookingDomainService bookingDomainService
    ) {
        this.bookingRepository = bookingRepository;
        this.clientBookingMapper = clientBookingMapper;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingDomainService = bookingDomainService;
    }

    /**
     * Crea una reserva desde el portal del cliente.
     * Soporta múltiples habitaciones, valida disponibilidad en bloque y calcula precios individuales.
     */
    public BookingResponse createClientBooking(BookingCreateRequest request) {
        log.debug("Request to create client booking : {}", request);

        // 1. Obtener Usuario Actual
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        User customer = userRepository.findOneByLogin(userLogin)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Validar Fechas (Delegado)
        long nights = bookingDomainService.validateAndCalculateNights(request.getCheckInDate(), request.getCheckOutDate());

        // 3. Convertir DTO a Entidad
        Booking booking = clientBookingMapper.toEntity(request);
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.PENDING);
        booking.setCode("RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // 4. Lógica Multi-Habitación (Mapeo Directo)
        // Limpiamos los items mapeados automáticamente para reconstruir con validaciones de BD
        booking.getBookingItems().clear();

        BigDecimal totalPriceAccumulated = BigDecimal.ZERO;

        for (BookingItemRequest itemReq : request.getItems()) {
            RoomType roomType = roomTypeRepository.findById(itemReq.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", itemReq.getRoomTypeId()));

            // Calcular precio de ESTE item (Delegado)
            BigDecimal itemPrice = bookingDomainService.calculateItemPrice(roomType, nights);
            
            BookingItem item = new BookingItem();
            item.setRoomType(roomType);
            item.setPrice(itemPrice);
            item.setOccupantName(itemReq.getOccupantName());
            
            // Establecer relación bidireccional
            item.setBooking(booking);
            booking.getBookingItems().add(item);
            
            // Sumar al total global
            totalPriceAccumulated = totalPriceAccumulated.add(itemPrice);
        }
        
        // 5. Validación de Disponibilidad (Agrupada Delegada)
        Map<Long, Long> requestedRoomsByType = booking.getBookingItems().stream()
            .collect(Collectors.groupingBy(
                item -> item.getRoomType().getId(), 
                Collectors.counting()
            ));

        requestedRoomsByType.forEach((typeId, qty) -> {
            bookingDomainService.validateRoomAvailability(typeId, qty, request.getCheckInDate(), request.getCheckOutDate(), null);
        });

        // 6. Guardar (Cascade guardará los items)
        booking = bookingRepository.save(booking);

        return clientBookingMapper.toClientResponse(booking);
    }

    /**
     * Obtiene solo las reservas del usuario logueado.
     */
    @Transactional(readOnly = true)
    public Page<BookingResponse> findMyBookings(Pageable pageable) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        log.debug("Request to get all bookings for user : {}", userLogin);

        // Usamos el query findAllWithToOneRelationships o similar si queremos traer los items ansiosamente
        // Pero para lista simple, el findByCustomer_Login está bien, JPA traerá los items lazy o según config.
        return bookingRepository.findByCustomer_Login(userLogin, pageable)
            .map(clientBookingMapper::toClientResponse);
    }

    /**
     * Obtiene la disponibilidad de habitaciones para un rango de fechas.
     */
    @Transactional(readOnly = true)
    public List<RoomTypeAvailabilityDTO> getAvailability(LocalDate checkIn, LocalDate checkOut) {
        log.debug("Request to get room availability between {} and {}", checkIn, checkOut);
        
        // Validar fechas
        bookingDomainService.validateAndCalculateNights(checkIn, checkOut);

        // Obtener todos los tipos de habitación
        List<RoomType> roomTypes = roomTypeRepository.findAll();

        return roomTypes.stream().map(type -> {
            long totalPhysicalRooms = roomRepository.countByRoomTypeId(type.getId());
            long occupiedRooms = bookingRepository.countOverlappingBookings(type.getId(), checkIn, checkOut);
            
            RoomTypeAvailabilityDTO dto = new RoomTypeAvailabilityDTO();
            dto.setId(type.getId());
            dto.setName(type.getName());
            dto.setBasePrice(type.getBasePrice());
            dto.setMaxCapacity(type.getMaxCapacity());
            dto.setAvailableQuantity((int) Math.max(0, totalPhysicalRooms - occupiedRooms));
            
            return dto;
        }).collect(Collectors.toList());
    }
}