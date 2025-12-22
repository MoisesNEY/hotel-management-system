package org.hotel.service;

import java.util.Optional;

import org.hotel.domain.Booking;
import org.hotel.domain.Payment;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.domain.enumeration.InvoiceStatus;
import org.hotel.repository.InvoiceRepository;
import org.hotel.repository.PaymentRepository;
import org.hotel.service.dto.PaymentDTO;
import org.hotel.service.mapper.PaymentMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.Payment}.
 */
@Service
@Transactional
public class PaymentService {

    private static final Logger LOG = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    private final PaymentMapper paymentMapper;
    
    private final MailService mailService;

    public PaymentService(PaymentRepository paymentRepository, org.hotel.repository.InvoiceRepository invoiceRepository, PaymentMapper paymentMapper, MailService mailService) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentMapper = paymentMapper;
        this.mailService = mailService;
    }

    /**
     * Save a payment.
     *
     * @param paymentDTO the entity to save.
     * @return the persisted entity.
     */
    public PaymentDTO save(PaymentDTO paymentDTO) {
        LOG.debug("Request to save Payment : {}", paymentDTO);
        Payment payment = paymentMapper.toEntity(paymentDTO);
        
        // Logic to Confirm Booking & Invoice
        if (payment.getInvoice() != null && payment.getInvoice().getId() != null) {
            invoiceRepository.findById(payment.getInvoice().getId()).ifPresent(invoice -> {
                // 1. Mark Invoice as PAID
                invoice.setStatus(InvoiceStatus.PAID);
                
                // 2. Mark Booking as CONFIRMED
                if (invoice.getBooking() != null) {
                    Booking booking = invoice.getBooking();
                    // Solo confirmar si no estaba ya cancelada (aunque el flujo normal no debería permitirlo)
                    if (!BookingStatus.CANCELLED.equals(booking.getStatus())) {
                        booking.setStatus(BookingStatus.CONFIRMED);
                    }
                }
                
                // 3. Save Invoice (and Booking via cascade or transactional context)
                invoiceRepository.save(invoice);
                
                // Refresh payment invoice reference to be safe
                payment.setInvoice(invoice);
            });
        }

        Payment savedPayment = paymentRepository.save(payment);
        
        // Send Email if linked to an invoice with a user
        try {
            if (savedPayment.getInvoice() != null) {
                 invoiceRepository.findById(savedPayment.getInvoice().getId()).ifPresent(invoice -> {
                     if (invoice.getBooking() != null && invoice.getBooking().getCustomer() != null) {
                         mailService.sendPaymentSuccessEmail(invoice.getBooking().getCustomer(), invoice);
                     }
                 });
            }
        } catch (Exception e) {
            LOG.warn("Failed to send payment success email for payment {}", savedPayment.getId(), e);
        }
        
        return paymentMapper.toDto(savedPayment);
    }

    /**
     * Update a payment.
     *
     * @param paymentDTO the entity to save.
     * @return the persisted entity.
     */
    public PaymentDTO update(PaymentDTO paymentDTO) {
        LOG.debug("Request to update Payment : {}", paymentDTO);
        Payment payment = paymentMapper.toEntity(paymentDTO);
        payment = paymentRepository.save(payment);
        return paymentMapper.toDto(payment);
    }

    /**
     * Partially update a payment.
     *
     * @param paymentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PaymentDTO> partialUpdate(PaymentDTO paymentDTO) {
        LOG.debug("Request to partially update Payment : {}", paymentDTO);

        return paymentRepository
            .findById(paymentDTO.getId())
            .map(existingPayment -> {
                paymentMapper.partialUpdate(existingPayment, paymentDTO);

                return existingPayment;
            })
            .map(paymentRepository::save)
            .map(paymentMapper::toDto);
    }

    /**
     * Get all the payments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<PaymentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Payments");
        return paymentRepository.findAll(pageable).map(paymentMapper::toDto);
    }

    /**
     * Get all the payments with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<PaymentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return paymentRepository.findAllWithEagerRelationships(pageable).map(paymentMapper::toDto);
    }

    /**
     * Get one payment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PaymentDTO> findOne(Long id) {
        LOG.debug("Request to get Payment : {}", id);
        return paymentRepository.findOneWithEagerRelationships(id).map(paymentMapper::toDto);
    }

    /**
     * Delete the payment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Payment : {}", id);
        paymentRepository.deleteById(id);
    }
}
