package org.hotel.service.client;

import com.paypal.sdk.PaypalServerSdkClient;
import com.paypal.sdk.exceptions.ApiException;
import com.paypal.sdk.models.*;
import org.hotel.domain.Booking;
import org.hotel.domain.Invoice;
import org.hotel.domain.Payment;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.domain.enumeration.InvoiceStatus;
import org.hotel.domain.enumeration.PaymentMethod;
import org.hotel.repository.InvoiceRepository;
import org.hotel.repository.PaymentRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.payment.PaymentCaptureRequest;
import org.hotel.service.dto.client.request.payment.PaymentInitRequest;
import org.hotel.service.dto.client.response.payment.PaymentResponse;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;

@Service
@Transactional
public class ClientPaymentService {

    private final Logger log = LoggerFactory.getLogger(ClientPaymentService.class);

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaypalServerSdkClient paypalClient;
    private final org.hotel.service.MailService mailService;

    public ClientPaymentService(
        PaymentRepository paymentRepository,
        InvoiceRepository invoiceRepository,
        PaypalServerSdkClient paypalClient,
        org.hotel.service.MailService mailService
    ) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.paypalClient = paypalClient;
        this.mailService = mailService;
    }

    /**
     * Inicia el proceso de pago creando una orden en PayPal.
     */
    public PaymentResponse initPayment(PaymentInitRequest request) {
        log.debug("Iniciando pago para la factura ID: {}", request.getInvoiceId());

        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BusinessRuleException("Usuario no autenticado"));

        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice", request.getInvoiceId()));

        validateInvoiceOwnership(invoice, userLogin);

        if (InvoiceStatus.PAID.equals(invoice.getStatus())) {
            throw new BusinessRuleException("La factura ya ha sido pagada.");
        }

        try {
            OrderRequest orderRequest = new OrderRequest.Builder(
                CheckoutPaymentIntent.CAPTURE,
                Collections.singletonList(
                    new PurchaseUnitRequest.Builder(
                        new AmountWithBreakdown.Builder(
                            invoice.getCurrency(),
                            invoice.getTotalAmount().toString()
                        ).build()
                    )
                    .referenceId(invoice.getCode())
                    .description("Pago de factura " + invoice.getCode())
                    .build()
                )
            ).build();

            CreateOrderInput createOrderInput = new CreateOrderInput.Builder("application/json", orderRequest).build();
            Order order = paypalClient.getOrdersController().createOrder(createOrderInput).getResult();

            return new PaymentResponse(
                (Long) null,            // id
                (Instant) null,         // date
                invoice.getTotalAmount(), // amount
                "PAYPAL",               // method
                (String) null,          // referenceId
                invoice.getId(),        // invoiceId
                order.getId()           // paypalOrderId
            );

        } catch (ApiException e) {
            log.error("Error al crear orden en PayPal. Status: {}, Response: {}", e.getResponseCode(), e.getHttpContext().getResponse().getRawBody());
            throw new BadRequestAlertException("No se pudo iniciar el pago con PayPal: " + e.getMessage(), "payment", "paypalinitfailed");
        } catch (IOException e) {
            log.error("Error de IO al crear orden en PayPal", e);
            throw new BadRequestAlertException("Error de conexión con PayPal", "payment", "paypalinitfailed");
        }
    }

    /**
     * Captura el pago de una orden de PayPal previamente autorizada.
     */
    public PaymentResponse capturePayment(PaymentCaptureRequest request) {
        log.debug("Capturando pago PayPal: {} para factura ID: {}", request.getPaypalOrderId(), request.getInvoiceId());

        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BusinessRuleException("Usuario no autenticado"));

        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice", request.getInvoiceId()));

        validateInvoiceOwnership(invoice, userLogin);

        try {
            CaptureOrderInput captureOrderInput = new CaptureOrderInput.Builder(request.getPaypalOrderId(), "application/json").build();
            Order order = paypalClient.getOrdersController()
                .captureOrder(captureOrderInput)
                .getResult();

            if ("COMPLETED".equals(String.valueOf(order.getStatus()))) {
                // Security Validation: Verify captured amount matches Invoice Total
                // Fallback check: Compare Order PurchaseUnit Amount if available
                if (order.getPurchaseUnits() != null && !order.getPurchaseUnits().isEmpty()) {
                     var purchaseUnit = order.getPurchaseUnits().get(0);
                     if (purchaseUnit.getAmount() != null && purchaseUnit.getAmount().getValue() != null) {
                         String orderAmountStr = purchaseUnit.getAmount().getValue();
                         java.math.BigDecimal orderAmount = new java.math.BigDecimal(orderAmountStr);
                         
                         if (orderAmount.compareTo(invoice.getTotalAmount()) != 0) {
                             log.error("Payment Amount Mismatch Audit: Order {} Amount {} != Invoice {} Amount {}", 
                                 order.getId(), orderAmount, invoice.getId(), invoice.getTotalAmount());
                             throw new BusinessRuleException("Error de Seguridad: El monto cobrado por PayPal no coincide con el total de la factura.");
                         }
                     } else {
                         log.warn("PayPal response did not include amount in PurchaseUnit for order: {}", order.getId());
                     }
                }

                Payment payment = new Payment();
                payment.setDate(Instant.now());
                payment.setAmount(invoice.getTotalAmount());
                payment.setMethod(PaymentMethod.PAYPAL);
                payment.setReferenceId(order.getId());
                payment.setInvoice(invoice);

                payment = paymentRepository.save(payment);

                invoice.setStatus(InvoiceStatus.PAID);
                
                // Confirm the booking upon payment
                if (invoice.getBooking() != null) {
                    Booking booking = invoice.getBooking();
                    if (!BookingStatus.CANCELLED.equals(booking.getStatus())) {
                        booking.setStatus(BookingStatus.CONFIRMED);
                    }
                }
                
                invoiceRepository.save(invoice);

                // Enviar Correo de Pago Exitoso (Async) 
                if (invoice.getBooking() != null && invoice.getBooking().getCustomer() != null) {
                    try {
                        mailService.sendPaymentSuccessEmail(invoice.getBooking().getCustomer(), invoice);
                    } catch (Exception e) {
                        log.warn("Fallo el envio de correo de pago exitoso para factura: {}", invoice.getCode(), e);
                    }
                }

                return new PaymentResponse(
                    payment.getId(),
                    payment.getDate(),
                    payment.getAmount(),
                    payment.getMethod() != null ? payment.getMethod().name() : "PAYPAL",
                    payment.getReferenceId(),
                    invoice.getId(),
                    order.getId()
                );
            } else {
                log.warn("El pago no se completó. Estado: {}", order.getStatus());
                throw new BusinessRuleException("El pago no fue completado por PayPal.");
            }

        } catch (ApiException e) {
            log.error("Error al capturar pago en PayPal. Status: {}, Response: {}", e.getResponseCode(), e.getHttpContext().getResponse().getRawBody());
            throw new BadRequestAlertException("Error al procesar el pago con PayPal: " + e.getMessage(), "payment", "paypalcapturefailed");
        } catch (IOException e) {
            log.error("Error de IO al capturar pago en PayPal", e);
            throw new BadRequestAlertException("Error de conexión con PayPal", "payment", "paypalcapturefailed");
        }
    }

    private void validateInvoiceOwnership(Invoice invoice, String userLogin) {
        if (invoice.getBooking() == null || 
            invoice.getBooking().getCustomer() == null || 
            invoice.getBooking().getCustomer().getUser() == null || 
            !invoice.getBooking().getCustomer().getUser().getLogin().equals(userLogin)) {
            
            throw new BusinessRuleException("No tiene permisos para acceder a esta factura.");
        }
    }
}
