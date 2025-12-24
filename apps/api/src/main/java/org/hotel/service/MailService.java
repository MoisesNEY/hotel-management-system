package org.hotel.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.hotel.domain.Booking;
import org.hotel.domain.Invoice;
import org.hotel.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

/**
 * Service for sending emails.
 * <p>
 * We use the {@link Async} annotation to send emails asynchronously.
 */
@Service
public class MailService {

    private final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String USER = "user";
    private static final String BASE_URL = "baseUrl";

    private final JavaMailSender javaMailSender;

    private final SpringTemplateEngine templateEngine;
    private final org.hotel.repository.UserRepository userRepository;

    public MailService(
        JavaMailSender javaMailSender,
        SpringTemplateEngine templateEngine,
        org.hotel.repository.UserRepository userRepository
    ) {
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
        this.userRepository = userRepository;
    }

    @Async
    public void sendEmail(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        log.debug("Send email[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
            isMultipart, isHtml, to, subject, content);

        // Prepare message using a Spring helper
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setFrom("Hotel App <noreply@hotelapp.com>");
            message.setSubject(subject);
            message.setText(content, isHtml);
            javaMailSender.send(mimeMessage);
            log.debug("Sent email to User '{}'", to);
        } catch (MessagingException e) {
            log.warn("Email could not be sent to user '{}'", to, e);
        }
    }

    @Async
    public void sendBookingCreationEmail(org.hotel.domain.Customer customer, Booking booking) {
        log.debug("Sending booking creation email to '{}'", customer.getEmail());
        sendCustomerEmail(customer, booking, null, "mail/bookingConfirmation", "Recibimos tu solicitud de reserva - Hotel App");
    }

    @Async
    public void sendPaymentSuccessEmail(org.hotel.domain.Customer customer, Invoice invoice) {
        log.debug("Sending payment success email to '{}'", customer.getEmail());
        sendCustomerEmail(customer, null, invoice, "mail/paymentSuccess", "Pago Confirmado - ¡Tu viaje está listo!");
    }

    @Async
    public void sendBookingApprovedEmail(org.hotel.domain.Customer customer, Booking booking) {
        log.debug("Sending booking approved email to '{}'", customer.getEmail());
        sendCustomerEmail(customer, booking, null, "mail/bookingApproved", "¡Tu reserva ha sido Confirmada! - Hotel App");
    }

    @Async
    public void sendBookingDeclinedEmail(org.hotel.domain.Customer customer, Booking booking) {
        log.debug("Sending booking declined email to '{}'", customer.getEmail());
        sendCustomerEmail(customer, booking, null, "mail/bookingDeclined", "Actualización sobre tu solicitud de reserva - Hotel App");
    }

    private void sendCustomerEmail(org.hotel.domain.Customer customer, Booking booking, Invoice invoice, String templateName, String subject) {
        if (customer.getEmail() == null) {
            log.warn("Customer {} has no email, skipping email sending.", customer.getId());
            return;
        }

        Locale locale = Locale.forLanguageTag("es");
        User user = null;
        if (customer.getUser() != null) {
            // Fetch user with authorities to avoid LazyInitializationException if needed
            user = userRepository.findOneWithAuthoritiesByLogin(customer.getUser().getLogin()).orElse(customer.getUser());
            if (user.getLangKey() != null) {
                locale = Locale.forLanguageTag(user.getLangKey());
            }
        }

        Context context = new Context(locale);
        context.setVariable(USER, customer); // Templates likely use 'user.firstName', which Customer has.
        context.setVariable("account", user); // Pass the User entity (with authorities) for permission checks
        // Also provide 'customer' key just in case
        context.setVariable("customer", customer);

        if (booking != null) context.setVariable("booking", booking);
        if (invoice != null) context.setVariable("invoice", invoice);
        context.setVariable(BASE_URL, "http://localhost:5173");

        String content = templateEngine.process(templateName, context);
        sendEmail(customer.getEmail(), subject, content, false, true);
    }
}
