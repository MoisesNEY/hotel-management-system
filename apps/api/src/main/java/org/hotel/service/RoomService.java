package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.Room;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.service.dto.RoomDTO;
import org.hotel.service.mapper.RoomMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        validateIfRoomNumberExists(room.getRoomNumber());
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
        validateIfRoomNumberExists(room.getRoomNumber());
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
            validateIfRoomNumberExists(roomDTO.getRoomNumber());
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
        if(bookingRepository.existsActiveBookingForRoom(id)) {
            throw new BadRequestAlertException("No se puede borrar la habitación, tiene reservas asociadas", "room", "roomHasBookings");
        }
        roomRepository.deleteById(id);
    }
    private void validateIfRoomNumberExists(String roomNumber) {
        if(roomRepository.existsByRoomNumber(roomNumber))
            throw new BadRequestAlertException("El numero de habitación ya existe",
                "room", "roomNumberAlreadyExists");
    }
    private void validateIfRoomTypeExists(Long roomTypeId) {
        if(!roomTypeRepository.existsById(roomTypeId))
            throw new BadRequestAlertException("Tipo de habitación no encontrado",
                "room", "roomTypeNotFound");
    }

}
