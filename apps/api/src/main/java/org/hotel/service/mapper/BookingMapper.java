package org.hotel.service.mapper;

import java.math.BigDecimal;
import org.hotel.domain.Booking;
import org.hotel.domain.User;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Booking} and its DTO {@link BookingDTO}.
 */
@Mapper(componentModel = "spring", uses = { BookingItemMapper.class })
public interface BookingMapper extends EntityMapper<BookingDTO, Booking> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "userLoginToEntity")
    @Mapping(target = "bookingItems", source = "items")
    Booking toEntity(BookingDTO bookingDTO);

    @Mapping(target = "customer", source = "customer", qualifiedByName = "userLogin")
    @Mapping(target = "items", source = "bookingItems")
    BookingDTO toDto(Booking s);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "customer", source = "customer", qualifiedByName = "userLoginToEntity")
    @Mapping(target = "bookingItems", source = "items")
    void partialUpdate(@MappingTarget Booking entity, BookingDTO dto);

    @Named("userLoginToEntity")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    User toEntityUserLogin(UserDTO userDTO);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "email", source = "email")
    UserDTO toDtoUserLogin(User user);

    @AfterMapping
    default void calculateTotalPrice(Booking booking, @MappingTarget BookingDTO bookingDTO) {
        if (booking.getBookingItems() == null || booking.getBookingItems().isEmpty()) {
            bookingDTO.setTotalPrice(BigDecimal.ZERO);
            return;
        }
        BigDecimal total = booking.getBookingItems().stream()
            .map(item -> item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        bookingDTO.setTotalPrice(total);
    }

    @AfterMapping
    default void linkBookingItems(@MappingTarget Booking booking) {
        if (booking.getBookingItems() != null) {
            booking.getBookingItems().forEach(item -> item.setBooking(booking));
        }
    }
}
