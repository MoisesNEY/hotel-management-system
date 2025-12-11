package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.CustomerDetails;
import org.hotel.repository.CustomerDetailsRepository;
import org.hotel.service.dto.CustomerDetailsDTO;
import org.hotel.service.mapper.CustomerDetailsMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.CustomerDetails}.
 */
@Service
@Transactional
public class CustomerDetailsService {

    private static final Logger LOG = LoggerFactory.getLogger(CustomerDetailsService.class);

    private final CustomerDetailsRepository customerDetailsRepository;

    private final CustomerDetailsMapper customerDetailsMapper;

    public CustomerDetailsService(CustomerDetailsRepository customerDetailsRepository, CustomerDetailsMapper customerDetailsMapper) {
        this.customerDetailsRepository = customerDetailsRepository;
        this.customerDetailsMapper = customerDetailsMapper;
    }

    /**
     * Save a customerDetails.
     *
     * @param customerDetailsDTO the entity to save.
     * @return the persisted entity.
     */
    public CustomerDetailsDTO save(CustomerDetailsDTO customerDetailsDTO) {
        LOG.debug("Request to save CustomerDetails : {}", customerDetailsDTO);
        CustomerDetails customerDetails = customerDetailsMapper.toEntity(customerDetailsDTO);
        customerDetails = customerDetailsRepository.save(customerDetails);
        return customerDetailsMapper.toDto(customerDetails);
    }

    /**
     * Update a customerDetails.
     *
     * @param customerDetailsDTO the entity to save.
     * @return the persisted entity.
     */
    public CustomerDetailsDTO update(CustomerDetailsDTO customerDetailsDTO) {
        LOG.debug("Request to update CustomerDetails : {}", customerDetailsDTO);
        CustomerDetails customerDetails = customerDetailsMapper.toEntity(customerDetailsDTO);
        customerDetails = customerDetailsRepository.save(customerDetails);
        return customerDetailsMapper.toDto(customerDetails);
    }

    /**
     * Partially update a customerDetails.
     *
     * @param customerDetailsDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CustomerDetailsDTO> partialUpdate(CustomerDetailsDTO customerDetailsDTO) {
        LOG.debug("Request to partially update CustomerDetails : {}", customerDetailsDTO);

        return customerDetailsRepository
            .findById(customerDetailsDTO.getId())
            .map(existingCustomerDetails -> {
                customerDetailsMapper.partialUpdate(existingCustomerDetails, customerDetailsDTO);

                return existingCustomerDetails;
            })
            .map(customerDetailsRepository::save)
            .map(customerDetailsMapper::toDto);
    }

    /**
     * Get all the customerDetails.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CustomerDetailsDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CustomerDetails");
        return customerDetailsRepository.findAll(pageable).map(customerDetailsMapper::toDto);
    }

    /**
     * Get all the customerDetails with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<CustomerDetailsDTO> findAllWithEagerRelationships(Pageable pageable) {
        return customerDetailsRepository.findAllWithEagerRelationships(pageable).map(customerDetailsMapper::toDto);
    }

    /**
     * Get one customerDetails by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CustomerDetailsDTO> findOne(Long id) {
        LOG.debug("Request to get CustomerDetails : {}", id);
        return customerDetailsRepository.findOneWithEagerRelationships(id).map(customerDetailsMapper::toDto);
    }

    /**
     * Delete the customerDetails by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete CustomerDetails : {}", id);
        customerDetailsRepository.deleteById(id);
    }
}
