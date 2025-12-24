package org.hotel.service.mapper;

import org.hotel.domain.Booking;
import org.hotel.domain.Customer;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.CustomerDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Booking} and its DTO {@link BookingDTO}.
 */
@Mapper(componentModel = "spring", uses = { BookingItemMapper.class, CustomerMapper.class }, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingMapper extends EntityMapper<BookingDTO, Booking> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerBasic")
    @Mapping(target = "items", source = "bookingItems")
    BookingDTO toDto(Booking s);

    @Named("customerBasic")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "licenseId", source = "licenseId")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "phone", source = "phone")
    CustomerDTO toDtoCustomerBasic(Customer customer);

    @AfterMapping
    default void calculateTotalPrice(@MappingTarget BookingDTO bookingDTO, Booking booking) {
        if (booking.getBookingItems() != null) {
            java.math.BigDecimal total = booking.getBookingItems().stream()
                .map(org.hotel.domain.BookingItem::getPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            bookingDTO.setTotalPrice(total);
        }
    }

    @AfterMapping
    default void linkBookingItems(@MappingTarget Booking booking) {
        if (booking.getBookingItems() != null) {
            booking.getBookingItems().forEach(item -> item.setBooking(booking));
        }
    }
}
