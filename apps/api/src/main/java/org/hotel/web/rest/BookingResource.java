package org.hotel.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.hotel.repository.BookingRepository;
import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.BookingService;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.employee.request.booking.AssignRoomRequest;
import org.hotel.service.employee.EmployeeBookingService;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.hotel.domain.Booking}.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingResource {

    private static final Logger LOG = LoggerFactory.getLogger(BookingResource.class);

    private static final String ENTITY_NAME = "hotelBackendBooking";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final EmployeeBookingService employeeBookingService;

    public BookingResource(BookingService bookingService, BookingRepository bookingRepository,
            EmployeeBookingService employeeBookingService) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.employeeBookingService = employeeBookingService;
    }

    /**
     * {@code POST  /bookings} : Create a new booking.
     *
     * @param bookingDTO the bookingDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new bookingDTO, or with status {@code 400 (Bad Request)} if
     *         the booking has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingDTO bookingDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Booking : {}", bookingDTO);
        if (bookingDTO.getId() != null) {
            throw new BadRequestAlertException("A new booking cannot already have an ID", ENTITY_NAME, "idexists");
        }
        bookingDTO = bookingService.save(bookingDTO);
        return ResponseEntity.created(new URI("/api/bookings/" + bookingDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        bookingDTO.getId().toString()))
                .body(bookingDTO);
    }

    /**
     * {@code PUT  /bookings/:id} : Updates an existing booking.
     *
     * @param id         the id of the bookingDTO to save.
     * @param bookingDTO the bookingDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated bookingDTO,
     *         or with status {@code 400 (Bad Request)} if the bookingDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the bookingDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<BookingDTO> updateBooking(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody BookingDTO bookingDTO) throws URISyntaxException {
        LOG.debug("REST request to update Booking : {}, {}", id, bookingDTO);
        if (bookingDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, bookingDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!bookingRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        bookingDTO = bookingService.update(bookingDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        bookingDTO.getId().toString()))
                .body(bookingDTO);
    }

    /**
     * {@code PATCH  /bookings/:id} : Partial updates given fields of an existing
     * booking, field will ignore if it is null
     *
     * @param id         the id of the bookingDTO to save.
     * @param bookingDTO the bookingDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated bookingDTO,
     *         or with status {@code 400 (Bad Request)} if the bookingDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the bookingDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the bookingDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<BookingDTO> partialUpdateBooking(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody BookingDTO bookingDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Booking partially : {}, {}", id, bookingDTO);
        if (bookingDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, bookingDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!bookingRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<BookingDTO> result = bookingService.partialUpdate(bookingDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, bookingDTO.getId().toString()));
    }

    /**
     * {@code GET  /bookings} : get all the bookings.
     *
     * @param pageable  the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is
     *                  applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of bookings in body.
     */
    @GetMapping("")
    public ResponseEntity<List<BookingDTO>> getAllBookings(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get a page of Bookings");
        Page<BookingDTO> page;
        if (eagerload) {
            page = bookingService.findAllWithEagerRelationships(pageable);
        } else {
            page = bookingService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /bookings/:id} : get the "id" booking.
     *
     * @param id the id of the bookingDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the bookingDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBooking(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Booking : {}", id);
        Optional<BookingDTO> bookingDTO = bookingService.findOne(id);
        return ResponseUtil.wrapOrNotFound(bookingDTO);
    }

    /**
     * {@code DELETE  /bookings/:id} : delete the "id" booking.
     *
     * @param id the id of the bookingDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteBooking(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Booking : {}", id);
        bookingService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }

    @PatchMapping("/{id:\\d+}/assign-room")
    public ResponseEntity<BookingDTO> assignRoom(@PathVariable Long id,
            @Valid @RequestBody AssignRoomRequest assignRoomRequest) {
        LOG.debug("REST request to assign room : {}", assignRoomRequest);
        BookingDTO bookingDTO = employeeBookingService.assignRoom(id, assignRoomRequest);
        return ResponseEntity.ok(bookingDTO);
    }

    @PatchMapping("/{id:\\d+}/check-in")
    public ResponseEntity<BookingDTO> checkIn(@PathVariable Long id) {
        LOG.debug("REST request to check In : {}", id);
        BookingDTO bookingDTO = employeeBookingService.checkIn(id);
        return ResponseEntity.ok(bookingDTO);
    }

    @PatchMapping("/{id:\\d+}/check-out")
    public ResponseEntity<BookingDTO> checkOut(@PathVariable Long id) {
        LOG.debug("REST request to check Out : {}", id);
        BookingDTO bookingDTO = employeeBookingService.checkOut(id);
        return ResponseEntity.ok(bookingDTO);
    }
}
