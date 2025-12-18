package org.hotel.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hotel.domain.WebContentAsserts.*;
import static org.hotel.web.rest.TestUtil.createUpdateProxyForBean;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.hotel.IntegrationTest;
import org.hotel.domain.AssetCollection;
import org.hotel.domain.WebContent;
import org.hotel.repository.WebContentRepository;
import org.hotel.service.WebContentService;
import org.hotel.service.dto.WebContentDTO;
import org.hotel.service.mapper.WebContentMapper;
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
 * Integration tests for the {@link WebContentResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class WebContentResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_SUBTITLE = "AAAAAAAAAA";
    private static final String UPDATED_SUBTITLE = "BBBBBBBBBB";

    private static final String DEFAULT_IMAGE_URL = "AAAAAAAAAA";
    private static final String UPDATED_IMAGE_URL = "BBBBBBBBBB";

    private static final String DEFAULT_ACTION_URL = "AAAAAAAAAA";
    private static final String UPDATED_ACTION_URL = "BBBBBBBBBB";

    private static final Integer DEFAULT_SORT_ORDER = 1;
    private static final Integer UPDATED_SORT_ORDER = 2;
    private static final Integer SMALLER_SORT_ORDER = 1 - 1;

    private static final Boolean DEFAULT_IS_ACTIVE = false;
    private static final Boolean UPDATED_IS_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/web-contents";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private WebContentRepository webContentRepository;

    @Mock
    private WebContentRepository webContentRepositoryMock;

    @Autowired
    private WebContentMapper webContentMapper;

    @Mock
    private WebContentService webContentServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restWebContentMockMvc;

    private WebContent webContent;

    private WebContent insertedWebContent;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static WebContent createEntity(EntityManager em) {
        WebContent webContent = new WebContent()
            .title(DEFAULT_TITLE)
            .subtitle(DEFAULT_SUBTITLE)
            .imageUrl(DEFAULT_IMAGE_URL)
            .actionUrl(DEFAULT_ACTION_URL)
            .sortOrder(DEFAULT_SORT_ORDER)
            .isActive(DEFAULT_IS_ACTIVE);
        // Add required entity
        AssetCollection assetCollection;
        if (TestUtil.findAll(em, AssetCollection.class).isEmpty()) {
            assetCollection = AssetCollectionResourceIT.createEntity();
            em.persist(assetCollection);
            em.flush();
        } else {
            assetCollection = TestUtil.findAll(em, AssetCollection.class).get(0);
        }
        webContent.setCollection(assetCollection);
        return webContent;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static WebContent createUpdatedEntity(EntityManager em) {
        WebContent updatedWebContent = new WebContent()
            .title(UPDATED_TITLE)
            .subtitle(UPDATED_SUBTITLE)
            .imageUrl(UPDATED_IMAGE_URL)
            .actionUrl(UPDATED_ACTION_URL)
            .sortOrder(UPDATED_SORT_ORDER)
            .isActive(UPDATED_IS_ACTIVE);
        // Add required entity
        AssetCollection assetCollection;
        if (TestUtil.findAll(em, AssetCollection.class).isEmpty()) {
            assetCollection = AssetCollectionResourceIT.createUpdatedEntity();
            em.persist(assetCollection);
            em.flush();
        } else {
            assetCollection = TestUtil.findAll(em, AssetCollection.class).get(0);
        }
        updatedWebContent.setCollection(assetCollection);
        return updatedWebContent;
    }

    @BeforeEach
    void initTest() {
        webContent = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedWebContent != null) {
            webContentRepository.delete(insertedWebContent);
            insertedWebContent = null;
        }
    }

    @Test
    @Transactional
    void createWebContent() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the WebContent
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);
        var returnedWebContentDTO = om.readValue(
            restWebContentMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(webContentDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            WebContentDTO.class
        );

        // Validate the WebContent in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedWebContent = webContentMapper.toEntity(returnedWebContentDTO);
        assertWebContentUpdatableFieldsEquals(returnedWebContent, getPersistedWebContent(returnedWebContent));

        insertedWebContent = returnedWebContent;
    }

    @Test
    @Transactional
    void createWebContentWithExistingId() throws Exception {
        // Create the WebContent with an existing ID
        webContent.setId(1L);
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restWebContentMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(webContentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSortOrderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        webContent.setSortOrder(null);

        // Create the WebContent, which fails.
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        restWebContentMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(webContentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllWebContents() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList
        restWebContentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(webContent.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].subtitle").value(hasItem(DEFAULT_SUBTITLE)))
            .andExpect(jsonPath("$.[*].imageUrl").value(hasItem(DEFAULT_IMAGE_URL)))
            .andExpect(jsonPath("$.[*].actionUrl").value(hasItem(DEFAULT_ACTION_URL)))
            .andExpect(jsonPath("$.[*].sortOrder").value(hasItem(DEFAULT_SORT_ORDER)))
            .andExpect(jsonPath("$.[*].isActive").value(hasItem(DEFAULT_IS_ACTIVE)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllWebContentsWithEagerRelationshipsIsEnabled() throws Exception {
        when(webContentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restWebContentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(webContentServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllWebContentsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(webContentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restWebContentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(webContentRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getWebContent() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get the webContent
        restWebContentMockMvc
            .perform(get(ENTITY_API_URL_ID, webContent.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(webContent.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.subtitle").value(DEFAULT_SUBTITLE))
            .andExpect(jsonPath("$.imageUrl").value(DEFAULT_IMAGE_URL))
            .andExpect(jsonPath("$.actionUrl").value(DEFAULT_ACTION_URL))
            .andExpect(jsonPath("$.sortOrder").value(DEFAULT_SORT_ORDER))
            .andExpect(jsonPath("$.isActive").value(DEFAULT_IS_ACTIVE));
    }

    @Test
    @Transactional
    void getWebContentsByIdFiltering() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        Long id = webContent.getId();

        defaultWebContentFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultWebContentFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultWebContentFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllWebContentsByTitleIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where title equals to
        defaultWebContentFiltering("title.equals=" + DEFAULT_TITLE, "title.equals=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsByTitleIsInShouldWork() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where title in
        defaultWebContentFiltering("title.in=" + DEFAULT_TITLE + "," + UPDATED_TITLE, "title.in=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsByTitleIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where title is not null
        defaultWebContentFiltering("title.specified=true", "title.specified=false");
    }

    @Test
    @Transactional
    void getAllWebContentsByTitleContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where title contains
        defaultWebContentFiltering("title.contains=" + DEFAULT_TITLE, "title.contains=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsByTitleNotContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where title does not contain
        defaultWebContentFiltering("title.doesNotContain=" + UPDATED_TITLE, "title.doesNotContain=" + DEFAULT_TITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsBySubtitleIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where subtitle equals to
        defaultWebContentFiltering("subtitle.equals=" + DEFAULT_SUBTITLE, "subtitle.equals=" + UPDATED_SUBTITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsBySubtitleIsInShouldWork() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where subtitle in
        defaultWebContentFiltering("subtitle.in=" + DEFAULT_SUBTITLE + "," + UPDATED_SUBTITLE, "subtitle.in=" + UPDATED_SUBTITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsBySubtitleIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where subtitle is not null
        defaultWebContentFiltering("subtitle.specified=true", "subtitle.specified=false");
    }

    @Test
    @Transactional
    void getAllWebContentsBySubtitleContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where subtitle contains
        defaultWebContentFiltering("subtitle.contains=" + DEFAULT_SUBTITLE, "subtitle.contains=" + UPDATED_SUBTITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsBySubtitleNotContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where subtitle does not contain
        defaultWebContentFiltering("subtitle.doesNotContain=" + UPDATED_SUBTITLE, "subtitle.doesNotContain=" + DEFAULT_SUBTITLE);
    }

    @Test
    @Transactional
    void getAllWebContentsByImageUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where imageUrl equals to
        defaultWebContentFiltering("imageUrl.equals=" + DEFAULT_IMAGE_URL, "imageUrl.equals=" + UPDATED_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsByImageUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where imageUrl in
        defaultWebContentFiltering("imageUrl.in=" + DEFAULT_IMAGE_URL + "," + UPDATED_IMAGE_URL, "imageUrl.in=" + UPDATED_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsByImageUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where imageUrl is not null
        defaultWebContentFiltering("imageUrl.specified=true", "imageUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllWebContentsByImageUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where imageUrl contains
        defaultWebContentFiltering("imageUrl.contains=" + DEFAULT_IMAGE_URL, "imageUrl.contains=" + UPDATED_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsByImageUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where imageUrl does not contain
        defaultWebContentFiltering("imageUrl.doesNotContain=" + UPDATED_IMAGE_URL, "imageUrl.doesNotContain=" + DEFAULT_IMAGE_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsByActionUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where actionUrl equals to
        defaultWebContentFiltering("actionUrl.equals=" + DEFAULT_ACTION_URL, "actionUrl.equals=" + UPDATED_ACTION_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsByActionUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where actionUrl in
        defaultWebContentFiltering("actionUrl.in=" + DEFAULT_ACTION_URL + "," + UPDATED_ACTION_URL, "actionUrl.in=" + UPDATED_ACTION_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsByActionUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where actionUrl is not null
        defaultWebContentFiltering("actionUrl.specified=true", "actionUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllWebContentsByActionUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where actionUrl contains
        defaultWebContentFiltering("actionUrl.contains=" + DEFAULT_ACTION_URL, "actionUrl.contains=" + UPDATED_ACTION_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsByActionUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where actionUrl does not contain
        defaultWebContentFiltering("actionUrl.doesNotContain=" + UPDATED_ACTION_URL, "actionUrl.doesNotContain=" + DEFAULT_ACTION_URL);
    }

    @Test
    @Transactional
    void getAllWebContentsBySortOrderIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where sortOrder equals to
        defaultWebContentFiltering("sortOrder.equals=" + DEFAULT_SORT_ORDER, "sortOrder.equals=" + UPDATED_SORT_ORDER);
    }

    @Test
    @Transactional
    void getAllWebContentsBySortOrderIsInShouldWork() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where sortOrder in
        defaultWebContentFiltering("sortOrder.in=" + DEFAULT_SORT_ORDER + "," + UPDATED_SORT_ORDER, "sortOrder.in=" + UPDATED_SORT_ORDER);
    }

    @Test
    @Transactional
    void getAllWebContentsBySortOrderIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where sortOrder is not null
        defaultWebContentFiltering("sortOrder.specified=true", "sortOrder.specified=false");
    }

    @Test
    @Transactional
    void getAllWebContentsBySortOrderIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where sortOrder is greater than or equal to
        defaultWebContentFiltering(
            "sortOrder.greaterThanOrEqual=" + DEFAULT_SORT_ORDER,
            "sortOrder.greaterThanOrEqual=" + UPDATED_SORT_ORDER
        );
    }

    @Test
    @Transactional
    void getAllWebContentsBySortOrderIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where sortOrder is less than or equal to
        defaultWebContentFiltering("sortOrder.lessThanOrEqual=" + DEFAULT_SORT_ORDER, "sortOrder.lessThanOrEqual=" + SMALLER_SORT_ORDER);
    }

    @Test
    @Transactional
    void getAllWebContentsBySortOrderIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where sortOrder is less than
        defaultWebContentFiltering("sortOrder.lessThan=" + UPDATED_SORT_ORDER, "sortOrder.lessThan=" + DEFAULT_SORT_ORDER);
    }

    @Test
    @Transactional
    void getAllWebContentsBySortOrderIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where sortOrder is greater than
        defaultWebContentFiltering("sortOrder.greaterThan=" + SMALLER_SORT_ORDER, "sortOrder.greaterThan=" + DEFAULT_SORT_ORDER);
    }

    @Test
    @Transactional
    void getAllWebContentsByIsActiveIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where isActive equals to
        defaultWebContentFiltering("isActive.equals=" + DEFAULT_IS_ACTIVE, "isActive.equals=" + UPDATED_IS_ACTIVE);
    }

    @Test
    @Transactional
    void getAllWebContentsByIsActiveIsInShouldWork() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where isActive in
        defaultWebContentFiltering("isActive.in=" + DEFAULT_IS_ACTIVE + "," + UPDATED_IS_ACTIVE, "isActive.in=" + UPDATED_IS_ACTIVE);
    }

    @Test
    @Transactional
    void getAllWebContentsByIsActiveIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        // Get all the webContentList where isActive is not null
        defaultWebContentFiltering("isActive.specified=true", "isActive.specified=false");
    }

    @Test
    @Transactional
    void getAllWebContentsByCollectionIsEqualToSomething() throws Exception {
        AssetCollection collection;
        if (TestUtil.findAll(em, AssetCollection.class).isEmpty()) {
            webContentRepository.saveAndFlush(webContent);
            collection = AssetCollectionResourceIT.createEntity();
        } else {
            collection = TestUtil.findAll(em, AssetCollection.class).get(0);
        }
        em.persist(collection);
        em.flush();
        webContent.setCollection(collection);
        webContentRepository.saveAndFlush(webContent);
        Long collectionId = collection.getId();
        // Get all the webContentList where collection equals to collectionId
        defaultWebContentShouldBeFound("collectionId.equals=" + collectionId);

        // Get all the webContentList where collection equals to (collectionId + 1)
        defaultWebContentShouldNotBeFound("collectionId.equals=" + (collectionId + 1));
    }

    private void defaultWebContentFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultWebContentShouldBeFound(shouldBeFound);
        defaultWebContentShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultWebContentShouldBeFound(String filter) throws Exception {
        restWebContentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(webContent.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].subtitle").value(hasItem(DEFAULT_SUBTITLE)))
            .andExpect(jsonPath("$.[*].imageUrl").value(hasItem(DEFAULT_IMAGE_URL)))
            .andExpect(jsonPath("$.[*].actionUrl").value(hasItem(DEFAULT_ACTION_URL)))
            .andExpect(jsonPath("$.[*].sortOrder").value(hasItem(DEFAULT_SORT_ORDER)))
            .andExpect(jsonPath("$.[*].isActive").value(hasItem(DEFAULT_IS_ACTIVE)));

        // Check, that the count call also returns 1
        restWebContentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultWebContentShouldNotBeFound(String filter) throws Exception {
        restWebContentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restWebContentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingWebContent() throws Exception {
        // Get the webContent
        restWebContentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingWebContent() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the webContent
        WebContent updatedWebContent = webContentRepository.findById(webContent.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedWebContent are not directly saved in db
        em.detach(updatedWebContent);
        updatedWebContent
            .title(UPDATED_TITLE)
            .subtitle(UPDATED_SUBTITLE)
            .imageUrl(UPDATED_IMAGE_URL)
            .actionUrl(UPDATED_ACTION_URL)
            .sortOrder(UPDATED_SORT_ORDER)
            .isActive(UPDATED_IS_ACTIVE);
        WebContentDTO webContentDTO = webContentMapper.toDto(updatedWebContent);

        restWebContentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, webContentDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(webContentDTO))
            )
            .andExpect(status().isOk());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedWebContentToMatchAllProperties(updatedWebContent);
    }

    @Test
    @Transactional
    void putNonExistingWebContent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        webContent.setId(longCount.incrementAndGet());

        // Create the WebContent
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restWebContentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, webContentDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(webContentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchWebContent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        webContent.setId(longCount.incrementAndGet());

        // Create the WebContent
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWebContentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(webContentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamWebContent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        webContent.setId(longCount.incrementAndGet());

        // Create the WebContent
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWebContentMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(webContentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateWebContentWithPatch() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the webContent using partial update
        WebContent partialUpdatedWebContent = new WebContent();
        partialUpdatedWebContent.setId(webContent.getId());

        partialUpdatedWebContent.subtitle(UPDATED_SUBTITLE).imageUrl(UPDATED_IMAGE_URL).isActive(UPDATED_IS_ACTIVE);

        restWebContentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedWebContent.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedWebContent))
            )
            .andExpect(status().isOk());

        // Validate the WebContent in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertWebContentUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedWebContent, webContent),
            getPersistedWebContent(webContent)
        );
    }

    @Test
    @Transactional
    void fullUpdateWebContentWithPatch() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the webContent using partial update
        WebContent partialUpdatedWebContent = new WebContent();
        partialUpdatedWebContent.setId(webContent.getId());

        partialUpdatedWebContent
            .title(UPDATED_TITLE)
            .subtitle(UPDATED_SUBTITLE)
            .imageUrl(UPDATED_IMAGE_URL)
            .actionUrl(UPDATED_ACTION_URL)
            .sortOrder(UPDATED_SORT_ORDER)
            .isActive(UPDATED_IS_ACTIVE);

        restWebContentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedWebContent.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedWebContent))
            )
            .andExpect(status().isOk());

        // Validate the WebContent in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertWebContentUpdatableFieldsEquals(partialUpdatedWebContent, getPersistedWebContent(partialUpdatedWebContent));
    }

    @Test
    @Transactional
    void patchNonExistingWebContent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        webContent.setId(longCount.incrementAndGet());

        // Create the WebContent
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restWebContentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, webContentDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(webContentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchWebContent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        webContent.setId(longCount.incrementAndGet());

        // Create the WebContent
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWebContentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(webContentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamWebContent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        webContent.setId(longCount.incrementAndGet());

        // Create the WebContent
        WebContentDTO webContentDTO = webContentMapper.toDto(webContent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWebContentMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(webContentDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the WebContent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteWebContent() throws Exception {
        // Initialize the database
        insertedWebContent = webContentRepository.saveAndFlush(webContent);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the webContent
        restWebContentMockMvc
            .perform(delete(ENTITY_API_URL_ID, webContent.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return webContentRepository.count();
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

    protected WebContent getPersistedWebContent(WebContent webContent) {
        return webContentRepository.findById(webContent.getId()).orElseThrow();
    }

    protected void assertPersistedWebContentToMatchAllProperties(WebContent expectedWebContent) {
        assertWebContentAllPropertiesEquals(expectedWebContent, getPersistedWebContent(expectedWebContent));
    }

    protected void assertPersistedWebContentToMatchUpdatableProperties(WebContent expectedWebContent) {
        assertWebContentAllUpdatablePropertiesEquals(expectedWebContent, getPersistedWebContent(expectedWebContent));
    }
}
