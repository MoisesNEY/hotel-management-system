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
    
    // Guardamos el item
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
}
