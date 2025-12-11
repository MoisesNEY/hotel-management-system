package org.hotel.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hotel.domain.RoomTypeAsserts.*;
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
import org.hotel.domain.RoomType;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.service.dto.RoomTypeDTO;
import org.hotel.service.mapper.RoomTypeMapper;
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
 * Integration tests for the {@link RoomTypeResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RoomTypeResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_BASE_PRICE = new BigDecimal(0);
    private static final BigDecimal UPDATED_BASE_PRICE = new BigDecimal(1);

    private static final Integer DEFAULT_MAX_CAPACITY = 1;
    private static final Integer UPDATED_MAX_CAPACITY = 2;

    private static final String DEFAULT_IMAGE_URL = "AAAAAAAAAA";
    private static final String UPDATED_IMAGE_URL = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/room-types";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomTypeMapper roomTypeMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRoomTypeMockMvc;

    private RoomType roomType;

    private RoomType insertedRoomType;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RoomType createEntity() {
        return new RoomType()
            .name(DEFAULT_NAME)
            .description(DEFAULT_DESCRIPTION)
            .basePrice(DEFAULT_BASE_PRICE)
            .maxCapacity(DEFAULT_MAX_CAPACITY)
            .imageUrl(DEFAULT_IMAGE_URL);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RoomType createUpdatedEntity() {
        return new RoomType()
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .basePrice(UPDATED_BASE_PRICE)
            .maxCapacity(UPDATED_MAX_CAPACITY)
            .imageUrl(UPDATED_IMAGE_URL);
    }

    @BeforeEach
    void initTest() {
        roomType = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedRoomType != null) {
            roomTypeRepository.delete(insertedRoomType);
            insertedRoomType = null;
        }
    }

    @Test
    @Transactional
    void createRoomType() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the RoomType
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);
        var returnedRoomTypeDTO = om.readValue(
            restRoomTypeMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roomTypeDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RoomTypeDTO.class
        );

        // Validate the RoomType in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRoomType = roomTypeMapper.toEntity(returnedRoomTypeDTO);
        assertRoomTypeUpdatableFieldsEquals(returnedRoomType, getPersistedRoomType(returnedRoomType));

        insertedRoomType = returnedRoomType;
    }

    @Test
    @Transactional
    void createRoomTypeWithExistingId() throws Exception {
        // Create the RoomType with an existing ID
        roomType.setId(1L);
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRoomTypeMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roomTypeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        roomType.setName(null);

        // Create the RoomType, which fails.
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        restRoomTypeMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roomTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBasePriceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        roomType.setBasePrice(null);

        // Create the RoomType, which fails.
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        restRoomTypeMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roomTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMaxCapacityIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        roomType.setMaxCapacity(null);

        // Create the RoomType, which fails.
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        restRoomTypeMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roomTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRoomTypes() throws Exception {
        // Initialize the database
        insertedRoomType = roomTypeRepository.saveAndFlush(roomType);

        // Get all the roomTypeList
        restRoomTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(roomType.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].basePrice").value(hasItem(sameNumber(DEFAULT_BASE_PRICE))))
            .andExpect(jsonPath("$.[*].maxCapacity").value(hasItem(DEFAULT_MAX_CAPACITY)))
            .andExpect(jsonPath("$.[*].imageUrl").value(hasItem(DEFAULT_IMAGE_URL)));
    }

    @Test
    @Transactional
    void getRoomType() throws Exception {
        // Initialize the database
        insertedRoomType = roomTypeRepository.saveAndFlush(roomType);

        // Get the roomType
        restRoomTypeMockMvc
            .perform(get(ENTITY_API_URL_ID, roomType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(roomType.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.basePrice").value(sameNumber(DEFAULT_BASE_PRICE)))
            .andExpect(jsonPath("$.maxCapacity").value(DEFAULT_MAX_CAPACITY))
            .andExpect(jsonPath("$.imageUrl").value(DEFAULT_IMAGE_URL));
    }

    @Test
    @Transactional
    void getNonExistingRoomType() throws Exception {
        // Get the roomType
        restRoomTypeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRoomType() throws Exception {
        // Initialize the database
        insertedRoomType = roomTypeRepository.saveAndFlush(roomType);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the roomType
        RoomType updatedRoomType = roomTypeRepository.findById(roomType.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRoomType are not directly saved in db
        em.detach(updatedRoomType);
        updatedRoomType
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .basePrice(UPDATED_BASE_PRICE)
            .maxCapacity(UPDATED_MAX_CAPACITY)
            .imageUrl(UPDATED_IMAGE_URL);
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(updatedRoomType);

        restRoomTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, roomTypeDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(roomTypeDTO))
            )
            .andExpect(status().isOk());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRoomTypeToMatchAllProperties(updatedRoomType);
    }

    @Test
    @Transactional
    void putNonExistingRoomType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roomType.setId(longCount.incrementAndGet());

        // Create the RoomType
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRoomTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, roomTypeDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(roomTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRoomType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roomType.setId(longCount.incrementAndGet());

        // Create the RoomType
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoomTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(roomTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRoomType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roomType.setId(longCount.incrementAndGet());

        // Create the RoomType
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoomTypeMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(roomTypeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRoomTypeWithPatch() throws Exception {
        // Initialize the database
        insertedRoomType = roomTypeRepository.saveAndFlush(roomType);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the roomType using partial update
        RoomType partialUpdatedRoomType = new RoomType();
        partialUpdatedRoomType.setId(roomType.getId());

        partialUpdatedRoomType
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .basePrice(UPDATED_BASE_PRICE)
            .maxCapacity(UPDATED_MAX_CAPACITY)
            .imageUrl(UPDATED_IMAGE_URL);

        restRoomTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRoomType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRoomType))
            )
            .andExpect(status().isOk());

        // Validate the RoomType in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRoomTypeUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedRoomType, roomType), getPersistedRoomType(roomType));
    }

    @Test
    @Transactional
    void fullUpdateRoomTypeWithPatch() throws Exception {
        // Initialize the database
        insertedRoomType = roomTypeRepository.saveAndFlush(roomType);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the roomType using partial update
        RoomType partialUpdatedRoomType = new RoomType();
        partialUpdatedRoomType.setId(roomType.getId());

        partialUpdatedRoomType
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .basePrice(UPDATED_BASE_PRICE)
            .maxCapacity(UPDATED_MAX_CAPACITY)
            .imageUrl(UPDATED_IMAGE_URL);

        restRoomTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRoomType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRoomType))
            )
            .andExpect(status().isOk());

        // Validate the RoomType in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRoomTypeUpdatableFieldsEquals(partialUpdatedRoomType, getPersistedRoomType(partialUpdatedRoomType));
    }

    @Test
    @Transactional
    void patchNonExistingRoomType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roomType.setId(longCount.incrementAndGet());

        // Create the RoomType
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRoomTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, roomTypeDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(roomTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRoomType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roomType.setId(longCount.incrementAndGet());

        // Create the RoomType
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoomTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(roomTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRoomType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        roomType.setId(longCount.incrementAndGet());

        // Create the RoomType
        RoomTypeDTO roomTypeDTO = roomTypeMapper.toDto(roomType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRoomTypeMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(roomTypeDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the RoomType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRoomType() throws Exception {
        // Initialize the database
        insertedRoomType = roomTypeRepository.saveAndFlush(roomType);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the roomType
        restRoomTypeMockMvc
            .perform(delete(ENTITY_API_URL_ID, roomType.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return roomTypeRepository.count();
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

    protected RoomType getPersistedRoomType(RoomType roomType) {
        return roomTypeRepository.findById(roomType.getId()).orElseThrow();
    }

    protected void assertPersistedRoomTypeToMatchAllProperties(RoomType expectedRoomType) {
        assertRoomTypeAllPropertiesEquals(expectedRoomType, getPersistedRoomType(expectedRoomType));
    }

    protected void assertPersistedRoomTypeToMatchUpdatableProperties(RoomType expectedRoomType) {
        assertRoomTypeAllUpdatablePropertiesEquals(expectedRoomType, getPersistedRoomType(expectedRoomType));
    }
}
