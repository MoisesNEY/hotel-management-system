package org.hotel.service.mapper.client;

import org.hotel.domain.ServiceRequest;
import org.hotel.service.dto.client.request.servicerequest.ServiceRequestCreateRequest;
import org.hotel.service.dto.client.response.servicerequest.ServiceRequestResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClientServiceRequestMapper {
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceCost", source = "service.cost")
    @Mapping(target = "serviceName", source = "service.name")
    @Mapping(target = "bookingId", source = "booking.id")
    ServiceRequestResponse toClientResponse(ServiceRequest serviceRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "requestDate", ignore = true) // En service (Instant.now())

    @Mapping(target = "status", constant = "OPEN")

    // Asignar manualmente en el Service después de validarlas.
    @Mapping(target = "service", ignore = true)
    @Mapping(target = "booking", ignore = true)
    ServiceRequest toEntity(ServiceRequestCreateRequest serviceRequestCreateRequest);
}
