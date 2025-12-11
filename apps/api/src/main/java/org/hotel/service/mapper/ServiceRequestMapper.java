package org.hotel.service.mapper;

import org.hotel.domain.Booking;
import org.hotel.domain.HotelService;
import org.hotel.domain.ServiceRequest;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.HotelServiceDTO;
import org.hotel.service.dto.ServiceRequestDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ServiceRequest} and its DTO {@link ServiceRequestDTO}.
 */
@Mapper(componentModel = "spring")
public interface ServiceRequestMapper extends EntityMapper<ServiceRequestDTO, ServiceRequest> {
    @Mapping(target = "service", source = "service", qualifiedByName = "hotelServiceName")
    @Mapping(target = "booking", source = "booking", qualifiedByName = "bookingId")
    ServiceRequestDTO toDto(ServiceRequest s);

    @Named("hotelServiceName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    HotelServiceDTO toDtoHotelServiceName(HotelService hotelService);

    @Named("bookingId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    BookingDTO toDtoBookingId(Booking booking);
}
