package org.hotel.service.mapper;

import org.hotel.domain.CustomerDetails;
import org.hotel.domain.User;
import org.hotel.service.dto.CustomerDetailsDTO;
import org.hotel.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link CustomerDetails} and its DTO {@link CustomerDetailsDTO}.
 */
@Mapper(componentModel = "spring")
public interface CustomerDetailsMapper extends EntityMapper<CustomerDetailsDTO, CustomerDetails> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userLogin")
    CustomerDetailsDTO toDto(CustomerDetails s);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);
}
