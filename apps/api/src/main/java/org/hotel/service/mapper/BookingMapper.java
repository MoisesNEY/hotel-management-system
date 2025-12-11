package org.hotel.service.mapper;

import org.hotel.domain.Booking;
import org.hotel.domain.Room;
import org.hotel.domain.RoomType;
import org.hotel.domain.User;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.RoomDTO;
import org.hotel.service.dto.RoomTypeDTO;
import org.hotel.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Booking} and its DTO {@link BookingDTO}.
 */
@Mapper(componentModel = "spring")
public interface BookingMapper extends EntityMapper<BookingDTO, Booking> {
    @Mapping(target = "roomType", source = "roomType", qualifiedByName = "roomTypeName")
    @Mapping(target = "assignedRoom", source = "assignedRoom", qualifiedByName = "roomRoomNumber")
    @Mapping(target = "customer", source = "customer", qualifiedByName = "userLogin")
    BookingDTO toDto(Booking s);

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

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);
}
