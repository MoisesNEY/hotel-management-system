package org.hotel.service.mapper;

import org.hotel.domain.HotelService;
import org.hotel.service.dto.HotelServiceDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link HotelService} and its DTO {@link HotelServiceDTO}.
 */
@Mapper(componentModel = "spring")
public interface HotelServiceMapper extends EntityMapper<HotelServiceDTO, HotelService> {}
