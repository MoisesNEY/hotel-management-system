package org.hotel.service.client;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.Invoice;
import org.hotel.domain.InvoiceItem;
import org.hotel.repository.InvoiceItemRepository;
import org.hotel.repository.InvoiceRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.InvoiceDTO;
import org.hotel.service.mapper.InvoiceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class ClientInvoiceService {

    private final Logger log = LoggerFactory.getLogger(ClientInvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final InvoiceMapper invoiceMapper;

    public ClientInvoiceService(InvoiceRepository invoiceRepository, 
                                InvoiceItemRepository invoiceItemRepository,
                                InvoiceMapper invoiceMapper) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.invoiceMapper = invoiceMapper;
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDTO> findMyInvoices(Pageable pageable) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        
        log.debug("Request to get invoices for user : {}", userLogin);

        return invoiceRepository.findByBooking_Customer_User_Login(userLogin, pageable)
            .map(invoiceMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDTO> findMyInvoicesByBookingId(Long bookingId, Pageable pageable) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        
        log.debug("Request to get invoices for booking {} and user : {}", bookingId, userLogin);

        return invoiceRepository.findByBooking_IdAndBooking_Customer_User_Login(bookingId, userLogin, pageable)
            .map(invoiceMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<InvoiceDTO> findMyInvoice(Long id) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        log.debug("Request to get invoice {} for user : {}", id, userLogin);

        return invoiceRepository.findOneWithToOneRelationships(id)
            .filter(invoice -> invoice.getBooking() != null && 
                             invoice.getBooking().getCustomer() != null && 
                             invoice.getBooking().getCustomer().getUser() != null &&
                             invoice.getBooking().getCustomer().getUser().getLogin().equals(userLogin))
            .map(invoiceMapper::toDto);
    }

    @Transactional
    public void createInvoiceSnapshot(Booking booking) {
        if (booking.getInvoices() != null && !booking.getInvoices().isEmpty()) {
            return;
        }

        Invoice invoice = new Invoice();
        invoice.setCode("INV-" + booking.getCode());
        invoice.setIssuedDate(java.time.Instant.now());
        invoice.setStatus(org.hotel.domain.enumeration.InvoiceStatus.ISSUED);
        invoice.setCurrency("USD");
        invoice.setBooking(booking);
        
        // Guardar Invoice primero para tener ID (si fuera necesario, pero con Cascade ALL en items se guarda todo junto)
        // Pero items necesitan referencia a invoice.
        invoice = invoiceRepository.save(invoice);

        java.math.BigDecimal totalAmount = java.math.BigDecimal.ZERO;
        java.util.Set<InvoiceItem> invoiceItems = new java.util.HashSet<>();

        if (booking.getBookingItems() != null) {
            for (BookingItem item : booking.getBookingItems()) {
                if (item.getPrice() != null) {
                    // Crear Snapshot Item
                    InvoiceItem invoiceItem = new InvoiceItem();
                    invoiceItem.setInvoice(invoice);
                    
                    String description = "Room Charge: " + item.getRoomType().getName();
                    invoiceItem.setDescription(description);
                    invoiceItem.setAmount(item.getPrice());
                    invoiceItem.setDate(java.time.Instant.now());
                    
                    invoiceItemRepository.save(invoiceItem);
                    
                    invoiceItems.add(invoiceItem);
                    totalAmount = totalAmount.add(invoiceItem.getAmount());
                }
            }
        }
        
        invoice.setTotalAmount(totalAmount);
        invoice.setTaxAmount(totalAmount.multiply(new java.math.BigDecimal("0.15"))); 
        
        // Guardar cambios finales
        invoiceRepository.save(invoice);
    }
}
