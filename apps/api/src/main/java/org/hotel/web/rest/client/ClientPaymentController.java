package org.hotel.web.rest.client;

import jakarta.validation.Valid;
import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.client.ClientPaymentService;
import org.hotel.service.dto.client.request.payment.PaymentCreateRequest;
import org.hotel.service.dto.client.response.payment.PaymentResponse;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * REST controller for managing payments from the Client Portal.
 */
@RestController
@RequestMapping("/api/client")
public class ClientPaymentController {

    private final Logger log = LoggerFactory.getLogger(ClientPaymentController.class);

    private final ClientPaymentService clientPaymentService;

    public ClientPaymentController(ClientPaymentService clientPaymentService) {
        this.clientPaymentService = clientPaymentService;
    }

    /**
     * {@code POST  /payments} : Register a new payment.
     *
     * @param request the payment request.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new payment response.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/payments")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.CLIENT + "\")")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request) throws URISyntaxException {
        log.debug("REST request to register Payment : {}", request);
        if (request.getAmount() == null) {
            throw new BadRequestAlertException("A new payment cannot have an empty amount", "payment", "amountnull");
        }
        PaymentResponse result = clientPaymentService.createPayment(request);
        return ResponseEntity
            .created(new URI("/api/client/payments/" + result.getId()))
            .body(result);
    }
}
