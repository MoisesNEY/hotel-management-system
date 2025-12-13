package org.hotel.service.client;

import org.hotel.domain.Booking;
import org.hotel.domain.RoomType;
import org.hotel.domain.User;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.repository.UserRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.hotel.service.mapper.client.ClientBookingMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Service
@Transactional
public class ClientBookingService {

    private final Logger log = LoggerFactory.getLogger(ClientBookingService.class);

    private final BookingRepository bookingRepository;
    private final ClientBookingMapper clientBookingMapper;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;

    public ClientBookingService(
        BookingRepository bookingRepository,
        ClientBookingMapper clientBookingMapper,
        UserRepository userRepository,
        RoomTypeRepository roomTypeRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.clientBookingMapper = clientBookingMapper;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    /**
     * Crea una reserva desde el portal del cliente.
     * Calcula el precio automáticamente y asigna el usuario actual.
     */
    public BookingResponse createClientBooking(BookingCreateRequest request) {
        log.debug("Request to create client booking : {}", request);

        // 1. Obtener usuario actual (Login seguro desde el Token)
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        User customer = userRepository.findOneByLogin(userLogin)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Obtener el tipo de habitación para saber el precio base
        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
            .orElseThrow(() -> new RuntimeException("Tipo de habitación no encontrado"));

        // 3. Convertir DTO a Entidad (El mapper ignora ID, Status, Precio, etc.)
        Booking booking = clientBookingMapper.toEntity(request);

        // 4. Completar datos críticos de negocio (SERVER-SIDE)
        booking.setCustomer(customer);
        booking.setRoomType(roomType);
        booking.setStatus(BookingStatus.PENDING); // Siempre empieza pendiente
        booking.setAssignedRoom(null); // No se asigna habitación al crear

        // 5. Calcular Precio Total: (Días * PrecioNoche)
        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (days < 1) {
            throw new IllegalArgumentException("La estancia debe ser de al menos 1 noche");
        }
        BigDecimal totalPrice = roomType.getBasePrice().multiply(BigDecimal.valueOf(days));
        booking.setTotalPrice(totalPrice);

        // 6. Guardar
        booking = bookingRepository.save(booking);

        // 7. Retornar respuesta aplanada
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

        // Este método del repositorio filtra por login
        return bookingRepository.findByCustomer_Login(userLogin, pageable)
            .map(clientBookingMapper::toClientResponse);
    }
}
