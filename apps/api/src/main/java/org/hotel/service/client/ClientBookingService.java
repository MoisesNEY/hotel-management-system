package org.hotel.service.client;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.Customer;
import org.hotel.domain.RoomType;

import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.CustomerRepository;
import org.hotel.repository.InvoiceRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;

import org.hotel.security.SecurityUtils;
import org.hotel.service.BookingDomainService;
import org.hotel.service.MailService;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.request.booking.BookingItemRequest;
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.hotel.service.dto.client.response.booking.RoomTypeAvailabilityDTO;
import org.hotel.service.mapper.client.ClientBookingMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.BusinessRuleException;
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
    private final CustomerRepository customerRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingDomainService bookingDomainService;
    private final MailService mailService;
    private final InvoiceRepository invoiceRepository;

    public ClientBookingService(
        BookingRepository bookingRepository,
        ClientBookingMapper clientBookingMapper,
        CustomerRepository customerRepository,
        RoomTypeRepository roomTypeRepository,
        RoomRepository roomRepository,
        BookingDomainService bookingDomainService,
        MailService mailService,
        InvoiceRepository invoiceRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.clientBookingMapper = clientBookingMapper;
        this.customerRepository = customerRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingDomainService = bookingDomainService;
        this.mailService = mailService;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Crea una reserva desde el portal del cliente.
     */
    public BookingResponse createClientBooking(BookingCreateRequest request) {
        log.debug("Request to create client booking : {}", request);

        // 1. Obtener Usuario Actual
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));



        // 2. Obtener Customer asociado
        Customer customer = customerRepository.findOneByUser_Login(userLogin)
            .orElseThrow(() -> new BusinessRuleException(
                "No tienes un perfil de cliente creado. Por favor completa tu información personal primero."
            ));

        // 3. Validar Fechas (Delegado)
        long nights = bookingDomainService.validateAndCalculateNights(request.getCheckInDate(), request.getCheckOutDate());

        // 4. Convertir DTO a Entidad
        Booking booking = clientBookingMapper.toEntity(request);
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
        booking.setCode("RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // 5. Lógica Multi-Habitación
        booking.getBookingItems().clear();

        BigDecimal totalPriceAccumulated = BigDecimal.ZERO;

        for (BookingItemRequest itemReq : request.getItems()) {
            RoomType roomType = roomTypeRepository.findById(itemReq.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", itemReq.getRoomTypeId()));

            BigDecimal itemPrice = bookingDomainService.calculateItemPrice(roomType, nights);
            
            BookingItem item = new BookingItem();
            item.setRoomType(roomType);
            item.setPrice(itemPrice);
            item.setOccupantName(itemReq.getOccupantName());
            
            item.setBooking(booking);
            booking.getBookingItems().add(item);
            
            totalPriceAccumulated = totalPriceAccumulated.add(itemPrice);
        }
        
        // 6. Validación de Disponibilidad
        Map<Long, Long> requestedRoomsByType = booking.getBookingItems().stream()
            .collect(Collectors.groupingBy(
                item -> item.getRoomType().getId(), 
                Collectors.counting()
            ));

        requestedRoomsByType.forEach((typeId, qty) -> {
            bookingDomainService.validateRoomAvailability(typeId, qty, request.getCheckInDate(), request.getCheckOutDate(), null);
        });

        // 7. Guardar
        booking = bookingRepository.save(booking);

        // 8. Enviar Correo
        try {
            mailService.sendBookingCreationEmail(customer, booking);
        } catch (Exception e) {
            log.warn("Fallo el envio de correo de confirmacion de reserva para usuario: {}", userLogin, e);
        }

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

        return bookingRepository.findByCustomer_User_Login(userLogin, pageable)
            .map(clientBookingMapper::toClientResponse);
    }

    /**
     * Obtiene la disponibilidad de habitaciones.
     */
    @Transactional(readOnly = true)
    public List<RoomTypeAvailabilityDTO> getAvailability(LocalDate checkIn, LocalDate checkOut) {
        log.debug("Request to get room availability between {} and {}", checkIn, checkOut);
        
        bookingDomainService.validateAndCalculateNights(checkIn, checkOut);

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

    /**
     * Elimina o Cancela una reserva del cliente.
     */
    public String deleteBooking(Long bookingId) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        Booking booking = bookingRepository.findOneWithToOneRelationships(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        // SEGURIDAD: Verificar pertenencia (Customer check)
        // El customer de la reserva debe tener un user con el login actual
        if (booking.getCustomer() == null || 
            booking.getCustomer().getUser() == null ||
            !booking.getCustomer().getUser().getLogin().equals(userLogin)) {
            
            throw new BadRequestAlertException("No tiene permisos para eliminar esta reserva", "booking", "accessDenied");
        }

        if (BookingStatus.CHECKED_IN.equals(booking.getStatus()) || 
            BookingStatus.CHECKED_OUT.equals(booking.getStatus())) {
            throw new BusinessRuleException("No se puede eliminar una reserva que está en curso o ya finalizó.");
        }

        if (!booking.getCheckInDate().isAfter(LocalDate.now())) {
             throw new BusinessRuleException("No se puede cancelar una reserva el mismo día del ingreso o fecha pasada. Contacte a soporte.");
        }

        // Validación Financiera
        List<org.hotel.domain.Invoice> invoices = invoiceRepository.findAllByBookingId(bookingId);
        boolean hasPayments = invoices.stream().anyMatch(inv -> 
            org.hotel.domain.enumeration.InvoiceStatus.PAID.equals(inv.getStatus())
        );

        if (hasPayments) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            return "La reserva ha sido CANCELADA (No eliminada) debido a pagos existentes. Por favor gestione el reembolso manualmente.";
        } else {
            if (!invoices.isEmpty()) {
                 invoiceRepository.deleteAll(invoices);
            }
            bookingRepository.delete(booking);
            return "La reserva ha sido eliminada correctamente.";
        }
    }
}