package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.Customer;
import org.hotel.repository.CustomerRepository;
import org.hotel.service.dto.CustomerDTO;
import org.hotel.service.mapper.CustomerMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.Customer}.
 */
@Service
@Transactional
public class CustomerService {

    private static final Logger LOG = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository customerRepository;

    private final CustomerMapper customerMapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    /**
     * Save a customer.
     *
     * @param customerDTO the entity to save.
     * @return the persisted entity.
     */
    public CustomerDTO save(CustomerDTO customerDTO) {
        LOG.debug("Request to save Customer : {}", customerDTO);
        Customer customer = customerMapper.toEntity(customerDTO);
        customer = customerRepository.save(customer);
        return customerMapper.toDto(customer);
    }

    /**
     * Update a customer.
     *
     * @param customerDTO the entity to save.
     * @return the persisted entity.
     */
    public CustomerDTO update(CustomerDTO customerDTO) {
        LOG.debug("Request to update Customer : {}", customerDTO);
        Customer customer = customerMapper.toEntity(customerDTO);
        customer = customerRepository.save(customer);
        return customerMapper.toDto(customer);
    }

    /**
     * Partially update a customer.
     *
     * @param customerDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CustomerDTO> partialUpdate(CustomerDTO customerDTO) {
        LOG.debug("Request to partially update Customer : {}", customerDTO);

        return customerRepository
            .findById(customerDTO.getId())
            .map(existingCustomer -> {
                customerMapper.partialUpdate(existingCustomer, customerDTO);

                return existingCustomer;
            })
            .map(customerRepository::save)
            .map(customerMapper::toDto);
    }

    /**
     * Get all the customers.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CustomerDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Customers");
        return customerRepository.findAll(pageable).map(customerMapper::toDto);
    }

    /**
     * Get all the customers with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<CustomerDTO> findAllWithEagerRelationships(Pageable pageable) {
        return customerRepository.findAllWithEagerRelationships(pageable).map(customerMapper::toDto);
    }

    /**
     * Get one customer by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CustomerDTO> findOne(Long id) {
        LOG.debug("Request to get Customer : {}", id);
        return customerRepository.findOneWithEagerRelationships(id).map(customerMapper::toDto);
    }

    /**
     * Register an online customer linked to a user.
     *
     * @param user the user to link.
     * @param customerDTO the customer details.
     * @return the persisted customer.
     */
    public CustomerDTO registerOnlineCustomer(org.hotel.domain.User user, CustomerDTO customerDTO) {
        LOG.debug("Request to register Online Customer for user : {}", user.getLogin());
        if (customerRepository.findOneByLicenseId(customerDTO.getLicenseId()).isPresent()) {
             throw new org.hotel.web.rest.errors.BadRequestAlertException("Customer with this License ID already exists", "customer", "licenseIdexists");
        }

        Customer customer = customerMapper.toEntity(customerDTO);
        customer.setUser(user); // Link to user
        customer = customerRepository.save(customer);
        return customerMapper.toDto(customer);
    }

    /**
     * Create a walk-in customer without a user account.
     *
     * @param customerDTO the customer details.
     * @return the persisted customer.
     */
    public CustomerDTO createWalkInCustomer(CustomerDTO customerDTO) {
        LOG.debug("Request to create Walk-In Customer : {}", customerDTO);
        if (customerRepository.findOneByLicenseId(customerDTO.getLicenseId()).isPresent()) {
             throw new org.hotel.web.rest.errors.BadRequestAlertException("Customer with this License ID already exists", "customer", "licenseIdexists");
        }

        Customer customer = customerMapper.toEntity(customerDTO);
        customer.setUser(null); // Explicitly no user
        customer = customerRepository.save(customer);
        return customerMapper.toDto(customer);
    }

    /**
     * Get one customer by licenseId.
     *
     * @param licenseId the licenseId of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CustomerDTO> findOneByLicenseId(String licenseId) {
        LOG.debug("Request to get Customer by licenseId : {}", licenseId);
        return customerRepository.findOneByLicenseId(licenseId).map(customerMapper::toDto);
    }

    /**
     * Delete the customer by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Customer : {}", id);
        customerRepository.deleteById(id);
    }
}
