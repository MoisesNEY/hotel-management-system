package org.hotel.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.hotel.repository.HotelServiceRepository;
import org.hotel.service.HotelServiceQueryService;
import org.hotel.service.HotelServiceService;
import org.hotel.service.criteria.HotelServiceCriteria;
import org.hotel.service.dto.HotelServiceDTO;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.hotel.domain.HotelService}.
 */
@RestController
@RequestMapping("/api/hotel-services")
public class HotelServiceResource {

    private static final Logger LOG = LoggerFactory.getLogger(HotelServiceResource.class);

    private static final String ENTITY_NAME = "hotelBackendHotelService";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HotelServiceService hotelServiceService;

    private final HotelServiceRepository hotelServiceRepository;

    private final HotelServiceQueryService hotelServiceQueryService;

    public HotelServiceResource(
        HotelServiceService hotelServiceService,
        HotelServiceRepository hotelServiceRepository,
        HotelServiceQueryService hotelServiceQueryService
    ) {
        this.hotelServiceService = hotelServiceService;
        this.hotelServiceRepository = hotelServiceRepository;
        this.hotelServiceQueryService = hotelServiceQueryService;
    }

    /**
     * {@code POST  /hotel-services} : Create a new hotelService.
     *
     * @param hotelServiceDTO the hotelServiceDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new hotelServiceDTO, or with status {@code 400 (Bad Request)} if the hotelService has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<HotelServiceDTO> createHotelService(@Valid @RequestBody HotelServiceDTO hotelServiceDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save HotelService : {}", hotelServiceDTO);
        if (hotelServiceDTO.getId() != null) {
            throw new BadRequestAlertException("A new hotelService cannot already have an ID", ENTITY_NAME, "idexists");
        }
        hotelServiceDTO = hotelServiceService.save(hotelServiceDTO);
        return ResponseEntity.created(new URI("/api/hotel-services/" + hotelServiceDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, hotelServiceDTO.getId().toString()))
            .body(hotelServiceDTO);
    }

    /**
     * {@code PUT  /hotel-services/:id} : Updates an existing hotelService.
     *
     * @param id the id of the hotelServiceDTO to save.
     * @param hotelServiceDTO the hotelServiceDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated hotelServiceDTO,
     * or with status {@code 400 (Bad Request)} if the hotelServiceDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the hotelServiceDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<HotelServiceDTO> updateHotelService(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody HotelServiceDTO hotelServiceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update HotelService : {}, {}", id, hotelServiceDTO);
        if (hotelServiceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, hotelServiceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!hotelServiceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        hotelServiceDTO = hotelServiceService.update(hotelServiceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, hotelServiceDTO.getId().toString()))
            .body(hotelServiceDTO);
    }

    /**
     * {@code PATCH  /hotel-services/:id} : Partial updates given fields of an existing hotelService, field will ignore if it is null
     *
     * @param id the id of the hotelServiceDTO to save.
     * @param hotelServiceDTO the hotelServiceDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated hotelServiceDTO,
     * or with status {@code 400 (Bad Request)} if the hotelServiceDTO is not valid,
     * or with status {@code 404 (Not Found)} if the hotelServiceDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the hotelServiceDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<HotelServiceDTO> partialUpdateHotelService(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody HotelServiceDTO hotelServiceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update HotelService partially : {}, {}", id, hotelServiceDTO);
        if (hotelServiceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, hotelServiceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!hotelServiceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<HotelServiceDTO> result = hotelServiceService.partialUpdate(hotelServiceDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, hotelServiceDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /hotel-services} : get all the hotelServices.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of hotelServices in body.
     */
    @GetMapping("")
    public ResponseEntity<List<HotelServiceDTO>> getAllHotelServices(
        HotelServiceCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get HotelServices by criteria: {}", criteria);

        Page<HotelServiceDTO> page = hotelServiceQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /hotel-services/count} : count all the hotelServices.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countHotelServices(HotelServiceCriteria criteria) {
        LOG.debug("REST request to count HotelServices by criteria: {}", criteria);
        return ResponseEntity.ok().body(hotelServiceQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /hotel-services/:id} : get the "id" hotelService.
     *
     * @param id the id of the hotelServiceDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the hotelServiceDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelServiceDTO> getHotelService(@PathVariable("id") Long id) {
        LOG.debug("REST request to get HotelService : {}", id);
        Optional<HotelServiceDTO> hotelServiceDTO = hotelServiceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(hotelServiceDTO);
    }

    /**
     * {@code DELETE  /hotel-services/:id} : delete the "id" hotelService.
     *
     * @param id the id of the hotelServiceDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotelService(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete HotelService : {}", id);
        hotelServiceService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
