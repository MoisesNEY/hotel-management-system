package org.hotel.service.mapper;

import org.hotel.domain.CustomerDetails;
import org.hotel.service.dto.CustomerDetailsDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link CustomerDetails} and its DTO {@link CustomerDetailsDTO}.
 */
@Mapper(componentModel = "spring", uses = { UserMapper.class })
public interface CustomerDetailsMapper extends EntityMapper<CustomerDetailsDTO, CustomerDetails> {
    CustomerDetailsDTO toDto(CustomerDetails s);
}
