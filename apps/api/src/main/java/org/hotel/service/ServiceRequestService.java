package org.hotel.service;

import java.time.Instant;
import java.util.Optional;
import org.hotel.domain.ServiceRequest;
import org.hotel.domain.enumeration.RequestStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.HotelServiceRepository;
import org.hotel.repository.ServiceRequestRepository;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.ServiceRequestDTO;
import org.hotel.service.mapper.ServiceRequestMapper;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.ServiceRequest}.
 */
@Service
@Transactional
public class ServiceRequestService {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceRequestService.class);

    private final ServiceRequestRepository serviceRequestRepository;
    private final BookingRepository bookingRepository;
    private final HotelServiceRepository hotelServiceRepository;
    private final ServiceRequestMapper serviceRequestMapper;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository, HotelServiceRepository hotelServiceRepository, BookingRepository bookingRepository, ServiceRequestMapper serviceRequestMapper) {
        this.bookingRepository = bookingRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.hotelServiceRepository = hotelServiceRepository;
        this.serviceRequestMapper = serviceRequestMapper;
    }

    /**
     * Save a serviceRequest.
     *
     * @param serviceRequestDTO the entity to save.
     * @return the persisted entity.
     */
    public ServiceRequestDTO save(ServiceRequestDTO serviceRequestDTO) {
        LOG.debug("Request to save ServiceRequest : {}", serviceRequestDTO);
        ServiceRequest serviceRequest = serviceRequestMapper.toEntity(serviceRequestDTO);
        serviceRequest.setRequestDate(Instant.now());
        serviceRequest.setStatus(RequestStatus.OPEN);
        validateBookingStatus(serviceRequest.getBooking().getId());
        validateHotelServiceDisposability(serviceRequest.getService().getId());
        serviceRequest = serviceRequestRepository.save(serviceRequest);
        return serviceRequestMapper.toDto(serviceRequest);
    }

    /**
     * Update a serviceRequest.
     *
     * @param serviceRequestDTO the entity to save.
     * @return the persisted entity.
     */
    public ServiceRequestDTO update(ServiceRequestDTO serviceRequestDTO) {
        LOG.debug("Request to update ServiceRequest : {}", serviceRequestDTO);
        ServiceRequest serviceRequest = serviceRequestMapper.toEntity(serviceRequestDTO);
        validateBookingStatus(serviceRequest.getBooking().getId());
        validateHotelServiceDisposability(serviceRequest.getService().getId());
        serviceRequest = serviceRequestRepository.save(serviceRequest);
        return serviceRequestMapper.toDto(serviceRequest);
    }

    /**
     * Partially update a serviceRequest.
     *
     * @param serviceRequestDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ServiceRequestDTO> partialUpdate(ServiceRequestDTO serviceRequestDTO) {
        LOG.debug("Request to partially update ServiceRequest : {}", serviceRequestDTO);

        return serviceRequestRepository
            .findById(serviceRequestDTO.getId())
            .map(existingServiceRequest -> {
                serviceRequestMapper.partialUpdate(existingServiceRequest, serviceRequestDTO);
                if(serviceRequestDTO.getBooking() != null && serviceRequestDTO.getBooking().getId() != null) {
                    validateBookingStatus(serviceRequestDTO.getBooking().getId());
                }
                if(serviceRequestDTO.getService() != null && serviceRequestDTO.getService().getId() != null) {
                    validateHotelServiceDisposability(serviceRequestDTO.getService().getId());
                }
                return existingServiceRequest;
            })
            .map(serviceRequestRepository::save)
            .map(serviceRequestMapper::toDto);
    }

    /**
     * Get all the serviceRequests.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ServiceRequestDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ServiceRequests");
        return serviceRequestRepository.findAll(pageable).map(serviceRequestMapper::toDto);
    }

    /**
     * Get all the serviceRequests with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ServiceRequestDTO> findAllWithEagerRelationships(Pageable pageable) {
        return serviceRequestRepository.findAllWithEagerRelationships(pageable).map(serviceRequestMapper::toDto);
    }

    /**
     * Get one serviceRequest by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ServiceRequestDTO> findOne(Long id) {
        LOG.debug("Request to get ServiceRequest : {}", id);
        return serviceRequestRepository.findOneWithEagerRelationships(id).map(serviceRequestMapper::toDto);
    }

    /**
     * Delete the serviceRequest by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ServiceRequest : {}", id);
        if (!serviceRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceRequest", id);
        }
        serviceRequestRepository.deleteById(id);
    }
    public void validateBookingStatus(Long bookingId) {
        if(!bookingRepository.existsActiveBookingById(bookingId)) {
            throw new BusinessRuleException("No se pueden crear solicitudes de servicio con el estado de la reserva seleccionada");
        }
    }
    public void validateHotelServiceDisposability(Long hotelServiceId) {
        if(!hotelServiceRepository.existsByIdAndIsAvailableTrue(hotelServiceId)) {
            throw new BusinessRuleException("Servicio de hotel no disponible");
        }
    }
}
