package org.hotel.service.client;

import org.hotel.domain.Invoice;
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
    private final InvoiceMapper invoiceMapper;

    public ClientInvoiceService(InvoiceRepository invoiceRepository, InvoiceMapper invoiceMapper) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceMapper = invoiceMapper;
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDTO> findMyInvoices(Pageable pageable) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        
        log.debug("Request to get invoices for user : {}", userLogin);

        return invoiceRepository.findByBooking_Customer_Login(userLogin, pageable)
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
                             invoice.getBooking().getCustomer().getLogin().equals(userLogin))
            .map(invoiceMapper::toDto);
    }
}
