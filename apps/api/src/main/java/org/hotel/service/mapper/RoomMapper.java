package org.hotel.service.mapper;

import org.hotel.domain.Room;
import org.hotel.domain.RoomType;
import org.hotel.service.dto.RoomDTO;
import org.hotel.service.dto.RoomTypeDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Room} and its DTO {@link RoomDTO}.
 */
@Mapper(componentModel = "spring")
public interface RoomMapper extends EntityMapper<RoomDTO, Room> {
    @Mapping(target = "roomType", source = "roomType", qualifiedByName = "roomTypeName")
    RoomDTO toDto(Room s);

    @Named("roomTypeName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    RoomTypeDTO toDtoRoomTypeName(RoomType roomType);
}
