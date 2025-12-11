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

    private static final Boolean DEFAULT_IS_AVAILABLE = false;
    private static final Boolean UPDATED_IS_AVAILABLE = true;

    private static final Boolean DEFAULT_IS_DELETED = false;
    private static final Boolean UPDATED_IS_DELETED = true;

    private static final BigDecimal DEFAULT_COST = new BigDecimal(0);
    private static final BigDecimal UPDATED_COST = new BigDecimal(1);

    private static final String DEFAULT_IMAGE_URL = "AAAAAAAAAA";
    private static final String UPDATED_IMAGE_URL = "BBBBBBBBBB";

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
            .isAvailable(DEFAULT_IS_AVAILABLE)
            .isDeleted(DEFAULT_IS_DELETED)
            .cost(DEFAULT_COST)
            .imageUrl(DEFAULT_IMAGE_URL);
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
            .isAvailable(UPDATED_IS_AVAILABLE)
            .isDeleted(UPDATED_IS_DELETED)
            .cost(UPDATED_COST)
            .imageUrl(UPDATED_IMAGE_URL);
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
    void checkIsAvailableIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hotelService.setIsAvailable(null);

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
            .andExpect(jsonPath("$.[*].isAvailable").value(hasItem(DEFAULT_IS_AVAILABLE)))
            .andExpect(jsonPath("$.[*].isDeleted").value(hasItem(DEFAULT_IS_DELETED)))
            .andExpect(jsonPath("$.[*].cost").value(hasItem(sameNumber(DEFAULT_COST))))
            .andExpect(jsonPath("$.[*].imageUrl").value(hasItem(DEFAULT_IMAGE_URL)));
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
            .andExpect(jsonPath("$.isAvailable").value(DEFAULT_IS_AVAILABLE))
            .andExpect(jsonPath("$.isDeleted").value(DEFAULT_IS_DELETED))
            .andExpect(jsonPath("$.cost").value(sameNumber(DEFAULT_COST)))
            .andExpect(jsonPath("$.imageUrl").value(DEFAULT_IMAGE_URL));
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
            .isAvailable(UPDATED_IS_AVAILABLE)
            .isDeleted(UPDATED_IS_DELETED)
            .cost(UPDATED_COST)
            .imageUrl(UPDATED_IMAGE_URL);
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

        partialUpdatedHotelService.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).isDeleted(UPDATED_IS_DELETED).cost(UPDATED_COST);

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
            .isAvailable(UPDATED_IS_AVAILABLE)
            .isDeleted(UPDATED_IS_DELETED)
            .cost(UPDATED_COST)
            .imageUrl(UPDATED_IMAGE_URL);

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
