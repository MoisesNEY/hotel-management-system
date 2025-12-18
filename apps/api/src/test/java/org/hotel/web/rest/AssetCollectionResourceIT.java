package org.hotel.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hotel.domain.AssetCollectionAsserts.*;
import static org.hotel.web.rest.TestUtil.createUpdateProxyForBean;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.hotel.IntegrationTest;
import org.hotel.domain.AssetCollection;
import org.hotel.domain.enumeration.CollectionType;
import org.hotel.repository.AssetCollectionRepository;
import org.hotel.service.dto.AssetCollectionDTO;
import org.hotel.service.mapper.AssetCollectionMapper;
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
 * Integration tests for the {@link AssetCollectionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AssetCollectionResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final CollectionType DEFAULT_TYPE = CollectionType.SINGLE_IMAGE;
    private static final CollectionType UPDATED_TYPE = CollectionType.GALLERY;

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/asset-collections";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AssetCollectionRepository assetCollectionRepository;

    @Autowired
    private AssetCollectionMapper assetCollectionMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAssetCollectionMockMvc;

    private AssetCollection assetCollection;

    private AssetCollection insertedAssetCollection;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AssetCollection createEntity() {
        return new AssetCollection().code(DEFAULT_CODE).name(DEFAULT_NAME).type(DEFAULT_TYPE).description(DEFAULT_DESCRIPTION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AssetCollection createUpdatedEntity() {
        return new AssetCollection().code(UPDATED_CODE).name(UPDATED_NAME).type(UPDATED_TYPE).description(UPDATED_DESCRIPTION);
    }

    @BeforeEach
    void initTest() {
        assetCollection = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedAssetCollection != null) {
            assetCollectionRepository.delete(insertedAssetCollection);
            insertedAssetCollection = null;
        }
    }

    @Test
    @Transactional
    void createAssetCollection() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the AssetCollection
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);
        var returnedAssetCollectionDTO = om.readValue(
            restAssetCollectionMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(assetCollectionDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            AssetCollectionDTO.class
        );

        // Validate the AssetCollection in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAssetCollection = assetCollectionMapper.toEntity(returnedAssetCollectionDTO);
        assertAssetCollectionUpdatableFieldsEquals(returnedAssetCollection, getPersistedAssetCollection(returnedAssetCollection));

        insertedAssetCollection = returnedAssetCollection;
    }

    @Test
    @Transactional
    void createAssetCollectionWithExistingId() throws Exception {
        // Create the AssetCollection with an existing ID
        assetCollection.setId(1L);
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAssetCollectionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        assetCollection.setCode(null);

        // Create the AssetCollection, which fails.
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        restAssetCollectionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        assetCollection.setName(null);

        // Create the AssetCollection, which fails.
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        restAssetCollectionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        assetCollection.setType(null);

        // Create the AssetCollection, which fails.
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        restAssetCollectionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAssetCollections() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList
        restAssetCollectionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(assetCollection.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getAssetCollection() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get the assetCollection
        restAssetCollectionMockMvc
            .perform(get(ENTITY_API_URL_ID, assetCollection.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(assetCollection.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getAssetCollectionsByIdFiltering() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        Long id = assetCollection.getId();

        defaultAssetCollectionFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultAssetCollectionFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultAssetCollectionFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where code equals to
        defaultAssetCollectionFiltering("code.equals=" + DEFAULT_CODE, "code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where code in
        defaultAssetCollectionFiltering("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE, "code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where code is not null
        defaultAssetCollectionFiltering("code.specified=true", "code.specified=false");
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByCodeContainsSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where code contains
        defaultAssetCollectionFiltering("code.contains=" + DEFAULT_CODE, "code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where code does not contain
        defaultAssetCollectionFiltering("code.doesNotContain=" + UPDATED_CODE, "code.doesNotContain=" + DEFAULT_CODE);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where name equals to
        defaultAssetCollectionFiltering("name.equals=" + DEFAULT_NAME, "name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where name in
        defaultAssetCollectionFiltering("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME, "name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where name is not null
        defaultAssetCollectionFiltering("name.specified=true", "name.specified=false");
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByNameContainsSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where name contains
        defaultAssetCollectionFiltering("name.contains=" + DEFAULT_NAME, "name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where name does not contain
        defaultAssetCollectionFiltering("name.doesNotContain=" + UPDATED_NAME, "name.doesNotContain=" + DEFAULT_NAME);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where type equals to
        defaultAssetCollectionFiltering("type.equals=" + DEFAULT_TYPE, "type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where type in
        defaultAssetCollectionFiltering("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE, "type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where type is not null
        defaultAssetCollectionFiltering("type.specified=true", "type.specified=false");
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByDescriptionIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where description equals to
        defaultAssetCollectionFiltering("description.equals=" + DEFAULT_DESCRIPTION, "description.equals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByDescriptionIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where description in
        defaultAssetCollectionFiltering(
            "description.in=" + DEFAULT_DESCRIPTION + "," + UPDATED_DESCRIPTION,
            "description.in=" + UPDATED_DESCRIPTION
        );
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByDescriptionIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where description is not null
        defaultAssetCollectionFiltering("description.specified=true", "description.specified=false");
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByDescriptionContainsSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where description contains
        defaultAssetCollectionFiltering("description.contains=" + DEFAULT_DESCRIPTION, "description.contains=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllAssetCollectionsByDescriptionNotContainsSomething() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        // Get all the assetCollectionList where description does not contain
        defaultAssetCollectionFiltering(
            "description.doesNotContain=" + UPDATED_DESCRIPTION,
            "description.doesNotContain=" + DEFAULT_DESCRIPTION
        );
    }

    private void defaultAssetCollectionFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultAssetCollectionShouldBeFound(shouldBeFound);
        defaultAssetCollectionShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultAssetCollectionShouldBeFound(String filter) throws Exception {
        restAssetCollectionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(assetCollection.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));

        // Check, that the count call also returns 1
        restAssetCollectionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultAssetCollectionShouldNotBeFound(String filter) throws Exception {
        restAssetCollectionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restAssetCollectionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingAssetCollection() throws Exception {
        // Get the assetCollection
        restAssetCollectionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAssetCollection() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the assetCollection
        AssetCollection updatedAssetCollection = assetCollectionRepository.findById(assetCollection.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedAssetCollection are not directly saved in db
        em.detach(updatedAssetCollection);
        updatedAssetCollection.code(UPDATED_CODE).name(UPDATED_NAME).type(UPDATED_TYPE).description(UPDATED_DESCRIPTION);
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(updatedAssetCollection);

        restAssetCollectionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, assetCollectionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isOk());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAssetCollectionToMatchAllProperties(updatedAssetCollection);
    }

    @Test
    @Transactional
    void putNonExistingAssetCollection() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        assetCollection.setId(longCount.incrementAndGet());

        // Create the AssetCollection
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAssetCollectionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, assetCollectionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAssetCollection() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        assetCollection.setId(longCount.incrementAndGet());

        // Create the AssetCollection
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssetCollectionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAssetCollection() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        assetCollection.setId(longCount.incrementAndGet());

        // Create the AssetCollection
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssetCollectionMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAssetCollectionWithPatch() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the assetCollection using partial update
        AssetCollection partialUpdatedAssetCollection = new AssetCollection();
        partialUpdatedAssetCollection.setId(assetCollection.getId());

        partialUpdatedAssetCollection.code(UPDATED_CODE).description(UPDATED_DESCRIPTION);

        restAssetCollectionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAssetCollection.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAssetCollection))
            )
            .andExpect(status().isOk());

        // Validate the AssetCollection in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAssetCollectionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedAssetCollection, assetCollection),
            getPersistedAssetCollection(assetCollection)
        );
    }

    @Test
    @Transactional
    void fullUpdateAssetCollectionWithPatch() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the assetCollection using partial update
        AssetCollection partialUpdatedAssetCollection = new AssetCollection();
        partialUpdatedAssetCollection.setId(assetCollection.getId());

        partialUpdatedAssetCollection.code(UPDATED_CODE).name(UPDATED_NAME).type(UPDATED_TYPE).description(UPDATED_DESCRIPTION);

        restAssetCollectionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAssetCollection.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAssetCollection))
            )
            .andExpect(status().isOk());

        // Validate the AssetCollection in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAssetCollectionUpdatableFieldsEquals(
            partialUpdatedAssetCollection,
            getPersistedAssetCollection(partialUpdatedAssetCollection)
        );
    }

    @Test
    @Transactional
    void patchNonExistingAssetCollection() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        assetCollection.setId(longCount.incrementAndGet());

        // Create the AssetCollection
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAssetCollectionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, assetCollectionDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAssetCollection() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        assetCollection.setId(longCount.incrementAndGet());

        // Create the AssetCollection
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssetCollectionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAssetCollection() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        assetCollection.setId(longCount.incrementAndGet());

        // Create the AssetCollection
        AssetCollectionDTO assetCollectionDTO = assetCollectionMapper.toDto(assetCollection);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssetCollectionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(assetCollectionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AssetCollection in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAssetCollection() throws Exception {
        // Initialize the database
        insertedAssetCollection = assetCollectionRepository.saveAndFlush(assetCollection);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the assetCollection
        restAssetCollectionMockMvc
            .perform(delete(ENTITY_API_URL_ID, assetCollection.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return assetCollectionRepository.count();
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

    protected AssetCollection getPersistedAssetCollection(AssetCollection assetCollection) {
        return assetCollectionRepository.findById(assetCollection.getId()).orElseThrow();
    }

    protected void assertPersistedAssetCollectionToMatchAllProperties(AssetCollection expectedAssetCollection) {
        assertAssetCollectionAllPropertiesEquals(expectedAssetCollection, getPersistedAssetCollection(expectedAssetCollection));
    }

    protected void assertPersistedAssetCollectionToMatchUpdatableProperties(AssetCollection expectedAssetCollection) {
        assertAssetCollectionAllUpdatablePropertiesEquals(expectedAssetCollection, getPersistedAssetCollection(expectedAssetCollection));
    }
}
