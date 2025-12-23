package org.hotel.service.mapper;

import org.hotel.domain.Booking;
import org.hotel.domain.Customer;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.CustomerDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Booking} and its DTO {@link BookingDTO}.
 */
@Mapper(componentModel = "spring")
public interface BookingMapper extends EntityMapper<BookingDTO, Booking> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerLicenseId")
    BookingDTO toDto(Booking s);

    @Named("customerLicenseId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "licenseId", source = "licenseId")
    CustomerDTO toDtoCustomerLicenseId(Customer customer);
}
