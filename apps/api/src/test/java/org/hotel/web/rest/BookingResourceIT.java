package org.hotel.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hotel.domain.BookingAsserts.*;
import static org.hotel.web.rest.TestUtil.createUpdateProxyForBean;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.hotel.IntegrationTest;
import org.hotel.domain.Booking;
import org.hotel.domain.User;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.UserRepository;
import org.hotel.service.BookingService;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.mapper.BookingMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link BookingResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class BookingResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_CHECK_IN_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_CHECK_IN_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_CHECK_IN_DATE = LocalDate.ofEpochDay(-1L);

    private static final LocalDate DEFAULT_CHECK_OUT_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_CHECK_OUT_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_CHECK_OUT_DATE = LocalDate.ofEpochDay(-1L);

    private static final Integer DEFAULT_GUEST_COUNT = 1;
    private static final Integer UPDATED_GUEST_COUNT = 2;
    private static final Integer SMALLER_GUEST_COUNT = 1 - 1;

    private static final BookingStatus DEFAULT_STATUS = BookingStatus.PENDING_APPROVAL;
    private static final BookingStatus UPDATED_STATUS = BookingStatus.CONFIRMED;

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String DEFAULT_SPECIAL_REQUESTS = "AAAAAAAAAA";
    private static final String UPDATED_SPECIAL_REQUESTS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/bookings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepositoryMock;

    @Autowired
    private BookingMapper bookingMapper;

    @Mock
    private BookingService bookingServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restBookingMockMvc;

    private Booking booking;

    private Booking insertedBooking;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Booking createEntity(EntityManager em) {
        Booking booking = new Booking()
            .code(DEFAULT_CODE)
            .checkInDate(DEFAULT_CHECK_IN_DATE)
            .checkOutDate(DEFAULT_CHECK_OUT_DATE)
            .guestCount(DEFAULT_GUEST_COUNT)
            .status(DEFAULT_STATUS)
            .notes(DEFAULT_NOTES)
            .specialRequests(DEFAULT_SPECIAL_REQUESTS);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        booking.setCustomer(user);
        return booking;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Booking createUpdatedEntity(EntityManager em) {
        Booking updatedBooking = new Booking()
            .code(UPDATED_CODE)
            .checkInDate(UPDATED_CHECK_IN_DATE)
            .checkOutDate(UPDATED_CHECK_OUT_DATE)
            .guestCount(UPDATED_GUEST_COUNT)
            .status(UPDATED_STATUS)
            .notes(UPDATED_NOTES)
            .specialRequests(UPDATED_SPECIAL_REQUESTS);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        updatedBooking.setCustomer(user);
        return updatedBooking;
    }

    @BeforeEach
    void initTest() {
        booking = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedBooking != null) {
            bookingRepository.delete(insertedBooking);
            insertedBooking = null;
        }
        userRepository.deleteAll();
    }

    @Test
    @Transactional
    void createBooking() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Booking
        BookingDTO bookingDTO = bookingMapper.toDto(booking);
        var returnedBookingDTO = om.readValue(
            restBookingMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            BookingDTO.class
        );

        // Validate the Booking in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedBooking = bookingMapper.toEntity(returnedBookingDTO);
        assertBookingUpdatableFieldsEquals(returnedBooking, getPersistedBooking(returnedBooking));

        insertedBooking = returnedBooking;
    }

    @Test
    @Transactional
    void createBookingWithExistingId() throws Exception {
        // Create the Booking with an existing ID
        booking.setId(1L);
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restBookingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setCode(null);

        // Create the Booking, which fails.
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCheckInDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setCheckInDate(null);

        // Create the Booking, which fails.
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCheckOutDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setCheckOutDate(null);

        // Create the Booking, which fails.
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGuestCountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setGuestCount(null);

        // Create the Booking, which fails.
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        booking.setStatus(null);

        // Create the Booking, which fails.
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        restBookingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllBookings() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList
        restBookingMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(booking.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].checkInDate").value(hasItem(DEFAULT_CHECK_IN_DATE.toString())))
            .andExpect(jsonPath("$.[*].checkOutDate").value(hasItem(DEFAULT_CHECK_OUT_DATE.toString())))
            .andExpect(jsonPath("$.[*].guestCount").value(hasItem(DEFAULT_GUEST_COUNT)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)))
            .andExpect(jsonPath("$.[*].specialRequests").value(hasItem(DEFAULT_SPECIAL_REQUESTS)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllBookingsWithEagerRelationshipsIsEnabled() throws Exception {
        when(bookingServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restBookingMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(bookingServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllBookingsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(bookingServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restBookingMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(bookingRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getBooking() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get the booking
        restBookingMockMvc
            .perform(get(ENTITY_API_URL_ID, booking.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(booking.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.checkInDate").value(DEFAULT_CHECK_IN_DATE.toString()))
            .andExpect(jsonPath("$.checkOutDate").value(DEFAULT_CHECK_OUT_DATE.toString()))
            .andExpect(jsonPath("$.guestCount").value(DEFAULT_GUEST_COUNT))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES))
            .andExpect(jsonPath("$.specialRequests").value(DEFAULT_SPECIAL_REQUESTS));
    }

    @Test
    @Transactional
    void getBookingsByIdFiltering() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        Long id = booking.getId();

        defaultBookingFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultBookingFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultBookingFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllBookingsByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where code equals to
        defaultBookingFiltering("code.equals=" + DEFAULT_CODE, "code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllBookingsByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where code in
        defaultBookingFiltering("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE, "code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllBookingsByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where code is not null
        defaultBookingFiltering("code.specified=true", "code.specified=false");
    }

    @Test
    @Transactional
    void getAllBookingsByCodeContainsSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where code contains
        defaultBookingFiltering("code.contains=" + DEFAULT_CODE, "code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllBookingsByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where code does not contain
        defaultBookingFiltering("code.doesNotContain=" + UPDATED_CODE, "code.doesNotContain=" + DEFAULT_CODE);
    }

    @Test
    @Transactional
    void getAllBookingsByCheckInDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkInDate equals to
        defaultBookingFiltering("checkInDate.equals=" + DEFAULT_CHECK_IN_DATE, "checkInDate.equals=" + UPDATED_CHECK_IN_DATE);
    }

    @Test
    @Transactional
    void getAllBookingsByCheckInDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkInDate in
        defaultBookingFiltering(
            "checkInDate.in=" + DEFAULT_CHECK_IN_DATE + "," + UPDATED_CHECK_IN_DATE,
            "checkInDate.in=" + UPDATED_CHECK_IN_DATE
        );
    }

    @Test
    @Transactional
    void getAllBookingsByCheckInDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkInDate is not null
        defaultBookingFiltering("checkInDate.specified=true", "checkInDate.specified=false");
    }

    @Test
    @Transactional
    void getAllBookingsByCheckInDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkInDate is greater than or equal to
        defaultBookingFiltering(
            "checkInDate.greaterThanOrEqual=" + DEFAULT_CHECK_IN_DATE,
            "checkInDate.greaterThanOrEqual=" + UPDATED_CHECK_IN_DATE
        );
    }

    @Test
    @Transactional
    void getAllBookingsByCheckInDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkInDate is less than or equal to
        defaultBookingFiltering(
            "checkInDate.lessThanOrEqual=" + DEFAULT_CHECK_IN_DATE,
            "checkInDate.lessThanOrEqual=" + SMALLER_CHECK_IN_DATE
        );
    }

    @Test
    @Transactional
    void getAllBookingsByCheckInDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkInDate is less than
        defaultBookingFiltering("checkInDate.lessThan=" + UPDATED_CHECK_IN_DATE, "checkInDate.lessThan=" + DEFAULT_CHECK_IN_DATE);
    }

    @Test
    @Transactional
    void getAllBookingsByCheckInDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkInDate is greater than
        defaultBookingFiltering("checkInDate.greaterThan=" + SMALLER_CHECK_IN_DATE, "checkInDate.greaterThan=" + DEFAULT_CHECK_IN_DATE);
    }

    @Test
    @Transactional
    void getAllBookingsByCheckOutDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkOutDate equals to
        defaultBookingFiltering("checkOutDate.equals=" + DEFAULT_CHECK_OUT_DATE, "checkOutDate.equals=" + UPDATED_CHECK_OUT_DATE);
    }

    @Test
    @Transactional
    void getAllBookingsByCheckOutDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkOutDate in
        defaultBookingFiltering(
            "checkOutDate.in=" + DEFAULT_CHECK_OUT_DATE + "," + UPDATED_CHECK_OUT_DATE,
            "checkOutDate.in=" + UPDATED_CHECK_OUT_DATE
        );
    }

    @Test
    @Transactional
    void getAllBookingsByCheckOutDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkOutDate is not null
        defaultBookingFiltering("checkOutDate.specified=true", "checkOutDate.specified=false");
    }

    @Test
    @Transactional
    void getAllBookingsByCheckOutDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkOutDate is greater than or equal to
        defaultBookingFiltering(
            "checkOutDate.greaterThanOrEqual=" + DEFAULT_CHECK_OUT_DATE,
            "checkOutDate.greaterThanOrEqual=" + UPDATED_CHECK_OUT_DATE
        );
    }

    @Test
    @Transactional
    void getAllBookingsByCheckOutDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkOutDate is less than or equal to
        defaultBookingFiltering(
            "checkOutDate.lessThanOrEqual=" + DEFAULT_CHECK_OUT_DATE,
            "checkOutDate.lessThanOrEqual=" + SMALLER_CHECK_OUT_DATE
        );
    }

    @Test
    @Transactional
    void getAllBookingsByCheckOutDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkOutDate is less than
        defaultBookingFiltering("checkOutDate.lessThan=" + UPDATED_CHECK_OUT_DATE, "checkOutDate.lessThan=" + DEFAULT_CHECK_OUT_DATE);
    }

    @Test
    @Transactional
    void getAllBookingsByCheckOutDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where checkOutDate is greater than
        defaultBookingFiltering("checkOutDate.greaterThan=" + SMALLER_CHECK_OUT_DATE, "checkOutDate.greaterThan=" + DEFAULT_CHECK_OUT_DATE);
    }

    @Test
    @Transactional
    void getAllBookingsByGuestCountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where guestCount equals to
        defaultBookingFiltering("guestCount.equals=" + DEFAULT_GUEST_COUNT, "guestCount.equals=" + UPDATED_GUEST_COUNT);
    }

    @Test
    @Transactional
    void getAllBookingsByGuestCountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where guestCount in
        defaultBookingFiltering("guestCount.in=" + DEFAULT_GUEST_COUNT + "," + UPDATED_GUEST_COUNT, "guestCount.in=" + UPDATED_GUEST_COUNT);
    }

    @Test
    @Transactional
    void getAllBookingsByGuestCountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where guestCount is not null
        defaultBookingFiltering("guestCount.specified=true", "guestCount.specified=false");
    }

    @Test
    @Transactional
    void getAllBookingsByGuestCountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where guestCount is greater than or equal to
        defaultBookingFiltering(
            "guestCount.greaterThanOrEqual=" + DEFAULT_GUEST_COUNT,
            "guestCount.greaterThanOrEqual=" + UPDATED_GUEST_COUNT
        );
    }

    @Test
    @Transactional
    void getAllBookingsByGuestCountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where guestCount is less than or equal to
        defaultBookingFiltering("guestCount.lessThanOrEqual=" + DEFAULT_GUEST_COUNT, "guestCount.lessThanOrEqual=" + SMALLER_GUEST_COUNT);
    }

    @Test
    @Transactional
    void getAllBookingsByGuestCountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where guestCount is less than
        defaultBookingFiltering("guestCount.lessThan=" + UPDATED_GUEST_COUNT, "guestCount.lessThan=" + DEFAULT_GUEST_COUNT);
    }

    @Test
    @Transactional
    void getAllBookingsByGuestCountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where guestCount is greater than
        defaultBookingFiltering("guestCount.greaterThan=" + SMALLER_GUEST_COUNT, "guestCount.greaterThan=" + DEFAULT_GUEST_COUNT);
    }

    @Test
    @Transactional
    void getAllBookingsByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where status equals to
        defaultBookingFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllBookingsByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where status in
        defaultBookingFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllBookingsByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where status is not null
        defaultBookingFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllBookingsByNotesIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where notes equals to
        defaultBookingFiltering("notes.equals=" + DEFAULT_NOTES, "notes.equals=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllBookingsByNotesIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where notes in
        defaultBookingFiltering("notes.in=" + DEFAULT_NOTES + "," + UPDATED_NOTES, "notes.in=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllBookingsByNotesIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where notes is not null
        defaultBookingFiltering("notes.specified=true", "notes.specified=false");
    }

    @Test
    @Transactional
    void getAllBookingsByNotesContainsSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where notes contains
        defaultBookingFiltering("notes.contains=" + DEFAULT_NOTES, "notes.contains=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllBookingsByNotesNotContainsSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where notes does not contain
        defaultBookingFiltering("notes.doesNotContain=" + UPDATED_NOTES, "notes.doesNotContain=" + DEFAULT_NOTES);
    }

    @Test
    @Transactional
    void getAllBookingsBySpecialRequestsIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where specialRequests equals to
        defaultBookingFiltering("specialRequests.equals=" + DEFAULT_SPECIAL_REQUESTS, "specialRequests.equals=" + UPDATED_SPECIAL_REQUESTS);
    }

    @Test
    @Transactional
    void getAllBookingsBySpecialRequestsIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where specialRequests in
        defaultBookingFiltering(
            "specialRequests.in=" + DEFAULT_SPECIAL_REQUESTS + "," + UPDATED_SPECIAL_REQUESTS,
            "specialRequests.in=" + UPDATED_SPECIAL_REQUESTS
        );
    }

    @Test
    @Transactional
    void getAllBookingsBySpecialRequestsIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where specialRequests is not null
        defaultBookingFiltering("specialRequests.specified=true", "specialRequests.specified=false");
    }

    @Test
    @Transactional
    void getAllBookingsBySpecialRequestsContainsSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where specialRequests contains
        defaultBookingFiltering(
            "specialRequests.contains=" + DEFAULT_SPECIAL_REQUESTS,
            "specialRequests.contains=" + UPDATED_SPECIAL_REQUESTS
        );
    }

    @Test
    @Transactional
    void getAllBookingsBySpecialRequestsNotContainsSomething() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        // Get all the bookingList where specialRequests does not contain
        defaultBookingFiltering(
            "specialRequests.doesNotContain=" + UPDATED_SPECIAL_REQUESTS,
            "specialRequests.doesNotContain=" + DEFAULT_SPECIAL_REQUESTS
        );
    }

    @Test
    @Transactional
    void getAllBookingsByCustomerIsEqualToSomething() throws Exception {
        User customer;
        if (TestUtil.findAll(em, User.class).isEmpty()) {
            bookingRepository.saveAndFlush(booking);
            customer = UserResourceIT.createEntity();
        } else {
            customer = TestUtil.findAll(em, User.class).get(0);
        }
        em.persist(customer);
        em.flush();
        booking.setCustomer(customer);
        bookingRepository.saveAndFlush(booking);
        String customerId = customer.getId();
        // Get all the bookingList where customer equals to customerId
        defaultBookingShouldBeFound("customerId.equals=" + customerId);

        // Get all the bookingList where customer equals to "invalid-id"
        defaultBookingShouldNotBeFound("customerId.equals=" + "invalid-id");
    }

    private void defaultBookingFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultBookingShouldBeFound(shouldBeFound);
        defaultBookingShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultBookingShouldBeFound(String filter) throws Exception {
        restBookingMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(booking.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].checkInDate").value(hasItem(DEFAULT_CHECK_IN_DATE.toString())))
            .andExpect(jsonPath("$.[*].checkOutDate").value(hasItem(DEFAULT_CHECK_OUT_DATE.toString())))
            .andExpect(jsonPath("$.[*].guestCount").value(hasItem(DEFAULT_GUEST_COUNT)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)))
            .andExpect(jsonPath("$.[*].specialRequests").value(hasItem(DEFAULT_SPECIAL_REQUESTS)));

        // Check, that the count call also returns 1
        restBookingMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultBookingShouldNotBeFound(String filter) throws Exception {
        restBookingMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restBookingMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingBooking() throws Exception {
        // Get the booking
        restBookingMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingBooking() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the booking
        Booking updatedBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedBooking are not directly saved in db
        em.detach(updatedBooking);
        updatedBooking
            .code(UPDATED_CODE)
            .checkInDate(UPDATED_CHECK_IN_DATE)
            .checkOutDate(UPDATED_CHECK_OUT_DATE)
            .guestCount(UPDATED_GUEST_COUNT)
            .status(UPDATED_STATUS)
            .notes(UPDATED_NOTES)
            .specialRequests(UPDATED_SPECIAL_REQUESTS);
        BookingDTO bookingDTO = bookingMapper.toDto(updatedBooking);

        restBookingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, bookingDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(bookingDTO))
            )
            .andExpect(status().isOk());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedBookingToMatchAllProperties(updatedBooking);
    }

    @Test
    @Transactional
    void putNonExistingBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // Create the Booking
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, bookingDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(bookingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // Create the Booking
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(bookingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // Create the Booking
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bookingDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateBookingWithPatch() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the booking using partial update
        Booking partialUpdatedBooking = new Booking();
        partialUpdatedBooking.setId(booking.getId());

        partialUpdatedBooking.code(UPDATED_CODE).checkInDate(UPDATED_CHECK_IN_DATE).checkOutDate(UPDATED_CHECK_OUT_DATE);

        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBooking.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedBooking))
            )
            .andExpect(status().isOk());

        // Validate the Booking in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBookingUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedBooking, booking), getPersistedBooking(booking));
    }

    @Test
    @Transactional
    void fullUpdateBookingWithPatch() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the booking using partial update
        Booking partialUpdatedBooking = new Booking();
        partialUpdatedBooking.setId(booking.getId());

        partialUpdatedBooking
            .code(UPDATED_CODE)
            .checkInDate(UPDATED_CHECK_IN_DATE)
            .checkOutDate(UPDATED_CHECK_OUT_DATE)
            .guestCount(UPDATED_GUEST_COUNT)
            .status(UPDATED_STATUS)
            .notes(UPDATED_NOTES)
            .specialRequests(UPDATED_SPECIAL_REQUESTS);

        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBooking.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedBooking))
            )
            .andExpect(status().isOk());

        // Validate the Booking in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBookingUpdatableFieldsEquals(partialUpdatedBooking, getPersistedBooking(partialUpdatedBooking));
    }

    @Test
    @Transactional
    void patchNonExistingBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // Create the Booking
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, bookingDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(bookingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // Create the Booking
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(bookingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamBooking() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        booking.setId(longCount.incrementAndGet());

        // Create the Booking
        BookingDTO bookingDTO = bookingMapper.toDto(booking);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBookingMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(bookingDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Booking in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteBooking() throws Exception {
        // Initialize the database
        insertedBooking = bookingRepository.saveAndFlush(booking);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the booking
        restBookingMockMvc
            .perform(delete(ENTITY_API_URL_ID, booking.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return bookingRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Booking getPersistedBooking(Booking booking) {
        return bookingRepository.findById(booking.getId()).orElseThrow();
    }

    protected void assertPersistedBookingToMatchAllProperties(Booking expectedBooking) {
        assertBookingAllPropertiesEquals(expectedBooking, getPersistedBooking(expectedBooking));
    }

    protected void assertPersistedBookingToMatchUpdatableProperties(Booking expectedBooking) {
        assertBookingAllUpdatablePropertiesEquals(expectedBooking, getPersistedBooking(expectedBooking));
    }
}
