package org.hotel.web.rest.client;

import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.client.ClientInvoiceService;
import org.hotel.service.dto.InvoiceDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing payments from the Client Portal.
 */
@RestController
@RequestMapping("/api/client/invoices")
public class ClientInvoiceController {

    private final Logger log = LoggerFactory.getLogger(ClientInvoiceController.class);

    private final ClientInvoiceService clientInvoiceService;

    public ClientInvoiceController(ClientInvoiceService clientInvoiceService) {
        this.clientInvoiceService = clientInvoiceService;
    }

    /**
     * {@code GET  /api/client/invoices} : get all the invoices for the current user.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of invoices in body.
     */
    @GetMapping
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.CLIENT + "\")")
    public ResponseEntity<List<InvoiceDTO>> getMyInvoices(@ParameterObject Pageable pageable) {
        log.debug("REST request to get My Invoices");
        Page<InvoiceDTO> page = clientInvoiceService.findMyInvoices(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /api/client/invoices/:id} : get the "id" invoice if it belongs to current user.
     *
     * @param id the id of the invoiceDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the invoiceDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.CLIENT + "\")")
    public ResponseEntity<InvoiceDTO> getMyInvoice(@PathVariable("id") Long id) {
        log.debug("REST request to get My Invoice : {}", id);
        Optional<InvoiceDTO> invoiceDTO = clientInvoiceService.findMyInvoice(id);
        return ResponseUtil.wrapOrNotFound(invoiceDTO);
    }
}
