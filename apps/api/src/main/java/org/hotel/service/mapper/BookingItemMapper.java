package org.hotel.service.mapper;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.Room;
import org.hotel.domain.RoomType;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.BookingItemDTO;
import org.hotel.service.dto.RoomDTO;
import org.hotel.service.dto.RoomTypeDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link BookingItem} and its DTO {@link BookingItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface BookingItemMapper extends EntityMapper<BookingItemDTO, BookingItem> {
    @Mapping(target = "roomType", source = "roomType", qualifiedByName = "roomTypeName")
    @Mapping(target = "assignedRoom", source = "assignedRoom", qualifiedByName = "roomRoomNumber")
    @Mapping(target = "booking", source = "booking", qualifiedByName = "bookingCode")
    BookingItemDTO toDto(BookingItem s);

    @Named("roomTypeName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    RoomTypeDTO toDtoRoomTypeName(RoomType roomType);

    @Named("roomRoomNumber")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "roomNumber", source = "roomNumber")
    RoomDTO toDtoRoomRoomNumber(Room room);

    @Named("bookingCode")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    BookingDTO toDtoBookingCode(Booking booking);
}
