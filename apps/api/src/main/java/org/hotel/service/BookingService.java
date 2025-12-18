package org.hotel.service;

import org.hotel.domain.Booking;
import org.hotel.domain.RoomType;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.repository.ServiceRequestRepository;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.mapper.BookingMapper;
// Se mantienen tus excepciones personalizadas
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
import java.time.temporal.ChronoUnit;
import java.util.Optional;

/**
 * Service Implementation for managing {@link org.hotel.domain.Booking}.
 */
@Service
@Transactional
public class BookingService {

    private static final Logger LOG = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingMapper bookingMapper;

    public BookingService(BookingRepository bookingRepository, ServiceRequestRepository serviceRequestRepository, RoomRepository roomRepository, RoomTypeRepository roomTypeRepository, BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingMapper = bookingMapper;
    }

    /**
     * Save a booking.
     *
     * @param bookingDTO the entity to save.
     * @return the persisted entity.
     */
    public BookingDTO save(BookingDTO bookingDTO) {
        LOG.debug("Request to save Booking : {}", bookingDTO);
        // null indica que no hay ID que excluir (es creación)
        return bookingMapper.toDto(bookingRepository.save(validateAndPrepareData(bookingDTO, null)));
    }

    /**
     * Update a booking.
     *
     * @param bookingDTO the entity to save.
     * @return the persisted entity.
     */
    public BookingDTO update(BookingDTO bookingDTO) {
        LOG.debug("Request to update Booking : {}", bookingDTO);
        // Pasamos el ID para excluir esta reserva del conteo de disponibilidad (evitar autabloqueo)
        return bookingMapper.toDto(bookingRepository.save(validateAndPrepareData(bookingDTO, bookingDTO.getId())));
    }

    /**
     * Partially update a booking.
     *
     * @param bookingDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<BookingDTO> partialUpdate(BookingDTO bookingDTO) {
        LOG.debug("Request to partially update Booking : {}", bookingDTO);

        if (bookingDTO.getTotalPrice() != null) {
            throw new BusinessRuleException("El precio debe ser calculado por el servidor");
        }

        return bookingRepository
            .findById(bookingDTO.getId())
            .map(existingBooking -> {
                bookingMapper.partialUpdate(existingBooking, bookingDTO);

                // Si cambian las fechas, es obligatorio recalcular precio y validar disponibilidad
                if (bookingDTO.getCheckInDate() != null || bookingDTO.getCheckOutDate() != null) {

                    if (!existingBooking.getCheckOutDate().isAfter(existingBooking.getCheckInDate())) {
                        throw new BusinessRuleException("La fecha de salida debe ser posterior a la de entrada.");
                    }

                    // Se valida disponibilidad excluyendo la reserva actual
                    validateRoomTypeDisposability(
                        existingBooking.getRoomType().getId(),
                        existingBooking.getCheckInDate(),
                        existingBooking.getCheckOutDate(),
                        existingBooking.getId()
                    );

                    BigDecimal totalPrice = calculateTotalPrice(
                        existingBooking.getCheckInDate(),
                        existingBooking.getCheckOutDate(),
                        existingBooking.getRoomType()
                    );
                    existingBooking.setTotalPrice(totalPrice);
                }

                return existingBooking;
            })
            .map(bookingRepository::save)
            .map(bookingMapper::toDto);
    }

    /**
     * Get all the bookings.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<BookingDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Bookings");
        return bookingRepository.findAll(pageable).map(bookingMapper::toDto);
    }

    public Page<BookingDTO> findAllWithEagerRelationships(Pageable pageable) {
        return bookingRepository.findAllWithEagerRelationships(pageable).map(bookingMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<BookingDTO> findOne(Long id) {
        LOG.debug("Request to get Booking : {}", id);
        return bookingRepository.findOneWithEagerRelationships(id).map(bookingMapper::toDto);
    }

    /**
     * Delete the booking by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Booking : {}", id);
        validateBookingForDeletion(id);
        bookingRepository.deleteById(id);
    }

    /**
     * Centraliza la validación y preparación de datos para save y update.
     * @param currentBookingId ID de la reserva si es update, null si es create.
     */
    private Booking validateAndPrepareData(BookingDTO bookingDTO, Long currentBookingId) {
        if (currentBookingId != null) {
            bookingRepository.findById(currentBookingId).ifPresent(existing -> {
                if (!existing.getCustomer().getId().equals(bookingDTO.getCustomer().getId())) {
                    throw new BusinessRuleException("No se permite cambiar el cliente de una reserva existente");
                }
            });
        }

        // Es crítico obtener el RoomType de BD para tener los datos reales (precio, capacidad)
        RoomType roomType = roomTypeRepository.findById(bookingDTO.getRoomType().getId())
            .orElseThrow(() -> new ResourceNotFoundException("RoomType", bookingDTO.getRoomType().getId()));

        var checkInDate = bookingDTO.getCheckInDate();
        var checkOutDate = bookingDTO.getCheckOutDate();

        if (!checkOutDate.isAfter(checkInDate)) {
            throw new BusinessRuleException("La fecha de salida debe ser posterior a la de entrada.");
        }

        validateRoomTypeCapacity(bookingDTO.getGuestCount(), roomType);
        validateRoomTypeDisposability(roomType.getId(), checkInDate, checkOutDate, currentBookingId);

        var booking = bookingMapper.toEntity(bookingDTO);

        BigDecimal totalPrice = calculateTotalPrice(checkInDate, checkOutDate, roomType);

        booking.setTotalPrice(totalPrice);
        booking.setRoomType(roomType);

        return booking;
    }

    public void validateBookingForDeletion(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        if (BookingStatus.CHECKED_IN.equals(booking.getStatus()) ||
            BookingStatus.CONFIRMED.equals(booking.getStatus())) {
            throw new BusinessRuleException("No puede borrar una reserva en estado CONFIRMADO o CHECK-IN");
        }
        if (serviceRequestRepository.existsByBookingId(bookingId)) {
            throw new BusinessRuleException("La reserva tiene solicitudes de servicio asociadas, bórrelas primero");
        }
    }

    public BigDecimal calculateTotalPrice(LocalDate checkIn, LocalDate checkOut, RoomType roomType) {
        long days = ChronoUnit.DAYS.between(checkIn, checkOut);
        return roomType.getBasePrice().multiply(BigDecimal.valueOf(days));
    }

    /**
     * Válida disponibilidad controlando la concurrencia y la autoexclusión en updates.
     */
    public void validateRoomTypeDisposability(Long roomTypeId, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId) {
        long totalRooms = roomRepository.countByRoomTypeId(roomTypeId);
        long occupiedRooms;

        if (excludeBookingId == null) {
            occupiedRooms = bookingRepository.countOverlappingBookings(roomTypeId, checkIn, checkOut);
        } else {
            occupiedRooms = bookingRepository.countOverlappingBookingsExcludingSelf(roomTypeId, checkIn, checkOut, excludeBookingId);
        }

        if (occupiedRooms >= totalRooms) {
            throw new BusinessRuleException("Lo sentimos, no hay disponibilidad para estas fechas.");
        }
    }

    public void validateRoomTypeCapacity(int guestCount, RoomType roomType) {
        if (guestCount > roomType.getMaxCapacity()) {
            throw new BusinessRuleException("La reserva excede la cantidad de invitados soportados por la habitación");
        }
    }
}
