package org.hotel.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import org.hotel.domain.Booking;
import org.hotel.domain.Invoice;
import org.hotel.domain.InvoiceItem;
import org.hotel.domain.enumeration.InvoiceStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.InvoiceItemRepository;
import org.hotel.repository.InvoiceRepository;
import org.hotel.service.dto.InvoiceDTO;
import org.hotel.service.mapper.InvoiceMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.Invoice}.
 */
@Service
@Transactional
public class InvoiceService {

    private static final Logger LOG = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final InvoiceMapper invoiceMapper;
    private final BookingRepository bookingRepository;
    private final org.hotel.service.mapper.InvoiceItemMapper invoiceItemMapper;

    public InvoiceService(
        InvoiceRepository invoiceRepository,
        InvoiceMapper invoiceMapper,
        BookingRepository bookingRepository,
        InvoiceItemRepository invoiceItemRepository,
        org.hotel.service.mapper.InvoiceItemMapper invoiceItemMapper
    ) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceMapper = invoiceMapper;
        this.invoiceItemRepository = invoiceItemRepository;
        this.invoiceItemMapper = invoiceItemMapper;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Save a invoice.
     *
     * @param invoiceDTO the entity to save.
     * @return the persisted entity.
     */
    public InvoiceDTO save(InvoiceDTO invoiceDTO) {
        LOG.debug("Request to save Invoice : {}", invoiceDTO);
        Invoice invoice = invoiceMapper.toEntity(invoiceDTO);
        invoice = invoiceRepository.save(invoice);
        return invoiceMapper.toDto(invoice);
    }

    /**
     * Update a invoice.
     *
     * @param invoiceDTO the entity to save.
     * @return the persisted entity.
     */
    public InvoiceDTO update(InvoiceDTO invoiceDTO) {
        LOG.debug("Request to update Invoice : {}", invoiceDTO);
        Invoice invoice = invoiceMapper.toEntity(invoiceDTO);
        invoice = invoiceRepository.save(invoice);
        return invoiceMapper.toDto(invoice);
    }

    /**
     * Partially update a invoice.
     *
     * @param invoiceDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<InvoiceDTO> partialUpdate(InvoiceDTO invoiceDTO) {
        LOG.debug("Request to partially update Invoice : {}", invoiceDTO);

        return invoiceRepository
            .findById(invoiceDTO.getId())
            .map(existingInvoice -> {
                invoiceMapper.partialUpdate(existingInvoice, invoiceDTO);

                return existingInvoice;
            })
            .map(invoiceRepository::save)
            .map(invoiceMapper::toDto);
    }

    /**
     * Get all the invoices with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<InvoiceDTO> findAllWithEagerRelationships(Pageable pageable) {
        return invoiceRepository.findAllWithEagerRelationships(pageable).map(invoiceMapper::toDto);
    }

    /**
     * Get one invoice by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<InvoiceDTO> findOne(Long id) {
        LOG.debug("Request to get Invoice : {}", id);
        return invoiceRepository.findOneWithEagerRelationships(id).map(invoiceMapper::toDto);
    }

    /**
     * Delete the invoice by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Invoice : {}", id);
        invoiceRepository.deleteById(id);
    }

    /**
     * Add a service charge to the invoice associated with a booking.
     *
     * @param bookingId the booking id.
     * @param itemDTO the invoice item to add.
     */
    public InvoiceDTO addServiceCharge(Long bookingId, org.hotel.service.dto.InvoiceItemDTO itemDTO) {
    LOG.debug("Request to add service charge to booking : {}", bookingId);

    // 1. Buscamos si existe una factura ABIERTA (Ni pagada ni cancelada)
    Optional<Invoice> openInvoice = invoiceRepository.findAllByBookingId(bookingId)
        .stream()
        .filter(inv -> inv.getStatus() != InvoiceStatus.PAID && inv.getStatus() != InvoiceStatus.CANCELLED)
        .findFirst();

    Invoice invoice;

    if (openInvoice.isPresent()) {
        // ESCENARIO A: Ya hay una cuenta abierta (ej: pidió una coca hace 10 min) -> Usamos esa
        invoice = openInvoice.get();
    } else {
        // ESCENARIO B: No hay facturas o todas están pagadas -> CREAMOS UNA NUEVA (Folio Extra)
        invoice = new Invoice();
        invoice.setCode("INV-" + System.currentTimeMillis()); // O tu lógica de generador de códigos
        invoice.setIssuedDate(Instant.now());
        invoice.setStatus(InvoiceStatus.ISSUED);
        
        // Buscamos la entidad Booking completa para asociarla
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BadRequestAlertException("Booking not found", "booking", "idnotfound"));
        invoice.setBooking(booking);
        
        // Guardamos la cabecera primero
        invoice = invoiceRepository.save(invoice);
    }

    // 2. Agregamos el Item
    org.hotel.domain.InvoiceItem item = invoiceItemMapper.toEntity(itemDTO);
    item.setInvoice(invoice);
    item.setDate(java.time.Instant.now());
    // item.setQuantity(1) removed
    invoiceItemRepository.save(item); // Importante guardar el item antes de recalcular si usas JPA estricto
    invoice.addItems(item);

    // 3. Recálculo (Snapshot)
    BigDecimal totalAmount = invoice.getItems().stream()
        .map(InvoiceItem::getAmount)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
        
    invoice.setTotalAmount(totalAmount);
    
    // 4. Cálculo de Impuestos (Ejemplo 0% por ahora)
    invoice.setTaxAmount(totalAmount.multiply(new BigDecimal("0.00")));
    
    return invoiceMapper.toDto(invoiceRepository.save(invoice));
}
    /**
     * Creates the initial invoice for a booking with detailed items.
     * @param booking The booking entity.
     * @return The created InvoiceDTO.
     */
    public InvoiceDTO createInitialInvoice(Booking booking) {
        LOG.debug("Creating initial invoice for booking : {}", booking.getId());

        Invoice invoice = new Invoice();
        invoice.setCode("INV-" + System.currentTimeMillis());
        invoice.setIssuedDate(Instant.now());
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setBooking(booking);

        // Save Header first to get ID
        invoice = invoiceRepository.save(invoice);

        BigDecimal subtotal = BigDecimal.ZERO;

        // 1. Iterate Booking Items (Rooms)
        if (booking.getBookingItems() != null) {
            for (org.hotel.domain.BookingItem item : booking.getBookingItems()) {
                if (item.getPrice() != null) {
                    InvoiceItem invoiceItem = new InvoiceItem();
                    invoiceItem.setInvoice(invoice);
                    
                    // Format Description: "Alojamiento: Suite Deluxe - (2025-12-01 al 2025-12-05)"
                    String description = String.format("Alojamiento: %s - (%s al %s)",
                        item.getRoomType() != null ? item.getRoomType().getName() : "Habitación",
                        booking.getCheckInDate(),
                        booking.getCheckOutDate()
                    );
                    invoiceItem.setDescription(description);
                    
                    // Amount
                    invoiceItem.setAmount(item.getPrice());
                    // quantity removed
                    invoiceItem.setDate(Instant.now());

                    invoiceItemRepository.save(invoiceItem);
                    invoice.addItems(invoiceItem);
                    
                    subtotal = subtotal.add(item.getPrice());
                }
            }
        }

        // 2. Iterate Service Requests (Add-ons)
        if (booking.getServiceRequests() != null) {
            for (org.hotel.domain.ServiceRequest req : booking.getServiceRequests()) {
                // Use totalCost if available, otherwise calculate or fallback
                BigDecimal servicePrice = req.getTotalCost();
                if (servicePrice == null && req.getService() != null) {
                     servicePrice = req.getService().getCost();
                }

                if (servicePrice != null) {
                     InvoiceItem serviceItem = new InvoiceItem();
                     serviceItem.setInvoice(invoice);
                     serviceItem.setDescription(req.getService() != null ? req.getService().getName() : "Servicio Adicional");
                     serviceItem.setAmount(servicePrice);
                     // setQuantity removed as it doesn't exist
                     serviceItem.setDate(Instant.now());
                     
                     invoiceItemRepository.save(serviceItem);
                     invoice.addItems(serviceItem);
                     
                     subtotal = subtotal.add(servicePrice);
                }
            }
        }

        // 3. Discounts (Dummy Logic as requested if specific field missing)
        // Check if there is a 'coupon' or similar logic later. For now, skipping as field not found in entity inspection.

        // 4. Calculate Taxes and Total
        BigDecimal taxRate = new BigDecimal("0.15"); // 15% Tax
        BigDecimal taxAmount = subtotal.multiply(taxRate);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);

        return invoiceMapper.toDto(invoiceRepository.save(invoice));
    }
}
