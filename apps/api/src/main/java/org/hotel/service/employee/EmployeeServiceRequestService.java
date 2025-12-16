package org.hotel.service.employee;

import org.hotel.domain.ServiceRequest;
import org.hotel.repository.ServiceRequestRepository;
import org.hotel.service.dto.ServiceRequestDTO;
import org.hotel.service.dto.employee.request.servicerequest.ServiceRequestStatusUpdateRequest;
import org.hotel.service.mapper.ServiceRequestMapper;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeServiceRequestService {
    private final Logger log = LoggerFactory.getLogger(EmployeeServiceRequestService.class);
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceRequestMapper serviceRequestMapper;

    public EmployeeServiceRequestService(ServiceRequestMapper serviceRequestMapper, ServiceRequestRepository serviceRequestRepository) {
        this.serviceRequestMapper = serviceRequestMapper;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    public ServiceRequestDTO updateStatus(Long serviceRequestId, ServiceRequestStatusUpdateRequest request) {
        log.debug("Request to update ServiceRequest : {} with status {}", serviceRequestId, request.getStatus());
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId).
            orElseThrow(() -> new ResourceNotFoundException("Solicitud de servicio", serviceRequestId));
        serviceRequest.setStatus(request.getStatus());
        return serviceRequestMapper.toDto(serviceRequestRepository.save(serviceRequest));
    }
}
