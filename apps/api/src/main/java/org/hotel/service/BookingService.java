package org.hotel.service;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.Invoice;
import org.hotel.domain.RoomType;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.domain.enumeration.InvoiceStatus;
import org.hotel.domain.Room;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.InvoiceRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.repository.ServiceRequestRepository;
// ClientInvoiceService import removed
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
    private final RoomRepository roomRepository;
    private final BookingMapper bookingMapper;
    private final BookingDomainService bookingDomainService;
    private final MailService mailService;
    private final InvoiceRepository invoiceRepository;
    // ClientInvoiceService removed
    private final InvoiceService invoiceService;
    private final CustomerService customerService;
    private final org.hotel.repository.CustomerRepository customerRepository;

    public BookingService(BookingRepository bookingRepository,
                          ServiceRequestRepository serviceRequestRepository,
                          RoomTypeRepository roomTypeRepository,
                          RoomRepository roomRepository,
                          BookingMapper bookingMapper,
                          BookingDomainService bookingDomainService,
                          MailService mailService,
                          InvoiceRepository invoiceRepository,
                          InvoiceService invoiceService,
                          CustomerService customerService,
                          org.hotel.repository.CustomerRepository customerRepository) {
        this.bookingRepository = bookingRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingMapper = bookingMapper;
        this.bookingDomainService = bookingDomainService;
        this.mailService = mailService;
        this.invoiceRepository = invoiceRepository;
        this.invoiceService = invoiceService;
        this.customerService = customerService;
        this.customerRepository = customerRepository;
    }

    /**
     * Save a booking.
     */
    public BookingDTO save(BookingDTO bookingDTO) {
        LOG.debug("Request to save Booking : {}", bookingDTO);

        boolean isNew = bookingDTO.getId() == null;
        boolean isStatusChangeToConfirmed = false;

        // Check status transition if updating
        if (!isNew) {
            Optional<Booking> oldBooking = bookingRepository.findById(bookingDTO.getId());
            if (oldBooking.isPresent()) {
                if (!BookingStatus.CONFIRMED.equals(oldBooking.get().getStatus()) &&
                    BookingStatus.CONFIRMED.equals(bookingDTO.getStatus())) {
                    isStatusChangeToConfirmed = true;
                }
            }
        } else {
             if (BookingStatus.CONFIRMED.equals(bookingDTO.getStatus())) {
                 isStatusChangeToConfirmed = true;
             }
        }

        // Convertimos a entidad para trabajar con la lista de items
        Booking booking = bookingMapper.toEntity(bookingDTO);

        // Resolve Customer if needed (e.g. for Online Users)
        if (booking.getCustomer() == null) {
             org.hotel.security.SecurityUtils.getCurrentUserLogin().flatMap(customerRepository::findOneByUser_Login)
                 .ifPresent(booking::setCustomer);
        }

        // Generar código y estado si no existen
        if (booking.getCode() == null) {
            booking.getCode(); // Ensure code generation logic is robust or let DB handle defaults if any
            booking.setCode("RES-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.PENDING_APPROVAL);
        }

        // Expansión de items basada en quantity
        expandBookingItems(booking, bookingDTO);

        // Validamos y enriquecemos la data (Precios, Disponibilidad)
        prepareBookingData(booking, null);

        // Guardamos (Cascade persistirá los BookingItems automáticamente)
        Booking savedBooking = bookingRepository.save(booking);

        // Auto-generate invoice if created with PENDING_PAYMENT (e.g. Walk-In)
        if (isNew && BookingStatus.PENDING_PAYMENT.equals(savedBooking.getStatus())) {
             invoiceService.createInitialInvoice(savedBooking);
        }

        // Send Email
        try {
            if (savedBooking.getCustomer() != null && savedBooking.getCustomer().getEmail() != null) {
                // Creation Email (Only if new)
                if (isNew) {
                     mailService.sendBookingCreationEmail(savedBooking.getCustomer(), savedBooking);
                }
                
                // Approved Email
                if (isStatusChangeToConfirmed) {
                     mailService.sendBookingApprovedEmail(savedBooking.getCustomer(), savedBooking);
                }
            }
        } catch (Exception e) {
            LOG.warn("Failed to send email for booking {}", savedBooking.getCode(), e);
        }

        return bookingMapper.toDto(savedBooking);
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

        boolean isStatusChangeToConfirmed = false;
        Optional<Booking> oldBookingOpt = bookingRepository.findById(bookingDTO.getId());
        if (oldBookingOpt.isPresent()) {
             if (!BookingStatus.CONFIRMED.equals(oldBookingOpt.get().getStatus()) &&
                 BookingStatus.CONFIRMED.equals(bookingDTO.getStatus())) {
                 isStatusChangeToConfirmed = true;
             }
        }

        Booking booking = bookingMapper.toEntity(bookingDTO);

        // Preservar código si viene nulo en el DTO (Evitar validación fallida en DB si @NotNull existe en Entity)
        if (booking.getCode() == null && oldBookingOpt.isPresent()) {
            booking.setCode(oldBookingOpt.get().getCode());
        }

        prepareBookingData(booking, booking.getId());

        Booking savedBooking = bookingRepository.save(booking);

        // Send Email if Confirmed
        if (isStatusChangeToConfirmed && savedBooking.getCustomer() != null) {
             try {
                mailService.sendBookingApprovedEmail(savedBooking.getCustomer(), savedBooking);
             } catch (Exception e) {
                LOG.warn("Failed to send approved email for booking {}", savedBooking.getCode(), e);
             }
        }

        return bookingMapper.toDto(savedBooking);
    }

    /**
     * Partially update a booking.
     */
    public Optional<BookingDTO> partialUpdate(BookingDTO bookingDTO) {
        LOG.debug("Request to partially update Booking : {}", bookingDTO);

        return bookingRepository
            .findById(bookingDTO.getId())
            .map(existingBooking -> {
                BookingStatus oldStatus = existingBooking.getStatus();
                
                bookingMapper.partialUpdate(existingBooking, bookingDTO);

                // Expansión si se enviaron items
                if (bookingDTO.getItems() != null) {
                    expandBookingItems(existingBooking, bookingDTO);
                }

                // Si cambian las fechas, es obligatorio recalcular todo (precios y disponibilidad)
                if (bookingDTO.getCheckInDate() != null || bookingDTO.getCheckOutDate() != null) {
                    prepareBookingData(existingBooking, existingBooking.getId());
                }

                Booking saved = bookingRepository.save(existingBooking);
                
                if (!BookingStatus.CONFIRMED.equals(oldStatus) && 
                     BookingStatus.CONFIRMED.equals(saved.getStatus())) {
                     if (saved.getCustomer() != null) {
                          try {
                            mailService.sendBookingApprovedEmail(saved.getCustomer(), saved);
                          } catch (Exception e) {
                             LOG.warn("Failed to send approved email for booking {}", saved.getCode(), e);
                          }
                     }
                }

                return saved;
            })
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

    public String delete(Long id) {
        validateBookingForDeletion(id);

        // VALIDACIÓN FINANCIERA
        java.util.List<Invoice> invoices = invoiceRepository.findAllByBookingId(id);
        boolean hasPayments = invoices.stream().anyMatch(inv -> 
            InvoiceStatus.PAID.equals(inv.getStatus())
        );

        Booking booking = bookingRepository.findById(id).orElseThrow();

        if (hasPayments) {
            // ACCIÓN: CANCELACIÓN LÓGICA
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            return "La reserva ha sido CANCELADA (No eliminada) debido a pagos existentes.";
        } else {
            // ACCIÓN: BORRADO FÍSICO
            if (!invoices.isEmpty()) {
                 invoiceRepository.deleteAll(invoices);
            }
            bookingRepository.deleteById(id);
            return "La reserva ha sido eliminada correctamente.";
        }
    }

    public BookingDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (!BookingStatus.PENDING_APPROVAL.equals(booking.getStatus())) {
            throw new BusinessRuleException("Solo reservas pendientes de aprobación pueden ser aprobadas. Estado actual: " + booking.getStatus());
        }

        // Re-Validar Disponibilidad en el momento de la aprobación
        prepareBookingData(booking, id);

        // Cambiar Estado y Guardar
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        Booking saved = bookingRepository.save(booking);

        // Generar Factura Detallada (Usando la nueva lógica refactorizada)
        invoiceService.createInitialInvoice(saved);

        // Notificar Usuario
        if (saved.getCustomer() != null) {
            try {
                mailService.sendBookingApprovedEmail(saved.getCustomer(), saved);
            } catch (Exception e) {
                LOG.warn("Failed to send approval email for booking {}", saved.getCode(), e);
            }
        }

        return bookingMapper.toDto(saved);
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
            BookingStatus.CHECKED_OUT.equals(booking.getStatus())) {
            throw new BusinessRuleException("No puede borrar una reserva en estado CHECK-IN o CHECK-OUT");
        }
        if (serviceRequestRepository.existsByBookingId(bookingId)) {
            throw new BusinessRuleException("La reserva tiene solicitudes de servicio asociadas, bórrelas primero");
        }
    }

    private void expandBookingItems(Booking booking, BookingDTO bookingDTO) {
        if (bookingDTO.getItems() == null) return;

        // Limpiamos los items mapeados para reconstruir
        booking.getBookingItems().clear();

        for (org.hotel.service.dto.BookingItemDTO itemDTO : bookingDTO.getItems()) {
            RoomType roomType = roomTypeRepository.findById(itemDTO.getRoomType().getId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", itemDTO.getRoomType().getId()));

            BookingItem item = new BookingItem();
            item.setRoomType(roomType);
            item.setOccupantName(itemDTO.getOccupantName());
            item.setPrice(itemDTO.getPrice()); // Admin puede enviar precio manual o se recalcula en prepare
            
            // Asignación de habitación si viene en el DTO
            if (itemDTO.getAssignedRoom() != null && itemDTO.getAssignedRoom().getId() != null) {
                Room room = roomRepository.findById(itemDTO.getAssignedRoom().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room", itemDTO.getAssignedRoom().getId()));
                item.setAssignedRoom(room);
            }
            
            // Relación bidireccional
            item.setBooking(booking);
            booking.getBookingItems().add(item);
        }
    }
}
