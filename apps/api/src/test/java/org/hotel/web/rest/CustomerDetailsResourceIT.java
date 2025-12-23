package org.hotel.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hotel.domain.CustomerDetailsAsserts.*;
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
import org.hotel.domain.CustomerDetails;
import org.hotel.domain.User;
import org.hotel.domain.enumeration.Gender;
import org.hotel.repository.CustomerDetailsRepository;
import org.hotel.repository.UserRepository;
import org.hotel.service.CustomerDetailsService;
import org.hotel.service.dto.CustomerDetailsDTO;
import org.hotel.service.mapper.CustomerDetailsMapper;
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
 * Integration tests for the {@link CustomerDetailsResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CustomerDetailsResourceIT {

    private static final Gender DEFAULT_GENDER = Gender.MALE;
    private static final Gender UPDATED_GENDER = Gender.FEMALE;

    private static final String DEFAULT_PHONE = "764254222";
    private static final String UPDATED_PHONE = "63738130";

    private static final String DEFAULT_ADDRESS_LINE_1 = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS_LINE_1 = "BBBBBBBBBB";

    private static final String DEFAULT_CITY = "AAAAAAAAAA";
    private static final String UPDATED_CITY = "BBBBBBBBBB";

    private static final String DEFAULT_COUNTRY = "AAAAAAAAAA";
    private static final String UPDATED_COUNTRY = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_IDENTIFICATION_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_IDENTIFICATION_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_LICENSE_ID = "AAAAAAAAAA";
    private static final String UPDATED_LICENSE_ID = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_BIRTH_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_BIRTH_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final String ENTITY_API_URL = "/api/customer-details";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CustomerDetailsRepository customerDetailsRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private CustomerDetailsRepository customerDetailsRepositoryMock;

    @Autowired
    private CustomerDetailsMapper customerDetailsMapper;

    @Mock
    private CustomerDetailsService customerDetailsServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCustomerDetailsMockMvc;

    private CustomerDetails customerDetails;

    private CustomerDetails insertedCustomerDetails;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CustomerDetails createEntity(EntityManager em) {
        CustomerDetails customerDetails = new CustomerDetails()
            .gender(DEFAULT_GENDER)
            .phone(DEFAULT_PHONE)
            .addressLine1(DEFAULT_ADDRESS_LINE_1)
            .city(DEFAULT_CITY)
            .country(DEFAULT_COUNTRY)
            .email(DEFAULT_EMAIL)
            .identificationType(DEFAULT_IDENTIFICATION_TYPE)
            .licenseId(DEFAULT_LICENSE_ID)
            .birthDate(DEFAULT_BIRTH_DATE);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        customerDetails.setUser(user);
        return customerDetails;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CustomerDetails createUpdatedEntity(EntityManager em) {
        CustomerDetails updatedCustomerDetails = new CustomerDetails()
            .gender(UPDATED_GENDER)
            .phone(UPDATED_PHONE)
            .addressLine1(UPDATED_ADDRESS_LINE_1)
            .city(UPDATED_CITY)
            .country(UPDATED_COUNTRY)
            .email(UPDATED_EMAIL)
            .identificationType(UPDATED_IDENTIFICATION_TYPE)
            .licenseId(UPDATED_LICENSE_ID)
            .birthDate(UPDATED_BIRTH_DATE);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        updatedCustomerDetails.setUser(user);
        return updatedCustomerDetails;
    }

    @BeforeEach
    void initTest() {
        customerDetails = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedCustomerDetails != null) {
            customerDetailsRepository.delete(insertedCustomerDetails);
            insertedCustomerDetails = null;
        }
        userRepository.deleteAll();
    }

    @Test
    @Transactional
    void createCustomerDetails() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CustomerDetails
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);
        var returnedCustomerDetailsDTO = om.readValue(
            restCustomerDetailsMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(customerDetailsDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CustomerDetailsDTO.class
        );

        // Validate the CustomerDetails in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCustomerDetails = customerDetailsMapper.toEntity(returnedCustomerDetailsDTO);
        assertCustomerDetailsUpdatableFieldsEquals(returnedCustomerDetails, getPersistedCustomerDetails(returnedCustomerDetails));

        insertedCustomerDetails = returnedCustomerDetails;
    }

    @Test
    @Transactional
    void createCustomerDetailsWithExistingId() throws Exception {
        // Create the CustomerDetails with an existing ID
        customerDetails.setId(1L);
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkGenderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setGender(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPhoneIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setPhone(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAddressLine1IsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setAddressLine1(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCityIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setCity(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCountryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setCountry(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEmailIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setEmail(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLicenseIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setLicenseId(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBirthDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        customerDetails.setBirthDate(null);

        // Create the CustomerDetails, which fails.
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        restCustomerDetailsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCustomerDetails() throws Exception {
        // Initialize the database
        insertedCustomerDetails = customerDetailsRepository.saveAndFlush(customerDetails);

        // Get all the customerDetailsList
        restCustomerDetailsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(customerDetails.getId().intValue())))
            .andExpect(jsonPath("$.[*].gender").value(hasItem(DEFAULT_GENDER.toString())))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)))
            .andExpect(jsonPath("$.[*].addressLine1").value(hasItem(DEFAULT_ADDRESS_LINE_1)))
            .andExpect(jsonPath("$.[*].city").value(hasItem(DEFAULT_CITY)))
            .andExpect(jsonPath("$.[*].country").value(hasItem(DEFAULT_COUNTRY)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].identificationType").value(hasItem(DEFAULT_IDENTIFICATION_TYPE)))
            .andExpect(jsonPath("$.[*].licenseId").value(hasItem(DEFAULT_LICENSE_ID)))
            .andExpect(jsonPath("$.[*].birthDate").value(hasItem(DEFAULT_BIRTH_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCustomerDetailsWithEagerRelationshipsIsEnabled() throws Exception {
        when(customerDetailsServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCustomerDetailsMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(customerDetailsServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCustomerDetailsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(customerDetailsServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCustomerDetailsMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(customerDetailsRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getCustomerDetails() throws Exception {
        // Initialize the database
        insertedCustomerDetails = customerDetailsRepository.saveAndFlush(customerDetails);

        // Get the customerDetails
        restCustomerDetailsMockMvc
            .perform(get(ENTITY_API_URL_ID, customerDetails.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(customerDetails.getId().intValue()))
            .andExpect(jsonPath("$.gender").value(DEFAULT_GENDER.toString()))
            .andExpect(jsonPath("$.phone").value(DEFAULT_PHONE))
            .andExpect(jsonPath("$.addressLine1").value(DEFAULT_ADDRESS_LINE_1))
            .andExpect(jsonPath("$.city").value(DEFAULT_CITY))
            .andExpect(jsonPath("$.country").value(DEFAULT_COUNTRY))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL))
            .andExpect(jsonPath("$.identificationType").value(DEFAULT_IDENTIFICATION_TYPE))
            .andExpect(jsonPath("$.licenseId").value(DEFAULT_LICENSE_ID))
            .andExpect(jsonPath("$.birthDate").value(DEFAULT_BIRTH_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingCustomerDetails() throws Exception {
        // Get the customerDetails
        restCustomerDetailsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCustomerDetails() throws Exception {
        // Initialize the database
        insertedCustomerDetails = customerDetailsRepository.saveAndFlush(customerDetails);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the customerDetails
        CustomerDetails updatedCustomerDetails = customerDetailsRepository.findById(customerDetails.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCustomerDetails are not directly saved in db
        em.detach(updatedCustomerDetails);
        updatedCustomerDetails
            .gender(UPDATED_GENDER)
            .phone(UPDATED_PHONE)
            .addressLine1(UPDATED_ADDRESS_LINE_1)
            .city(UPDATED_CITY)
            .country(UPDATED_COUNTRY)
            .email(UPDATED_EMAIL)
            .identificationType(UPDATED_IDENTIFICATION_TYPE)
            .licenseId(UPDATED_LICENSE_ID)
            .birthDate(UPDATED_BIRTH_DATE);
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(updatedCustomerDetails);

        restCustomerDetailsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, customerDetailsDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isOk());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCustomerDetailsToMatchAllProperties(updatedCustomerDetails);
    }

    @Test
    @Transactional
    void putNonExistingCustomerDetails() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        customerDetails.setId(longCount.incrementAndGet());

        // Create the CustomerDetails
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCustomerDetailsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, customerDetailsDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCustomerDetails() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        customerDetails.setId(longCount.incrementAndGet());

        // Create the CustomerDetails
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCustomerDetailsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCustomerDetails() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        customerDetails.setId(longCount.incrementAndGet());

        // Create the CustomerDetails
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCustomerDetailsMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCustomerDetailsWithPatch() throws Exception {
        // Initialize the database
        insertedCustomerDetails = customerDetailsRepository.saveAndFlush(customerDetails);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the customerDetails using partial update
        CustomerDetails partialUpdatedCustomerDetails = new CustomerDetails();
        partialUpdatedCustomerDetails.setId(customerDetails.getId());

        partialUpdatedCustomerDetails
            .gender(UPDATED_GENDER)
            .phone(UPDATED_PHONE)
            .addressLine1(UPDATED_ADDRESS_LINE_1)
            .country(UPDATED_COUNTRY)
            .email(UPDATED_EMAIL)
            .licenseId(UPDATED_LICENSE_ID);

        restCustomerDetailsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCustomerDetails.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCustomerDetails))
            )
            .andExpect(status().isOk());

        // Validate the CustomerDetails in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCustomerDetailsUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCustomerDetails, customerDetails),
            getPersistedCustomerDetails(customerDetails)
        );
    }

    @Test
    @Transactional
    void fullUpdateCustomerDetailsWithPatch() throws Exception {
        // Initialize the database
        insertedCustomerDetails = customerDetailsRepository.saveAndFlush(customerDetails);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the customerDetails using partial update
        CustomerDetails partialUpdatedCustomerDetails = new CustomerDetails();
        partialUpdatedCustomerDetails.setId(customerDetails.getId());

        partialUpdatedCustomerDetails
            .gender(UPDATED_GENDER)
            .phone(UPDATED_PHONE)
            .addressLine1(UPDATED_ADDRESS_LINE_1)
            .city(UPDATED_CITY)
            .country(UPDATED_COUNTRY)
            .email(UPDATED_EMAIL)
            .identificationType(UPDATED_IDENTIFICATION_TYPE)
            .licenseId(UPDATED_LICENSE_ID)
            .birthDate(UPDATED_BIRTH_DATE);

        restCustomerDetailsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCustomerDetails.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCustomerDetails))
            )
            .andExpect(status().isOk());

        // Validate the CustomerDetails in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCustomerDetailsUpdatableFieldsEquals(
            partialUpdatedCustomerDetails,
            getPersistedCustomerDetails(partialUpdatedCustomerDetails)
        );
    }

    @Test
    @Transactional
    void patchNonExistingCustomerDetails() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        customerDetails.setId(longCount.incrementAndGet());

        // Create the CustomerDetails
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCustomerDetailsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, customerDetailsDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCustomerDetails() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        customerDetails.setId(longCount.incrementAndGet());

        // Create the CustomerDetails
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCustomerDetailsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCustomerDetails() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        customerDetails.setId(longCount.incrementAndGet());

        // Create the CustomerDetails
        CustomerDetailsDTO customerDetailsDTO = customerDetailsMapper.toDto(customerDetails);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCustomerDetailsMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(customerDetailsDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CustomerDetails in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCustomerDetails() throws Exception {
        // Initialize the database
        insertedCustomerDetails = customerDetailsRepository.saveAndFlush(customerDetails);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the customerDetails
        restCustomerDetailsMockMvc
            .perform(delete(ENTITY_API_URL_ID, customerDetails.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return customerDetailsRepository.count();
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

    protected CustomerDetails getPersistedCustomerDetails(CustomerDetails customerDetails) {
        return customerDetailsRepository.findById(customerDetails.getId()).orElseThrow();
    }

    protected void assertPersistedCustomerDetailsToMatchAllProperties(CustomerDetails expectedCustomerDetails) {
        assertCustomerDetailsAllPropertiesEquals(expectedCustomerDetails, getPersistedCustomerDetails(expectedCustomerDetails));
    }

    protected void assertPersistedCustomerDetailsToMatchUpdatableProperties(CustomerDetails expectedCustomerDetails) {
        assertCustomerDetailsAllUpdatablePropertiesEquals(expectedCustomerDetails, getPersistedCustomerDetails(expectedCustomerDetails));
    }
}
