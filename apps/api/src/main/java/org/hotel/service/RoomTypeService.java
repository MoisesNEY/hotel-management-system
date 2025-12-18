package org.hotel.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.hotel.domain.RoomType;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.service.dto.RoomTypeDTO;
import org.hotel.service.mapper.RoomTypeMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.RoomType}.
 */
@Service
@Transactional
public class RoomTypeService {

    private static final Logger LOG = LoggerFactory.getLogger(RoomTypeService.class);

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeMapper roomTypeMapper;

    public RoomTypeService(RoomTypeRepository roomTypeRepository, RoomRepository roomRepository, RoomTypeMapper roomTypeMapper) {
        this.roomTypeRepository = roomTypeRepository;
        this.roomTypeMapper = roomTypeMapper;
        this.roomRepository = roomRepository;
    }

    /**
     * Save a roomType.
     *
     * @param roomTypeDTO the entity to save.
     * @return the persisted entity.
     */
    public RoomTypeDTO save(RoomTypeDTO roomTypeDTO) {
        LOG.debug("Request to save RoomType : {}", roomTypeDTO);
        if (roomTypeRepository.existsByName(roomTypeDTO.getName())) {
            throw new BusinessRuleException("Ya existe un tipo de habitación con el nombre: " + roomTypeDTO.getName());
        }
        RoomType roomType = roomTypeMapper.toEntity(roomTypeDTO);
        roomType = roomTypeRepository.save(roomType);
        return roomTypeMapper.toDto(roomType);
    }

    /**
     * Update a roomType.
     *
     * @param roomTypeDTO the entity to save.
     * @return the persisted entity.
     */
    public RoomTypeDTO update(RoomTypeDTO roomTypeDTO) {
        LOG.debug("Request to update RoomType : {}", roomTypeDTO);
        if (roomTypeRepository.existsByNameAndIdNot(roomTypeDTO.getName(), roomTypeDTO.getId())) {
            throw new BusinessRuleException("Ya existe un tipo de habitación con el nombre: " + roomTypeDTO.getName());
        }
        RoomType roomType = roomTypeMapper.toEntity(roomTypeDTO);
        roomType = roomTypeRepository.save(roomType);
        return roomTypeMapper.toDto(roomType);
    }

    /**
     * Partially update a roomType.
     *
     * @param roomTypeDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<RoomTypeDTO> partialUpdate(RoomTypeDTO roomTypeDTO) {
        LOG.debug("Request to partially update RoomType : {}", roomTypeDTO);

        if (roomTypeDTO.getName() != null && roomTypeRepository.existsByNameAndIdNot(roomTypeDTO.getName(), roomTypeDTO.getId())) {
            throw new BusinessRuleException("Ya existe un tipo de habitación con el nombre: " + roomTypeDTO.getName());
        }

        return roomTypeRepository
            .findById(roomTypeDTO.getId())
            .map(existingRoomType -> {
                roomTypeMapper.partialUpdate(existingRoomType, roomTypeDTO);

                return existingRoomType;
            })
            .map(roomTypeRepository::save)
            .map(roomTypeMapper::toDto);
    }

    /**
     * Get all the roomTypes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<RoomTypeDTO> findAll() {
        LOG.debug("Request to get all RoomTypes");
        return roomTypeRepository.findAll().stream().map(roomTypeMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one roomType by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<RoomTypeDTO> findOne(Long id) {
        LOG.debug("Request to get RoomType : {}", id);
        return roomTypeRepository.findById(id).map(roomTypeMapper::toDto);
    }

    /**
     * Delete the roomType by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete RoomType : {}", id);
        if (!roomTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tipo de habitación", id);
        }
        if (roomRepository.countByRoomTypeId(id) > 0) {
            throw new BusinessRuleException("No se puede borrar el tipo de habitación porque hay habitaciones físicas asociadas.");
        }
        roomTypeRepository.deleteById(id);
    }
}
