package org.hotel.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hotel.domain.ServiceRequestAsserts.*;
import static org.hotel.web.rest.TestUtil.createUpdateProxyForBean;
import static org.hotel.web.rest.TestUtil.sameNumber;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.hotel.IntegrationTest;
import org.hotel.domain.Booking;
import org.hotel.domain.HotelService;
import org.hotel.domain.ServiceRequest;
import org.hotel.domain.enumeration.RequestStatus;
import org.hotel.repository.ServiceRequestRepository;
import org.hotel.service.ServiceRequestService;
import org.hotel.service.dto.ServiceRequestDTO;
import org.hotel.service.mapper.ServiceRequestMapper;
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
 * Integration tests for the {@link ServiceRequestResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ServiceRequestResourceIT {

    private static final Instant DEFAULT_REQUEST_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_REQUEST_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final RequestStatus DEFAULT_STATUS = RequestStatus.OPEN;
    private static final RequestStatus UPDATED_STATUS = RequestStatus.IN_PROGRESS;

    private static final String DEFAULT_DETAILS = "AAAAAAAAAA";
    private static final String UPDATED_DETAILS = "BBBBBBBBBB";

    private static final String DEFAULT_DELIVERY_ROOM_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_DELIVERY_ROOM_NUMBER = "BBBBBBBBBB";

    private static final Integer DEFAULT_QUANTITY = 1;
    private static final Integer UPDATED_QUANTITY = 2;

    private static final BigDecimal DEFAULT_TOTAL_COST = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL_COST = new BigDecimal(2);

    private static final String ENTITY_API_URL = "/api/service-requests";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Mock
    private ServiceRequestRepository serviceRequestRepositoryMock;

    @Autowired
    private ServiceRequestMapper serviceRequestMapper;

    @Mock
    private ServiceRequestService serviceRequestServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restServiceRequestMockMvc;

    private ServiceRequest serviceRequest;

    private ServiceRequest insertedServiceRequest;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ServiceRequest createEntity(EntityManager em) {
        ServiceRequest serviceRequest = new ServiceRequest()
            .requestDate(DEFAULT_REQUEST_DATE)
            .status(DEFAULT_STATUS)
            .details(DEFAULT_DETAILS)
            .deliveryRoomNumber(DEFAULT_DELIVERY_ROOM_NUMBER)
            .quantity(DEFAULT_QUANTITY)
            .totalCost(DEFAULT_TOTAL_COST);
        // Add required entity
        HotelService hotelService;
        if (TestUtil.findAll(em, HotelService.class).isEmpty()) {
            hotelService = HotelServiceResourceIT.createEntity();
            em.persist(hotelService);
            em.flush();
        } else {
            hotelService = TestUtil.findAll(em, HotelService.class).get(0);
        }
        serviceRequest.setService(hotelService);
        // Add required entity
        Booking booking;
        if (TestUtil.findAll(em, Booking.class).isEmpty()) {
            booking = BookingResourceIT.createEntity(em);
            em.persist(booking);
            em.flush();
        } else {
            booking = TestUtil.findAll(em, Booking.class).get(0);
        }
        serviceRequest.setBooking(booking);
        return serviceRequest;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ServiceRequest createUpdatedEntity(EntityManager em) {
        ServiceRequest updatedServiceRequest = new ServiceRequest()
            .requestDate(UPDATED_REQUEST_DATE)
            .status(UPDATED_STATUS)
            .details(UPDATED_DETAILS)
            .deliveryRoomNumber(UPDATED_DELIVERY_ROOM_NUMBER)
            .quantity(UPDATED_QUANTITY)
            .totalCost(UPDATED_TOTAL_COST);
        // Add required entity
        HotelService hotelService;
        if (TestUtil.findAll(em, HotelService.class).isEmpty()) {
            hotelService = HotelServiceResourceIT.createUpdatedEntity();
            em.persist(hotelService);
            em.flush();
        } else {
            hotelService = TestUtil.findAll(em, HotelService.class).get(0);
        }
        updatedServiceRequest.setService(hotelService);
        // Add required entity
        Booking booking;
        if (TestUtil.findAll(em, Booking.class).isEmpty()) {
            booking = BookingResourceIT.createUpdatedEntity(em);
            em.persist(booking);
            em.flush();
        } else {
            booking = TestUtil.findAll(em, Booking.class).get(0);
        }
        updatedServiceRequest.setBooking(booking);
        return updatedServiceRequest;
    }

    @BeforeEach
    void initTest() {
        serviceRequest = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedServiceRequest != null) {
            serviceRequestRepository.delete(insertedServiceRequest);
            insertedServiceRequest = null;
        }
    }

    @Test
    @Transactional
    void createServiceRequest() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ServiceRequest
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);
        var returnedServiceRequestDTO = om.readValue(
            restServiceRequestMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(serviceRequestDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ServiceRequestDTO.class
        );

        // Validate the ServiceRequest in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedServiceRequest = serviceRequestMapper.toEntity(returnedServiceRequestDTO);
        assertServiceRequestUpdatableFieldsEquals(returnedServiceRequest, getPersistedServiceRequest(returnedServiceRequest));

        insertedServiceRequest = returnedServiceRequest;
    }

    @Test
    @Transactional
    void createServiceRequestWithExistingId() throws Exception {
        // Create the ServiceRequest with an existing ID
        serviceRequest.setId(1L);
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restServiceRequestMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkRequestDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        serviceRequest.setRequestDate(null);

        // Create the ServiceRequest, which fails.
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        restServiceRequestMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        serviceRequest.setStatus(null);

        // Create the ServiceRequest, which fails.
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        restServiceRequestMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllServiceRequests() throws Exception {
        // Initialize the database
        insertedServiceRequest = serviceRequestRepository.saveAndFlush(serviceRequest);

        // Get all the serviceRequestList
        restServiceRequestMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(serviceRequest.getId().intValue())))
            .andExpect(jsonPath("$.[*].requestDate").value(hasItem(DEFAULT_REQUEST_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].details").value(hasItem(DEFAULT_DETAILS)))
            .andExpect(jsonPath("$.[*].deliveryRoomNumber").value(hasItem(DEFAULT_DELIVERY_ROOM_NUMBER)))
            .andExpect(jsonPath("$.[*].quantity").value(hasItem(DEFAULT_QUANTITY)))
            .andExpect(jsonPath("$.[*].totalCost").value(hasItem(sameNumber(DEFAULT_TOTAL_COST))));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllServiceRequestsWithEagerRelationshipsIsEnabled() throws Exception {
        when(serviceRequestServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restServiceRequestMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(serviceRequestServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllServiceRequestsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(serviceRequestServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restServiceRequestMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(serviceRequestRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getServiceRequest() throws Exception {
        // Initialize the database
        insertedServiceRequest = serviceRequestRepository.saveAndFlush(serviceRequest);

        // Get the serviceRequest
        restServiceRequestMockMvc
            .perform(get(ENTITY_API_URL_ID, serviceRequest.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(serviceRequest.getId().intValue()))
            .andExpect(jsonPath("$.requestDate").value(DEFAULT_REQUEST_DATE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.details").value(DEFAULT_DETAILS))
            .andExpect(jsonPath("$.deliveryRoomNumber").value(DEFAULT_DELIVERY_ROOM_NUMBER))
            .andExpect(jsonPath("$.quantity").value(DEFAULT_QUANTITY))
            .andExpect(jsonPath("$.totalCost").value(sameNumber(DEFAULT_TOTAL_COST)));
    }

    @Test
    @Transactional
    void getNonExistingServiceRequest() throws Exception {
        // Get the serviceRequest
        restServiceRequestMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingServiceRequest() throws Exception {
        // Initialize the database
        insertedServiceRequest = serviceRequestRepository.saveAndFlush(serviceRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the serviceRequest
        ServiceRequest updatedServiceRequest = serviceRequestRepository.findById(serviceRequest.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedServiceRequest are not directly saved in db
        em.detach(updatedServiceRequest);
        updatedServiceRequest
            .requestDate(UPDATED_REQUEST_DATE)
            .status(UPDATED_STATUS)
            .details(UPDATED_DETAILS)
            .deliveryRoomNumber(UPDATED_DELIVERY_ROOM_NUMBER)
            .quantity(UPDATED_QUANTITY)
            .totalCost(UPDATED_TOTAL_COST);
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(updatedServiceRequest);

        restServiceRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, serviceRequestDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isOk());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedServiceRequestToMatchAllProperties(updatedServiceRequest);
    }

    @Test
    @Transactional
    void putNonExistingServiceRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        serviceRequest.setId(longCount.incrementAndGet());

        // Create the ServiceRequest
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restServiceRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, serviceRequestDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchServiceRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        serviceRequest.setId(longCount.incrementAndGet());

        // Create the ServiceRequest
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServiceRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamServiceRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        serviceRequest.setId(longCount.incrementAndGet());

        // Create the ServiceRequest
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServiceRequestMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateServiceRequestWithPatch() throws Exception {
        // Initialize the database
        insertedServiceRequest = serviceRequestRepository.saveAndFlush(serviceRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the serviceRequest using partial update
        ServiceRequest partialUpdatedServiceRequest = new ServiceRequest();
        partialUpdatedServiceRequest.setId(serviceRequest.getId());

        partialUpdatedServiceRequest.status(UPDATED_STATUS).deliveryRoomNumber(UPDATED_DELIVERY_ROOM_NUMBER);

        restServiceRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedServiceRequest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedServiceRequest))
            )
            .andExpect(status().isOk());

        // Validate the ServiceRequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertServiceRequestUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedServiceRequest, serviceRequest),
            getPersistedServiceRequest(serviceRequest)
        );
    }

    @Test
    @Transactional
    void fullUpdateServiceRequestWithPatch() throws Exception {
        // Initialize the database
        insertedServiceRequest = serviceRequestRepository.saveAndFlush(serviceRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the serviceRequest using partial update
        ServiceRequest partialUpdatedServiceRequest = new ServiceRequest();
        partialUpdatedServiceRequest.setId(serviceRequest.getId());

        partialUpdatedServiceRequest
            .requestDate(UPDATED_REQUEST_DATE)
            .status(UPDATED_STATUS)
            .details(UPDATED_DETAILS)
            .deliveryRoomNumber(UPDATED_DELIVERY_ROOM_NUMBER)
            .quantity(UPDATED_QUANTITY)
            .totalCost(UPDATED_TOTAL_COST);

        restServiceRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedServiceRequest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedServiceRequest))
            )
            .andExpect(status().isOk());

        // Validate the ServiceRequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertServiceRequestUpdatableFieldsEquals(partialUpdatedServiceRequest, getPersistedServiceRequest(partialUpdatedServiceRequest));
    }

    @Test
    @Transactional
    void patchNonExistingServiceRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        serviceRequest.setId(longCount.incrementAndGet());

        // Create the ServiceRequest
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restServiceRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, serviceRequestDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchServiceRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        serviceRequest.setId(longCount.incrementAndGet());

        // Create the ServiceRequest
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServiceRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamServiceRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        serviceRequest.setId(longCount.incrementAndGet());

        // Create the ServiceRequest
        ServiceRequestDTO serviceRequestDTO = serviceRequestMapper.toDto(serviceRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServiceRequestMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(serviceRequestDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ServiceRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteServiceRequest() throws Exception {
        // Initialize the database
        insertedServiceRequest = serviceRequestRepository.saveAndFlush(serviceRequest);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the serviceRequest
        restServiceRequestMockMvc
            .perform(delete(ENTITY_API_URL_ID, serviceRequest.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return serviceRequestRepository.count();
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

    protected ServiceRequest getPersistedServiceRequest(ServiceRequest serviceRequest) {
        return serviceRequestRepository.findById(serviceRequest.getId()).orElseThrow();
    }

    protected void assertPersistedServiceRequestToMatchAllProperties(ServiceRequest expectedServiceRequest) {
        assertServiceRequestAllPropertiesEquals(expectedServiceRequest, getPersistedServiceRequest(expectedServiceRequest));
    }

    protected void assertPersistedServiceRequestToMatchUpdatableProperties(ServiceRequest expectedServiceRequest) {
        assertServiceRequestAllUpdatablePropertiesEquals(expectedServiceRequest, getPersistedServiceRequest(expectedServiceRequest));
    }
}
