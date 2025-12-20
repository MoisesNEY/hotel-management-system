package org.hotel.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.hotel.domain.HotelService;
import org.hotel.domain.enumeration.RequestStatus;
import org.hotel.repository.HotelServiceRepository;
import org.hotel.repository.ServiceRequestRepository;
import org.hotel.service.dto.HotelServiceDTO;
import org.hotel.service.mapper.HotelServiceMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.HotelService}.
 */
@Service
@Transactional
public class HotelServiceService {

    private static final Logger LOG = LoggerFactory.getLogger(HotelServiceService.class);

    private final HotelServiceRepository hotelServiceRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final HotelServiceMapper hotelServiceMapper;

    public HotelServiceService(HotelServiceRepository hotelServiceRepository,
                               ServiceRequestRepository serviceRequestRepository,
                               HotelServiceMapper hotelServiceMapper) {
        this.hotelServiceRepository = hotelServiceRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.hotelServiceMapper = hotelServiceMapper;
    }

    public HotelServiceDTO save(HotelServiceDTO hotelServiceDTO) {
        LOG.debug("Request to save HotelService : {}", hotelServiceDTO);
        HotelService hotelService = hotelServiceMapper.toEntity(hotelServiceDTO);
        hotelService = hotelServiceRepository.save(hotelService);
        return hotelServiceMapper.toDto(hotelService);
    }

    public HotelServiceDTO update(HotelServiceDTO hotelServiceDTO) {
        LOG.debug("Request to update HotelService : {}", hotelServiceDTO);
        HotelService hotelService = hotelServiceMapper.toEntity(hotelServiceDTO);
        // Validar Cambio de Precio
        validateChangePrice(!hotelServiceDTO.getCost().equals(hotelService.getCost()),
            serviceRequestRepository.existsByStatusAndServiceId(RequestStatus.OPEN, hotelService.getId()));

        hotelService = hotelServiceRepository.save(hotelService);
        return hotelServiceMapper.toDto(hotelService);
    }

    public Optional<HotelServiceDTO> partialUpdate(HotelServiceDTO hotelServiceDTO) {
        LOG.debug("Request to partially update HotelService : {}", hotelServiceDTO);
        return hotelServiceRepository
            .findById(hotelServiceDTO.getId())
            .map(existingHotelService -> {
                // 2. Validar Cambio de Precio (Partial)
                if(hotelServiceDTO.getCost() != null){
                    validateChangePrice(!hotelServiceDTO.getCost().equals(existingHotelService.getCost()),
                        serviceRequestRepository.existsByStatusAndServiceId(RequestStatus.OPEN, existingHotelService.getId()));
                }
                hotelServiceMapper.partialUpdate(existingHotelService, hotelServiceDTO);
                return existingHotelService;
            })
            .map(hotelServiceRepository::save)
            .map(hotelServiceMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<HotelServiceDTO> findAll() {
        return hotelServiceRepository.findAll().stream().map(hotelServiceMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public Optional<HotelServiceDTO> findOne(Long id) {
        return hotelServiceRepository.findById(id).map(hotelServiceMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete HotelService : {}", id);
        validateHotelServiceForDeletion(id);
        hotelServiceRepository.deleteById(id);
    }
    public void validateChangePrice(boolean isChanged, boolean isRequestOpen) {
        if(isChanged && isRequestOpen) {
            throw new BadRequestAlertException("No puedes cambiar el precio si existe una solicitud de servicio abierta pendiente.", "hotelService", "requestOpen");
        }
    }
    public void validateHotelServiceForDeletion(Long hotelServiceId) {
        if(!hotelServiceRepository.existsById(hotelServiceId)) {
            throw new ResourceNotFoundException("Servicio de hotel", hotelServiceId);
        }
        // TODO: agregar aquí validación si existen ServiceRequests históricos
    }
}
