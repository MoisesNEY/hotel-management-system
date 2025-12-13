package org.hotel.service.client;

import org.hotel.domain.Booking;
import org.hotel.domain.RoomType;
import org.hotel.domain.User;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.repository.UserRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.hotel.service.mapper.client.ClientBookingMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

import static org.hotel.web.rest.errors.ErrorConstants.*;

@Service
@Transactional
public class ClientBookingService {

    private final Logger log = LoggerFactory.getLogger(ClientBookingService.class);

    private final BookingRepository bookingRepository;
    private final ClientBookingMapper clientBookingMapper;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;

    public ClientBookingService(
        BookingRepository bookingRepository,
        ClientBookingMapper clientBookingMapper,
        UserRepository userRepository,
        RoomTypeRepository roomTypeRepository,
        RoomRepository roomRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.clientBookingMapper = clientBookingMapper;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Crea una reserva desde el portal del cliente.
     * Calcula el precio automáticamente, también verifica si hay habitaciones disponibles y asigna el usuario actual.
     */
    public BookingResponse createClientBooking(BookingCreateRequest request) {
        log.debug("Request to create client booking : {}", request);

        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        User customer = userRepository.findOneByLogin(userLogin)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Obtener el tipo de habitación para saber el precio base
        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
            .orElseThrow(() -> new BadRequestAlertException(
                "El tipo de habitación seleccionado no existe.",
                "roomType",
                ID_NOT_FOUND
            ));

        // Validación de disponibilidad
        long totalRooms = roomRepository.countByRoomTypeId(request.getRoomTypeId());
        // Cantidad de habitaciones disponible en ese lapso de tiempo
        long occupiedRooms = bookingRepository.countOverlappingBookings(
            request.getRoomTypeId(),
            request.getCheckInDate(),
            request.getCheckOutDate()
        );
        if (occupiedRooms >= totalRooms) {
            throw new BadRequestAlertException(
                "Lo sentimos, no hay disponibilidad para estas fechas.", // Mensaje por defecto
                "booking",
                ERROR_ROOM_AVAILABILITY
            );
        }
        Booking booking = clientBookingMapper.toEntity(request);

        booking.setCustomer(customer);
        booking.setRoomType(roomType);
        booking.setStatus(BookingStatus.PENDING);
        booking.setAssignedRoom(null);

        // Calcular Precio Total: (Días * PrecioNoche)
        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (days < 1) {
            throw new BadRequestAlertException(
                "La fecha de salida debe ser posterior a la de entrada.",
                "booking",
                INVALID_DATES
            );
        }
        BigDecimal totalPrice = roomType.getBasePrice().multiply(BigDecimal.valueOf(days));
        booking.setTotalPrice(totalPrice);

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

        // Este método del repositorio filtra por login
        return bookingRepository.findByCustomer_Login(userLogin, pageable)
            .map(clientBookingMapper::toClientResponse);
    }
}
