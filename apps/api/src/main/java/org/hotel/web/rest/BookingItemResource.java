package org.hotel.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.hotel.repository.BookingItemRepository;
import org.hotel.service.BookingItemService;
import org.hotel.service.dto.BookingItemDTO;
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
 * REST controller for managing {@link org.hotel.domain.BookingItem}.
 */
@RestController
@RequestMapping("/api/booking-items")
public class BookingItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(BookingItemResource.class);

    private static final String ENTITY_NAME = "hotelBackendBookingItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final BookingItemService bookingItemService;

    private final BookingItemRepository bookingItemRepository;

    public BookingItemResource(BookingItemService bookingItemService, BookingItemRepository bookingItemRepository) {
        this.bookingItemService = bookingItemService;
        this.bookingItemRepository = bookingItemRepository;
    }

    /**
     * {@code POST  /booking-items} : Create a new bookingItem.
     *
     * @param bookingItemDTO the bookingItemDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new bookingItemDTO, or with status {@code 400 (Bad Request)} if the bookingItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<BookingItemDTO> createBookingItem(@Valid @RequestBody BookingItemDTO bookingItemDTO) throws URISyntaxException {
        LOG.debug("REST request to save BookingItem : {}", bookingItemDTO);
        if (bookingItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new bookingItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        bookingItemDTO = bookingItemService.save(bookingItemDTO);
        return ResponseEntity.created(new URI("/api/booking-items/" + bookingItemDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, bookingItemDTO.getId().toString()))
            .body(bookingItemDTO);
    }

    /**
     * {@code PUT  /booking-items/:id} : Updates an existing bookingItem.
     *
     * @param id the id of the bookingItemDTO to save.
     * @param bookingItemDTO the bookingItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bookingItemDTO,
     * or with status {@code 400 (Bad Request)} if the bookingItemDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the bookingItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookingItemDTO> updateBookingItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody BookingItemDTO bookingItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update BookingItem : {}, {}", id, bookingItemDTO);
        if (bookingItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, bookingItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!bookingItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        bookingItemDTO = bookingItemService.update(bookingItemDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, bookingItemDTO.getId().toString()))
            .body(bookingItemDTO);
    }

    /**
     * {@code PATCH  /booking-items/:id} : Partial updates given fields of an existing bookingItem, field will ignore if it is null
     *
     * @param id the id of the bookingItemDTO to save.
     * @param bookingItemDTO the bookingItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bookingItemDTO,
     * or with status {@code 400 (Bad Request)} if the bookingItemDTO is not valid,
     * or with status {@code 404 (Not Found)} if the bookingItemDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the bookingItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<BookingItemDTO> partialUpdateBookingItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody BookingItemDTO bookingItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update BookingItem partially : {}, {}", id, bookingItemDTO);
        if (bookingItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, bookingItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!bookingItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<BookingItemDTO> result = bookingItemService.partialUpdate(bookingItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, bookingItemDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /booking-items} : get all the bookingItems.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of bookingItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<BookingItemDTO>> getAllBookingItems(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of BookingItems");
        Page<BookingItemDTO> page;
        if (eagerload) {
            page = bookingItemService.findAllWithEagerRelationships(pageable);
        } else {
            page = bookingItemService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /booking-items/:id} : get the "id" bookingItem.
     *
     * @param id the id of the bookingItemDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the bookingItemDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingItemDTO> getBookingItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get BookingItem : {}", id);
        Optional<BookingItemDTO> bookingItemDTO = bookingItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(bookingItemDTO);
    }

    /**
     * {@code DELETE  /booking-items/:id} : delete the "id" bookingItem.
     *
     * @param id the id of the bookingItemDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookingItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete BookingItem : {}", id);
        bookingItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
