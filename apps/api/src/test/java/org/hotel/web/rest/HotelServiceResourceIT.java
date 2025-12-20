package org.hotel.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hotel.domain.HotelServiceAsserts.*;
import static org.hotel.web.rest.TestUtil.createUpdateProxyForBean;
import static org.hotel.web.rest.TestUtil.sameNumber;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.hotel.IntegrationTest;
import org.hotel.domain.HotelService;
import org.hotel.domain.enumeration.ServiceStatus;
import org.hotel.repository.HotelServiceRepository;
import org.hotel.service.dto.HotelServiceDTO;
import org.hotel.service.mapper.HotelServiceMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link HotelServiceResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class HotelServiceResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_COST = new BigDecimal(0);
    private static final BigDecimal UPDATED_COST = new BigDecimal(1);
    private static final BigDecimal SMALLER_COST = new BigDecimal(0 - 1);

    private static final String DEFAULT_IMAGE_URL = "AAAAAAAAAA";
    private static final String UPDATED_IMAGE_URL = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_DELETED = false;
    private static final Boolean UPDATED_IS_DELETED = true;

    private static final String DEFAULT_START_HOUR = "7:02";
    private static final String UPDATED_START_HOUR = "21:08";

    private static final String DEFAULT_END_HOUR = "23:17";
    private static final String UPDATED_END_HOUR = "09:43";

    private static final ServiceStatus DEFAULT_STATUS = ServiceStatus.OPERATIONAL;
    private static final ServiceStatus UPDATED_STATUS = ServiceStatus.CLOSED;

    private static final String ENTITY_API_URL = "/api/hotel-services";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HotelServiceRepository hotelServiceRepository;

    @Autowired
    private HotelServiceMapper hotelServiceMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHotelServiceMockMvc;

    private HotelService hotelService;

    private HotelService insertedHotelService;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HotelService createEntity() {
        return new HotelService()
            .name(DEFAULT_NAME)
            .description(DEFAULT_DESCRIPTION)
            .cost(DEFAULT_COST)
            .imageUrl(DEFAULT_IMAGE_URL)
            .isDeleted(DEFAULT_IS_DELETED)
            .startHour(DEFAULT_START_HOUR)
            .endHour(DEFAULT_END_HOUR)
            .status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HotelService createUpdatedEntity() {
        return new HotelService()
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .cost(UPDATED_COST)
            .imageUrl(UPDATED_IMAGE_URL)
            .isDeleted(UPDATED_IS_DELETED)
            .startHour(UPDATED_START_HOUR)
            .endHour(UPDATED_END_HOUR)
            .status(UPDATED_STATUS);
    }

    @BeforeEach
    void initTest() {
        hotelService = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedHotelService != null) {
            hotelServiceRepository.delete(insertedHotelService);
            insertedHotelService = null;
        }
    }

    @Test
    @Transactional
    void createHotelService() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the HotelService
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);
        var returnedHotelServiceDTO = om.readValue(
            restHotelServiceMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hotelServiceDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HotelServiceDTO.class
        );

        // Validate the HotelService in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedHotelService = hotelServiceMapper.toEntity(returnedHotelServiceDTO);
        assertHotelServiceUpdatableFieldsEquals(returnedHotelService, getPersistedHotelService(returnedHotelService));

        insertedHotelService = returnedHotelService;
    }

    @Test
    @Transactional
    void createHotelServiceWithExistingId() throws Exception {
        // Create the HotelService with an existing ID
        hotelService.setId(1L);
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHotelServiceMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hotelService.setName(null);

        // Create the HotelService, which fails.
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        restHotelServiceMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCostIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hotelService.setCost(null);

        // Create the HotelService, which fails.
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        restHotelServiceMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hotelService.setStatus(null);

        // Create the HotelService, which fails.
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        restHotelServiceMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHotelServices() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList
        restHotelServiceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(hotelService.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].cost").value(hasItem(sameNumber(DEFAULT_COST))))
            .andExpect(jsonPath("$.[*].imageUrl").value(hasItem(DEFAULT_IMAGE_URL)))
            .andExpect(jsonPath("$.[*].isDeleted").value(hasItem(DEFAULT_IS_DELETED)))
            .andExpect(jsonPath("$.[*].startHour").value(hasItem(DEFAULT_START_HOUR)))
            .andExpect(jsonPath("$.[*].endHour").value(hasItem(DEFAULT_END_HOUR)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
    }

    @Test
    @Transactional
    void getHotelService() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get the hotelService
        restHotelServiceMockMvc
            .perform(get(ENTITY_API_URL_ID, hotelService.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(hotelService.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.cost").value(sameNumber(DEFAULT_COST)))
            .andExpect(jsonPath("$.imageUrl").value(DEFAULT_IMAGE_URL))
            .andExpect(jsonPath("$.isDeleted").value(DEFAULT_IS_DELETED))
            .andExpect(jsonPath("$.startHour").value(DEFAULT_START_HOUR))
            .andExpect(jsonPath("$.endHour").value(DEFAULT_END_HOUR))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getHotelServicesByIdFiltering() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        Long id = hotelService.getId();

        defaultHotelServiceFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultHotelServiceFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultHotelServiceFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllHotelServicesByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where name equals to
        defaultHotelServiceFiltering("name.equals=" + DEFAULT_NAME, "name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllHotelServicesByNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where name in
        defaultHotelServiceFiltering("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME, "name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllHotelServicesByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where name is not null
        defaultHotelServiceFiltering("name.specified=true", "name.specified=false");
    }

    @Test
    @Transactional
    void getAllHotelServicesByNameContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where name contains
        defaultHotelServiceFiltering("name.contains=" + DEFAULT_NAME, "name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllHotelServicesByNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where name does not contain
        defaultHotelServiceFiltering("name.doesNotContain=" + UPDATED_NAME, "name.doesNotContain=" + DEFAULT_NAME);
    }

    @Test
    @Transactional
    void getAllHotelServicesByDescriptionIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where description equals to
        defaultHotelServiceFiltering("description.equals=" + DEFAULT_DESCRIPTION, "description.equals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllHotelServicesByDescriptionIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where description in
        defaultHotelServiceFiltering(
            "description.in=" + DEFAULT_DESCRIPTION + "," + UPDATED_DESCRIPTION,
            "description.in=" + UPDATED_DESCRIPTION
        );
    }

    @Test
    @Transactional
    void getAllHotelServicesByDescriptionIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where description is not null
        defaultHotelServiceFiltering("description.specified=true", "description.specified=false");
    }

    @Test
    @Transactional
    void getAllHotelServicesByDescriptionContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where description contains
        defaultHotelServiceFiltering("description.contains=" + DEFAULT_DESCRIPTION, "description.contains=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllHotelServicesByDescriptionNotContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where description does not contain
        defaultHotelServiceFiltering(
            "description.doesNotContain=" + UPDATED_DESCRIPTION,
            "description.doesNotContain=" + DEFAULT_DESCRIPTION
        );
    }

    @Test
    @Transactional
    void getAllHotelServicesByCostIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where cost equals to
        defaultHotelServiceFiltering("cost.equals=" + DEFAULT_COST, "cost.equals=" + UPDATED_COST);
    }

    @Test
    @Transactional
    void getAllHotelServicesByCostIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where cost in
        defaultHotelServiceFiltering("cost.in=" + DEFAULT_COST + "," + UPDATED_COST, "cost.in=" + UPDATED_COST);
    }

    @Test
    @Transactional
    void getAllHotelServicesByCostIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where cost is not null
        defaultHotelServiceFiltering("cost.specified=true", "cost.specified=false");
    }

    @Test
    @Transactional
    void getAllHotelServicesByCostIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where cost is greater than or equal to
        defaultHotelServiceFiltering("cost.greaterThanOrEqual=" + DEFAULT_COST, "cost.greaterThanOrEqual=" + UPDATED_COST);
    }

    @Test
    @Transactional
    void getAllHotelServicesByCostIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where cost is less than or equal to
        defaultHotelServiceFiltering("cost.lessThanOrEqual=" + DEFAULT_COST, "cost.lessThanOrEqual=" + SMALLER_COST);
    }

    @Test
    @Transactional
    void getAllHotelServicesByCostIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where cost is less than
        defaultHotelServiceFiltering("cost.lessThan=" + UPDATED_COST, "cost.lessThan=" + DEFAULT_COST);
    }

    @Test
    @Transactional
    void getAllHotelServicesByCostIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where cost is greater than
        defaultHotelServiceFiltering("cost.greaterThan=" + SMALLER_COST, "cost.greaterThan=" + DEFAULT_COST);
    }

    @Test
    @Transactional
    void getAllHotelServicesByImageUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where imageUrl equals to
        defaultHotelServiceFiltering("imageUrl.equals=" + DEFAULT_IMAGE_URL, "imageUrl.equals=" + UPDATED_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllHotelServicesByImageUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where imageUrl in
        defaultHotelServiceFiltering("imageUrl.in=" + DEFAULT_IMAGE_URL + "," + UPDATED_IMAGE_URL, "imageUrl.in=" + UPDATED_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllHotelServicesByImageUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where imageUrl is not null
        defaultHotelServiceFiltering("imageUrl.specified=true", "imageUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllHotelServicesByImageUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where imageUrl contains
        defaultHotelServiceFiltering("imageUrl.contains=" + DEFAULT_IMAGE_URL, "imageUrl.contains=" + UPDATED_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllHotelServicesByImageUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where imageUrl does not contain
        defaultHotelServiceFiltering("imageUrl.doesNotContain=" + UPDATED_IMAGE_URL, "imageUrl.doesNotContain=" + DEFAULT_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllHotelServicesByIsDeletedIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where isDeleted equals to
        defaultHotelServiceFiltering("isDeleted.equals=" + DEFAULT_IS_DELETED, "isDeleted.equals=" + UPDATED_IS_DELETED);
    }

    @Test
    @Transactional
    void getAllHotelServicesByIsDeletedIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where isDeleted in
        defaultHotelServiceFiltering("isDeleted.in=" + DEFAULT_IS_DELETED + "," + UPDATED_IS_DELETED, "isDeleted.in=" + UPDATED_IS_DELETED);
    }

    @Test
    @Transactional
    void getAllHotelServicesByIsDeletedIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where isDeleted is not null
        defaultHotelServiceFiltering("isDeleted.specified=true", "isDeleted.specified=false");
    }

    @Test
    @Transactional
    void getAllHotelServicesByStartHourIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where startHour equals to
        defaultHotelServiceFiltering("startHour.equals=" + DEFAULT_START_HOUR, "startHour.equals=" + UPDATED_START_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByStartHourIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where startHour in
        defaultHotelServiceFiltering("startHour.in=" + DEFAULT_START_HOUR + "," + UPDATED_START_HOUR, "startHour.in=" + UPDATED_START_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByStartHourIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where startHour is not null
        defaultHotelServiceFiltering("startHour.specified=true", "startHour.specified=false");
    }

    @Test
    @Transactional
    void getAllHotelServicesByStartHourContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where startHour contains
        defaultHotelServiceFiltering("startHour.contains=" + DEFAULT_START_HOUR, "startHour.contains=" + UPDATED_START_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByStartHourNotContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where startHour does not contain
        defaultHotelServiceFiltering("startHour.doesNotContain=" + UPDATED_START_HOUR, "startHour.doesNotContain=" + DEFAULT_START_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByEndHourIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where endHour equals to
        defaultHotelServiceFiltering("endHour.equals=" + DEFAULT_END_HOUR, "endHour.equals=" + UPDATED_END_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByEndHourIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where endHour in
        defaultHotelServiceFiltering("endHour.in=" + DEFAULT_END_HOUR + "," + UPDATED_END_HOUR, "endHour.in=" + UPDATED_END_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByEndHourIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where endHour is not null
        defaultHotelServiceFiltering("endHour.specified=true", "endHour.specified=false");
    }

    @Test
    @Transactional
    void getAllHotelServicesByEndHourContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where endHour contains
        defaultHotelServiceFiltering("endHour.contains=" + DEFAULT_END_HOUR, "endHour.contains=" + UPDATED_END_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByEndHourNotContainsSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where endHour does not contain
        defaultHotelServiceFiltering("endHour.doesNotContain=" + UPDATED_END_HOUR, "endHour.doesNotContain=" + DEFAULT_END_HOUR);
    }

    @Test
    @Transactional
    void getAllHotelServicesByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where status equals to
        defaultHotelServiceFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllHotelServicesByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where status in
        defaultHotelServiceFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllHotelServicesByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        // Get all the hotelServiceList where status is not null
        defaultHotelServiceFiltering("status.specified=true", "status.specified=false");
    }

    private void defaultHotelServiceFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultHotelServiceShouldBeFound(shouldBeFound);
        defaultHotelServiceShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultHotelServiceShouldBeFound(String filter) throws Exception {
        restHotelServiceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(hotelService.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].cost").value(hasItem(sameNumber(DEFAULT_COST))))
            .andExpect(jsonPath("$.[*].imageUrl").value(hasItem(DEFAULT_IMAGE_URL)))
            .andExpect(jsonPath("$.[*].isDeleted").value(hasItem(DEFAULT_IS_DELETED)))
            .andExpect(jsonPath("$.[*].startHour").value(hasItem(DEFAULT_START_HOUR)))
            .andExpect(jsonPath("$.[*].endHour").value(hasItem(DEFAULT_END_HOUR)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));

        // Check, that the count call also returns 1
        restHotelServiceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultHotelServiceShouldNotBeFound(String filter) throws Exception {
        restHotelServiceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restHotelServiceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingHotelService() throws Exception {
        // Get the hotelService
        restHotelServiceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingHotelService() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the hotelService
        HotelService updatedHotelService = hotelServiceRepository.findById(hotelService.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedHotelService are not directly saved in db
        em.detach(updatedHotelService);
        updatedHotelService
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .cost(UPDATED_COST)
            .imageUrl(UPDATED_IMAGE_URL)
            .isDeleted(UPDATED_IS_DELETED)
            .startHour(UPDATED_START_HOUR)
            .endHour(UPDATED_END_HOUR)
            .status(UPDATED_STATUS);
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(updatedHotelService);

        restHotelServiceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, hotelServiceDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isOk());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedHotelServiceToMatchAllProperties(updatedHotelService);
    }

    @Test
    @Transactional
    void putNonExistingHotelService() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hotelService.setId(longCount.incrementAndGet());

        // Create the HotelService
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHotelServiceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, hotelServiceDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHotelService() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hotelService.setId(longCount.incrementAndGet());

        // Create the HotelService
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHotelServiceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHotelService() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hotelService.setId(longCount.incrementAndGet());

        // Create the HotelService
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHotelServiceMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHotelServiceWithPatch() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the hotelService using partial update
        HotelService partialUpdatedHotelService = new HotelService();
        partialUpdatedHotelService.setId(hotelService.getId());

        partialUpdatedHotelService
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .cost(UPDATED_COST)
            .imageUrl(UPDATED_IMAGE_URL)
            .startHour(UPDATED_START_HOUR)
            .status(UPDATED_STATUS);

        restHotelServiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHotelService.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHotelService))
            )
            .andExpect(status().isOk());

        // Validate the HotelService in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHotelServiceUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedHotelService, hotelService),
            getPersistedHotelService(hotelService)
        );
    }

    @Test
    @Transactional
    void fullUpdateHotelServiceWithPatch() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the hotelService using partial update
        HotelService partialUpdatedHotelService = new HotelService();
        partialUpdatedHotelService.setId(hotelService.getId());

        partialUpdatedHotelService
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .cost(UPDATED_COST)
            .imageUrl(UPDATED_IMAGE_URL)
            .isDeleted(UPDATED_IS_DELETED)
            .startHour(UPDATED_START_HOUR)
            .endHour(UPDATED_END_HOUR)
            .status(UPDATED_STATUS);

        restHotelServiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHotelService.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHotelService))
            )
            .andExpect(status().isOk());

        // Validate the HotelService in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHotelServiceUpdatableFieldsEquals(partialUpdatedHotelService, getPersistedHotelService(partialUpdatedHotelService));
    }

    @Test
    @Transactional
    void patchNonExistingHotelService() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hotelService.setId(longCount.incrementAndGet());

        // Create the HotelService
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHotelServiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, hotelServiceDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHotelService() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hotelService.setId(longCount.incrementAndGet());

        // Create the HotelService
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHotelServiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHotelService() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hotelService.setId(longCount.incrementAndGet());

        // Create the HotelService
        HotelServiceDTO hotelServiceDTO = hotelServiceMapper.toDto(hotelService);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHotelServiceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(hotelServiceDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the HotelService in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHotelService() throws Exception {
        // Initialize the database
        insertedHotelService = hotelServiceRepository.saveAndFlush(hotelService);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the hotelService
        restHotelServiceMockMvc
            .perform(delete(ENTITY_API_URL_ID, hotelService.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return hotelServiceRepository.count();
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

    protected HotelService getPersistedHotelService(HotelService hotelService) {
        return hotelServiceRepository.findById(hotelService.getId()).orElseThrow();
    }

    protected void assertPersistedHotelServiceToMatchAllProperties(HotelService expectedHotelService) {
        assertHotelServiceAllPropertiesEquals(expectedHotelService, getPersistedHotelService(expectedHotelService));
    }

    protected void assertPersistedHotelServiceToMatchUpdatableProperties(HotelService expectedHotelService) {
        assertHotelServiceAllUpdatablePropertiesEquals(expectedHotelService, getPersistedHotelService(expectedHotelService));
    }
}
