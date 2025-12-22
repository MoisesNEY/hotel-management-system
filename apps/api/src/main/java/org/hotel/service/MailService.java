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
import org.springframework.context.MessageSource;
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
    private final MessageSource messageSource;
    private final SpringTemplateEngine templateEngine;
    private final org.hotel.repository.UserRepository userRepository;

    public MailService(
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine,
        org.hotel.repository.UserRepository userRepository
    ) {
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
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
    public void sendBookingCreationEmail(User user, Booking booking) {
        log.debug("Sending booking creation email to '{}'", user.getEmail());
        
        // Fetch user with authorities to avoid LazyInitializationException in template
        User userWithAuthorities = userRepository.findOneWithAuthoritiesByLogin(user.getLogin()).orElse(user);
        
        Context context = new Context(Locale.forLanguageTag(userWithAuthorities.getLangKey() != null ? userWithAuthorities.getLangKey() : "es"));
        context.setVariable(USER, userWithAuthorities);
        context.setVariable("booking", booking);
        context.setVariable(BASE_URL, "http://localhost:5173");
        String content = templateEngine.process("mail/bookingConfirmation", context);
        String subject = "Recibimos tu solicitud de reserva - Hotel App";
        sendEmail(userWithAuthorities.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendPaymentSuccessEmail(User user, Invoice invoice) {
        log.debug("Sending payment success email to '{}'", user.getEmail());
        
        // Fetch user with authorities to avoid LazyInitializationException in template
        User userWithAuthorities = userRepository.findOneWithAuthoritiesByLogin(user.getLogin()).orElse(user);

        Context context = new Context(Locale.forLanguageTag(userWithAuthorities.getLangKey() != null ? userWithAuthorities.getLangKey() : "es"));
        context.setVariable(USER, userWithAuthorities);
        context.setVariable("invoice", invoice);
        context.setVariable(BASE_URL, "http://localhost:5173");
        String content = templateEngine.process("mail/paymentSuccess", context);
        String subject = "Pago Confirmado - ¡Tu viaje está listo!";
        sendEmail(userWithAuthorities.getEmail(), subject, content, false, true);
    }
}
