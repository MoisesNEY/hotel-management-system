package org.hotel.service.mapper.client;

import org.hotel.domain.Booking;
import org.hotel.domain.CustomerDetails;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsCreateRequest;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsUpdateRequest;
import org.hotel.service.dto.client.response.customerdetails.CustomerDetailsResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ClientCustomerDetailsMapper {

    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    CustomerDetailsResponse toClientResponse(CustomerDetails customerDetails);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    CustomerDetails toEntity(CustomerDetailsCreateRequest customerDetailsCreateRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDto(CustomerDetailsUpdateRequest customerDetailsUpdateRequest, @MappingTarget CustomerDetails customerDetails);

}
