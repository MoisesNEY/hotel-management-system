package org.hotel.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.service.RoomTypeService;
import org.hotel.service.dto.RoomTypeDTO;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.hotel.domain.RoomType}.
 */
@RestController
@RequestMapping("/api/room-types")
public class RoomTypeResource {

    private static final Logger LOG = LoggerFactory.getLogger(RoomTypeResource.class);

    private static final String ENTITY_NAME = "hotelBackendRoomType";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RoomTypeService roomTypeService;

    private final RoomTypeRepository roomTypeRepository;

    public RoomTypeResource(RoomTypeService roomTypeService, RoomTypeRepository roomTypeRepository) {
        this.roomTypeService = roomTypeService;
        this.roomTypeRepository = roomTypeRepository;
    }

    /**
     * {@code POST  /room-types} : Create a new roomType.
     *
     * @param roomTypeDTO the roomTypeDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new roomTypeDTO, or with status {@code 400 (Bad Request)} if the roomType has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<RoomTypeDTO> createRoomType(@Valid @RequestBody RoomTypeDTO roomTypeDTO) throws URISyntaxException {
        LOG.debug("REST request to save RoomType : {}", roomTypeDTO);
        if (roomTypeDTO.getId() != null) {
            throw new BadRequestAlertException("A new roomType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        roomTypeDTO = roomTypeService.save(roomTypeDTO);
        return ResponseEntity.created(new URI("/api/room-types/" + roomTypeDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, roomTypeDTO.getId().toString()))
            .body(roomTypeDTO);
    }

    /**
     * {@code PUT  /room-types/:id} : Updates an existing roomType.
     *
     * @param id the id of the roomTypeDTO to save.
     * @param roomTypeDTO the roomTypeDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated roomTypeDTO,
     * or with status {@code 400 (Bad Request)} if the roomTypeDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the roomTypeDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RoomTypeDTO> updateRoomType(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody RoomTypeDTO roomTypeDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update RoomType : {}, {}", id, roomTypeDTO);
        if (roomTypeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, roomTypeDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!roomTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        roomTypeDTO = roomTypeService.update(roomTypeDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, roomTypeDTO.getId().toString()))
            .body(roomTypeDTO);
    }

    /**
     * {@code PATCH  /room-types/:id} : Partial updates given fields of an existing roomType, field will ignore if it is null
     *
     * @param id the id of the roomTypeDTO to save.
     * @param roomTypeDTO the roomTypeDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated roomTypeDTO,
     * or with status {@code 400 (Bad Request)} if the roomTypeDTO is not valid,
     * or with status {@code 404 (Not Found)} if the roomTypeDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the roomTypeDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<RoomTypeDTO> partialUpdateRoomType(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody RoomTypeDTO roomTypeDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update RoomType partially : {}, {}", id, roomTypeDTO);
        if (roomTypeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, roomTypeDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!roomTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<RoomTypeDTO> result = roomTypeService.partialUpdate(roomTypeDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, roomTypeDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /room-types} : get all the roomTypes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of roomTypes in body.
     */
    @GetMapping("")
    public List<RoomTypeDTO> getAllRoomTypes() {
        LOG.debug("REST request to get all RoomTypes");
        return roomTypeService.findAll();
    }

    /**
     * {@code GET  /room-types/:id} : get the "id" roomType.
     *
     * @param id the id of the roomTypeDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the roomTypeDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeDTO> getRoomType(@PathVariable("id") Long id) {
        LOG.debug("REST request to get RoomType : {}", id);
        Optional<RoomTypeDTO> roomTypeDTO = roomTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(roomTypeDTO);
    }

    /**
     * {@code DELETE  /room-types/:id} : delete the "id" roomType.
     *
     * @param id the id of the roomTypeDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete RoomType : {}", id);
        roomTypeService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
