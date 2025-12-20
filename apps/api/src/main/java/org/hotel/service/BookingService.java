package org.hotel.service;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.RoomType;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.repository.ServiceRequestRepository;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.mapper.BookingMapper;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
    private final BookingMapper bookingMapper;
    private final BookingDomainService bookingDomainService; // Injected

    public BookingService(BookingRepository bookingRepository,
                          ServiceRequestRepository serviceRequestRepository,
                          RoomTypeRepository roomTypeRepository,
                          BookingMapper bookingMapper,
                          BookingDomainService bookingDomainService) {
        this.bookingRepository = bookingRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.bookingMapper = bookingMapper;
        this.bookingDomainService = bookingDomainService;
    }

    /**
     * Save a booking.
     */
    public BookingDTO save(BookingDTO bookingDTO) {
        LOG.debug("Request to save Booking : {}", bookingDTO);

        // Convertimos a entidad para trabajar con la lista de items
        Booking booking = bookingMapper.toEntity(bookingDTO);

        // Validamos y enriquecemos la data (Precios, Disponibilidad)
        prepareBookingData(booking, null);

        // Guardamos (Cascade persistirá los BookingItems automáticamente)
        booking = bookingRepository.save(booking);

        // TODO: Llamar a invoiceService.createInvoiceFromBooking(booking);

        return bookingMapper.toDto(booking);
    }

    /**
     * Update a booking.
     */
    public BookingDTO update(BookingDTO bookingDTO) {
        LOG.debug("Request to update Booking : {}", bookingDTO);

        // Validamos que exista
        if (!bookingRepository.existsById(bookingDTO.getId())) {
            throw new ResourceNotFoundException("Booking", bookingDTO.getId());
        }

        Booking booking = bookingMapper.toEntity(bookingDTO);

        prepareBookingData(booking, booking.getId());

        booking = bookingRepository.save(booking);
        return bookingMapper.toDto(booking);
    }

    /**
     * Partially update a booking.
     */
    public Optional<BookingDTO> partialUpdate(BookingDTO bookingDTO) {
        LOG.debug("Request to partially update Booking : {}", bookingDTO);

        return bookingRepository
            .findById(bookingDTO.getId())
            .map(existingBooking -> {
                bookingMapper.partialUpdate(existingBooking, bookingDTO);

                // Si cambian las fechas, es obligatorio recalcular todo (precios y disponibilidad)
                if (bookingDTO.getCheckInDate() != null || bookingDTO.getCheckOutDate() != null) {
                    prepareBookingData(existingBooking, existingBooking.getId());
                }

                return existingBooking;
            })
            .map(bookingRepository::save)
            .map(bookingMapper::toDto);
    }
    @Transactional(readOnly = true)
    public Page<BookingDTO> findAll(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(bookingMapper::toDto);
    }

    public Page<BookingDTO> findAllWithEagerRelationships(Pageable pageable) {
        return bookingRepository.findAllWithToOneRelationships(pageable).map(bookingMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<BookingDTO> findOne(Long id) {
        return bookingRepository.findOneWithToOneRelationships(id).map(bookingMapper::toDto);
    }

    public void delete(Long id) {
        validateBookingForDeletion(id);
        bookingRepository.deleteById(id);
    }

    /**
     * El cerebro del servicio. Valida fechas, disponibilidad y calcula precios.
     */
    private void prepareBookingData(Booking booking, Long currentBookingId) {

        // 1. Validar Fechas y Calcular Noches (Delegado)
        long nights = bookingDomainService.validateAndCalculateNights(booking.getCheckInDate(), booking.getCheckOutDate());

        // 2. Validar que hay items
        if (booking.getBookingItems() == null || booking.getBookingItems().isEmpty()) {
            throw new BusinessRuleException("La reserva debe contener al menos una habitación.");
        }

        // 3. Agrupar peticiones por RoomType para validar disponibilidad en bloque
        Map<Long, Long> requestedRoomsByType = booking.getBookingItems().stream()
            .collect(Collectors.groupingBy(
                item -> item.getRoomType().getId(),
                Collectors.counting()
            ));

        // 4. Iterar y Validar Disponibilidad + Calcular Precios + Sumar Capacidad
        int totalCapacityAccumulated = 0;

        for (BookingItem item : booking.getBookingItems()) {
            // Recuperar RoomType real de la BD (para precio y capacidad confiables)
            RoomType roomType = roomTypeRepository.findById(item.getRoomType().getId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", item.getRoomType().getId()));

            // A. Asignar Precio Congelado (Delegado)
            BigDecimal itemTotal = bookingDomainService.calculateItemPrice(roomType, nights);
            item.setPrice(itemTotal);
            item.setBooking(booking); // Asegurar relación bidireccional

            // B. Acumular Capacidad
            totalCapacityAccumulated += roomType.getMaxCapacity();

            // C. Actualizar el objeto RoomType dentro del item (por si venía incompleto del DTO)
            item.setRoomType(roomType);
        }

        // 5. Validar Disponibilidad (Bloque crítico delegago)
        // Recorremos el mapa de "lo que piden" vs "lo que hay"
        requestedRoomsByType.forEach((typeId, requestedAmount) -> {
            bookingDomainService.validateRoomAvailability(typeId, requestedAmount, booking.getCheckInDate(), booking.getCheckOutDate(), currentBookingId);
        });

        // 6. Validar Capacidad Global
        if (booking.getGuestCount() > totalCapacityAccumulated) {
            throw new BusinessRuleException("El número de huéspedes (" + booking.getGuestCount() +
                ") excede la capacidad total de las habitaciones seleccionadas (" + totalCapacityAccumulated + ")");
        }
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
}
