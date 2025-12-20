package org.hotel.web.rest.client;

import jakarta.validation.Valid;
import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.client.ClientPaymentService;
import org.hotel.service.dto.client.request.payment.PaymentCaptureRequest;
import org.hotel.service.dto.client.request.payment.PaymentInitRequest;
import org.hotel.service.dto.client.response.payment.PaymentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing payments from the Client Portal using PayPal.
 */
@RestController
@RequestMapping("/api/client/payments")
public class ClientPaymentController {

    private final Logger log = LoggerFactory.getLogger(ClientPaymentController.class);

    private final ClientPaymentService clientPaymentService;

    public ClientPaymentController(ClientPaymentService clientPaymentService) {
        this.clientPaymentService = clientPaymentService;
    }

    /**
     * {@code POST  /init} : Inicia un flujo de pago con PayPal.
     *
     * @param request the payment init request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the payment response.
     */
    @PostMapping("/init")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.CLIENT + "\")")
    public ResponseEntity<PaymentResponse> initPayment(@Valid @RequestBody PaymentInitRequest request) {
        log.debug("REST request to init PayPal Payment : {}", request);
        PaymentResponse result = clientPaymentService.initPayment(request);
        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code POST  /capture} : Captura un pago de PayPal.
     *
     * @param request the payment capture request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the payment response.
     */
    @PostMapping("/capture")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.CLIENT + "\")")
    public ResponseEntity<PaymentResponse> capturePayment(@Valid @RequestBody PaymentCaptureRequest request) {
        log.debug("REST request to capture PayPal Payment : {}", request);
        PaymentResponse result = clientPaymentService.capturePayment(request);
        return ResponseEntity.ok().body(result);
    }
}
