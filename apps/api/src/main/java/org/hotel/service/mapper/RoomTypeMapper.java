package org.hotel.service.mapper;

import org.hotel.domain.RoomType;
import org.hotel.service.dto.RoomTypeDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link RoomType} and its DTO {@link RoomTypeDTO}.
 */
@Mapper(componentModel = "spring")
public interface RoomTypeMapper extends EntityMapper<RoomTypeDTO, RoomType> {}
