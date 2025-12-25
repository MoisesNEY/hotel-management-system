package org.hotel.service.mapper;

import org.hotel.domain.Booking;
import org.hotel.domain.Invoice;
import org.hotel.domain.Payment;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.InvoiceDTO;
import org.hotel.service.dto.PaymentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Payment} and its DTO {@link PaymentDTO}.
 */
@Mapper(componentModel = "spring", uses = { CustomerMapper.class })
public interface PaymentMapper extends EntityMapper<PaymentDTO, Payment> {
    @Mapping(target = "invoice", source = "invoice", qualifiedByName = "invoiceWithBooking")
    PaymentDTO toDto(Payment s);

    @Named("invoiceWithBooking")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    @Mapping(target = "booking", source = "booking", qualifiedByName = "bookingWithCustomer")
    InvoiceDTO toDtoInvoiceWithBooking(Invoice invoice);

    @Named("bookingWithCustomer")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "customer", source = "customer")
    BookingDTO toDtoBookingWithCustomer(Booking booking);
}
