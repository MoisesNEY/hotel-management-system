package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.Room;
import org.hotel.domain.enumeration.RoomStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.service.dto.RoomDTO;
import org.hotel.service.mapper.RoomMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static org.hotel.web.rest.errors.ErrorConstants.ID_NOT_FOUND;

/**
 * Service Implementation for managing {@link org.hotel.domain.Room}.
 */
@Service
@Transactional
public class RoomService {

    private static final Logger LOG = LoggerFactory.getLogger(RoomService.class);

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BookingRepository bookingRepository;
    private final RoomMapper roomMapper;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository, RoomTypeRepository roomTypeRepository, RoomMapper roomMapper) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomMapper = roomMapper;
    }

    /**
     * Save a room.
     *
     * @param roomDTO the entity to save.
     * @return the persisted entity.
     */
    public RoomDTO save(RoomDTO roomDTO) {
        LOG.debug("Request to save Room : {}", roomDTO);
        Room room = roomMapper.toEntity(roomDTO);
        validateIfRoomNumberExists(room.getRoomNumber(), null);
        validateIfRoomTypeExists(room.getRoomType().getId());
        room = roomRepository.save(room);
        return roomMapper.toDto(room);
    }

    /**
     * Update a room.
     *
     * @param roomDTO the entity to save.
     * @return the persisted entity.
     */
    public RoomDTO update(RoomDTO roomDTO) {
        LOG.debug("Request to update Room : {}", roomDTO);
        Room room = roomMapper.toEntity(roomDTO);
        validateIfRoomNumberExists(room.getRoomNumber(), room.getId());
        validateIfRoomTypeExists(room.getRoomType().getId());
        room = roomRepository.save(room);
        return roomMapper.toDto(room);
    }

    /**
     * Partially update a room.
     *
     * @param roomDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<RoomDTO> partialUpdate(RoomDTO roomDTO) {
        LOG.debug("Request to partially update Room : {}", roomDTO);
        if(roomDTO.getRoomNumber() != null) {
            validateIfRoomNumberExists(roomDTO.getRoomNumber(), roomDTO.getId());
        }
        if(roomDTO.getId() != null) {
            validateIfRoomTypeExists(roomDTO.getRoomType().getId());
        }
        return roomRepository
            .findById(roomDTO.getId())
            .map(existingRoom -> {
                roomMapper.partialUpdate(existingRoom, roomDTO);

                return existingRoom;
            })
            .map(roomRepository::save)
            .map(roomMapper::toDto);
    }

    /**
     * Get all the rooms.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<RoomDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Rooms");
        return roomRepository.findAll(pageable).map(roomMapper::toDto);
    }

    /**
     * Get all the rooms with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<RoomDTO> findAllWithEagerRelationships(Pageable pageable) {
        return roomRepository.findAllWithEagerRelationships(pageable).map(roomMapper::toDto);
    }

    /**
     * Get one room by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<RoomDTO> findOne(Long id) {
        LOG.debug("Request to get Room : {}", id);
        return roomRepository.findOneWithEagerRelationships(id).map(roomMapper::toDto);
    }

    /**
     * Delete the room by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Room : {}", id);
        validateRoomForDeletion(id);
        roomRepository.deleteById(id);
    }
    private void validateIfRoomNumberExists(String roomNumber, Long id) {
        boolean exists = (id == null) 
            ? roomRepository.existsByRoomNumber(roomNumber)
            : roomRepository.existsByRoomNumberAndIdNot(roomNumber, id);
            
        if(exists) {
            throw new BusinessRuleException("El número de habitación '" + roomNumber + "' ya está registrado");
        }
    }
    private void validateIfRoomTypeExists(Long roomTypeId) {
        if(!roomTypeRepository.existsById(roomTypeId))
            throw new BadRequestAlertException("Tipo de habitación no encontrado",
                "room", "roomTypeNotFound");
    }
    private void validateRoomForDeletion(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Habitación", roomId));;
        if(bookingRepository.existsActiveBookingForRoom(room.getId())) {
            throw new BusinessRuleException("No se puede borrar la habitación, tiene reservas asociadas");
        }
        if (RoomStatus.OCCUPIED.equals(room.getStatus())) {
            throw new BusinessRuleException("No se puede eliminar la habitación porque está ocupada");
        }
    }

}
