package org.hotel.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.hotel.repository.BookingRepository;
import org.hotel.service.BookingQueryService;
import org.hotel.service.BookingService;
import org.hotel.service.criteria.BookingCriteria;
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

    private final BookingQueryService bookingQueryService;
    private final EmployeeBookingService employeeBookingService;

    public BookingResource(BookingService bookingService, 
                           BookingRepository bookingRepository, 
                           BookingQueryService bookingQueryService,
                           EmployeeBookingService employeeBookingService) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.bookingQueryService = bookingQueryService;
        this.employeeBookingService = employeeBookingService;
    }

    /**
     * {@code POST  /bookings} : Create a new booking.
     *
     * @param bookingDTO the bookingDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new bookingDTO, or with status {@code 400 (Bad Request)} if the booking has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingDTO bookingDTO) throws URISyntaxException {
        LOG.debug("REST request to save Booking : {}", bookingDTO);
        if (bookingDTO.getId() != null) {
            throw new BadRequestAlertException("A new booking cannot already have an ID", ENTITY_NAME, "idexists");
        }
        bookingDTO = bookingService.save(bookingDTO);
        return ResponseEntity.created(new URI("/api/bookings/" + bookingDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, bookingDTO.getId().toString()))
            .body(bookingDTO);
    }

    /**
     * {@code POST /bookings/walk-in} : Create a booking from Walk-In Wizard.
     */
    @PostMapping("/walk-in")
    public ResponseEntity<BookingDTO> createWalkInBooking(@Valid @RequestBody BookingDTO bookingDTO) throws URISyntaxException {
        LOG.debug("REST request to save Walk-In Booking : {}", bookingDTO);
         if (bookingDTO.getId() != null) {
            throw new BadRequestAlertException("A new booking cannot already have an ID", ENTITY_NAME, "idexists");
        }
        // Force status if not provided, though service handles it. 
        // Walk-in usually implies on-site, so maybe CONFIRMED? 
        // Wizard sends 'PENDING_PAYMENT'.
        
        bookingDTO = bookingService.save(bookingDTO);
        return ResponseEntity.created(new URI("/api/bookings/" + bookingDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, bookingDTO.getId().toString()))
            .body(bookingDTO);
    }

    /**
     * {@code PUT  /bookings/:id} : Updates an existing booking.
     *
     * @param id the id of the bookingDTO to save.
     * @param bookingDTO the bookingDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bookingDTO,
     * or with status {@code 400 (Bad Request)} if the bookingDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the bookingDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> updateBooking(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody BookingDTO bookingDTO
    ) throws URISyntaxException {
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
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, bookingDTO.getId().toString()))
            .body(bookingDTO);
    }

    /**
     * {@code PATCH  /bookings/:id} : Partial updates given fields of an existing booking, field will ignore if it is null
     *
     * @param id the id of the bookingDTO to save.
     * @param bookingDTO the bookingDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bookingDTO,
     * or with status {@code 400 (Bad Request)} if the bookingDTO is not valid,
     * or with status {@code 404 (Not Found)} if the bookingDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the bookingDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<BookingDTO> partialUpdateBooking(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody BookingDTO bookingDTO
    ) throws URISyntaxException {
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
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, bookingDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /bookings} : get all the bookings.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of bookings in body.
     */
    @GetMapping("")
    public ResponseEntity<List<BookingDTO>> getAllBookings(
        BookingCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get Bookings by criteria: {}", criteria);

        Page<BookingDTO> page = bookingQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /bookings/count} : count all the bookings.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countBookings(BookingCriteria criteria) {
        LOG.debug("REST request to count Bookings by criteria: {}", criteria);
        return ResponseEntity.ok().body(bookingQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /bookings/:id} : get the "id" booking.
     *
     * @param id the id of the bookingDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the bookingDTO, or with status {@code 404 (Not Found)}.
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
    public ResponseEntity<Void> deleteBooking(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Booking : {}", id);
        String result = bookingService.delete(id);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createAlert(applicationName, result, id.toString()))
            .build();
    }

    /**
     * {@code PATCH  /bookings/:id/assign-room} : Assign a room to a booking item.
     *
     * @param id the id of the booking.
     * @param request the assignment request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bookingDTO.
     */
    @PatchMapping("/{id}/assign-room")
    public ResponseEntity<BookingDTO> assignRoom(
        @PathVariable("id") Long id,
        @Valid @RequestBody AssignRoomRequest request
    ) {
        LOG.debug("REST request to assign room to booking item : {} , {}", id, request);
        BookingDTO result = employeeBookingService.assignRoom(id, request);
        return ResponseEntity.ok(result);
    }

    /**
     * {@code PATCH  /bookings/:id/check-in} : Perform check-in for a booking.
     *
     * @param id the id of the booking.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bookingDTO.
     */
    @PatchMapping("/{id}/check-in")
    public ResponseEntity<BookingDTO> checkIn(@PathVariable("id") Long id) {
        LOG.debug("REST request to check-in booking : {}", id);
        BookingDTO result = employeeBookingService.checkIn(id);
        return ResponseEntity.ok(result);
    }

    /**
     * {@code PATCH  /bookings/:id/check-out} : Perform check-out for a booking.
     *
     * @param id the id of the booking.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bookingDTO.
     */
    @PatchMapping("/{id}/check-out")
    public ResponseEntity<BookingDTO> checkOut(@PathVariable("id") Long id) {
        LOG.debug("REST request to check-out booking : {}", id);
        BookingDTO result = employeeBookingService.checkOut(id);
        return ResponseEntity.ok(result);
    }



    /**
     * {@code PATCH /:id/approve} : Approve a booking.
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<BookingDTO> approveBooking(@PathVariable("id") Long id) {
        LOG.debug("REST request to approve Booking : {}", id);
        BookingDTO result = bookingService.approveBooking(id);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .body(result);
    }
}
