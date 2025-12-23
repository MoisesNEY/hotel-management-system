package org.hotel.service.mapper;

import org.hotel.domain.Booking;
import org.hotel.domain.Invoice;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.InvoiceDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Invoice} and its DTO {@link InvoiceDTO}.
 */
@Mapper(componentModel = "spring", uses = { InvoiceItemMapper.class })
public interface InvoiceMapper extends EntityMapper<InvoiceDTO, Invoice> {
    @Mapping(target = "booking", source = "booking", qualifiedByName = "bookingCode")
    @Mapping(target = "items", source = "items")
    InvoiceDTO toDto(Invoice s);

    @Named("bookingCode")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    BookingDTO toDtoBookingCode(Booking booking);
}
