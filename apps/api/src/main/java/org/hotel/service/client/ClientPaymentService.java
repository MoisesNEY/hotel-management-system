package org.hotel.service.client;

import org.hotel.domain.Invoice;
import org.hotel.domain.Payment;
import org.hotel.domain.enumeration.InvoiceStatus;
import org.hotel.repository.InvoiceRepository;
import org.hotel.repository.PaymentRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.payment.PaymentCreateRequest;
import org.hotel.service.dto.client.response.payment.PaymentResponse;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ClientPaymentService {

    private final Logger log = LoggerFactory.getLogger(ClientPaymentService.class);

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public ClientPaymentService(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Registra un pago para una factura perteneciente al cliente logueado.
     * Protección estricta contra IDOR.
     */
    public PaymentResponse createPayment(PaymentCreateRequest request) {
        log.debug("Request to create payment : {}", request);

        // 1. Validar Usuario Login
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BusinessRuleException("Usuario no autenticado"));

        // 2. Cargar Factura
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice", request.getInvoiceId()));

        // 3. SEGURIDAD: Verificar que la factura pertenece al usuario logueado
        // La factura tiene booking, booking tiene customer.
        if (invoice.getBooking() == null || !invoice.getBooking().getCustomer().getLogin().equals(userLogin)) {
             throw new BusinessRuleException("No está autorizado para pagar esta factura.");
        }

        // 4. Validar Estado de Factura
        if (InvoiceStatus.PAID.equals(invoice.getStatus()) || InvoiceStatus.CANCELLED.equals(invoice.getStatus())) {
            throw new BusinessRuleException("La factura ya está pagada o cancelada.");
        }

        // 5. Crear Entidad Pago
        Payment payment = new Payment();
        // Usamos Instant.now() para setDate (nombre correcto de entidad)
        payment.setDate(java.time.Instant.now());
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getPaymentMethod()); // Nombre correcto setMethod
        payment.setInvoice(invoice);
        // payment.setStatus(PaymentStatus.COMPLETED); // Entidad Payment NO tiene status, se omite.

        // Guardar
        payment = paymentRepository.save(payment);

        // Actualizar estado de factura
        invoice.setStatus(InvoiceStatus.PAID);
        invoiceRepository.save(invoice);

        // 6. Mapear respuesta sin status
        return new PaymentResponse(
            payment.getId(),
            payment.getDate(), // devuelve Instant
            payment.getAmount(),
            request.getReferenceNumber(),
            invoice.getId().toString()
        );
    }
}
