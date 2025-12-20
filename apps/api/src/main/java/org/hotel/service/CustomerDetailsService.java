package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.CustomerDetails;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.CustomerDetailsRepository;
import org.hotel.service.dto.CustomerDetailsDTO;
import org.hotel.service.mapper.CustomerDetailsMapper;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
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
    private final BookingRepository bookingRepository;
    private final CustomerDetailsMapper customerDetailsMapper;

    public CustomerDetailsService(CustomerDetailsRepository customerDetailsRepository,
                                  BookingRepository bookingRepository,
                                  CustomerDetailsMapper customerDetailsMapper) {
        this.customerDetailsRepository = customerDetailsRepository;
        this.bookingRepository = bookingRepository;
        this.customerDetailsMapper = customerDetailsMapper;
    }

    /**
     * Save a customerDetails.
     */
    public CustomerDetailsDTO save(CustomerDetailsDTO customerDetailsDTO) {
        LOG.debug("Request to save CustomerDetails : {}", customerDetailsDTO);

        // 1. Validar que el usuario no tenga ya un perfil (OneToOne)
        if (customerDetailsDTO.getUser() != null &&
            customerDetailsRepository.existsByUserId(customerDetailsDTO.getUser().getId())) {
            throw new BusinessRuleException("Este usuario ya tiene un perfil de cliente asignado.");
        }

        // 2. Validar duplicidad de documento (DNI/Pasaporte)
        validateUniqueLicenseId(customerDetailsDTO.getLicenseId(), null);

        CustomerDetails customerDetails = customerDetailsMapper.toEntity(customerDetailsDTO);
        customerDetails = customerDetailsRepository.save(customerDetails);
        return customerDetailsMapper.toDto(customerDetails);
    }

    /**
     * Update a customerDetails.
     */
    public CustomerDetailsDTO update(CustomerDetailsDTO customerDetailsDTO) {
        LOG.debug("Request to update CustomerDetails : {}", customerDetailsDTO);

        CustomerDetails existingDetails = customerDetailsRepository.findById(customerDetailsDTO.getId())
            .orElseThrow(() -> new ResourceNotFoundException("CustomerDetails", customerDetailsDTO.getId()));

        // 3. Identity Lock: No permitir cambiar el User ID
        validateIdentityLock(existingDetails, customerDetailsDTO);

        // 4. Validar duplicidad de DNI excluyendo al actual
        validateUniqueLicenseId(customerDetailsDTO.getLicenseId(), customerDetailsDTO.getId());

        CustomerDetails customerDetails = customerDetailsMapper.toEntity(customerDetailsDTO);
        // Fuerza el usuario original por seguridad
        customerDetails.setUser(existingDetails.getUser());

        customerDetails = customerDetailsRepository.save(customerDetails);
        return customerDetailsMapper.toDto(customerDetails);
    }

    /**
     * Partially update a customerDetails.
     */
    public Optional<CustomerDetailsDTO> partialUpdate(CustomerDetailsDTO customerDetailsDTO) {
        LOG.debug("Request to partially update CustomerDetails : {}", customerDetailsDTO);

        return customerDetailsRepository
            .findById(customerDetailsDTO.getId())
            .map(existingCustomerDetails -> {

                // Validar Identity Lock si intentan cambiar el usuario
                if (customerDetailsDTO.getUser() != null) {
                    validateIdentityLock(existingCustomerDetails, customerDetailsDTO);
                }

                // Validar DNI si intentan cambiarlo
                if (customerDetailsDTO.getLicenseId() != null) {
                    validateUniqueLicenseId(customerDetailsDTO.getLicenseId(), existingCustomerDetails.getId());
                }

                customerDetailsMapper.partialUpdate(existingCustomerDetails, customerDetailsDTO);
                return existingCustomerDetails;
            })
            .map(customerDetailsRepository::save)
            .map(customerDetailsMapper::toDto);
    }

    // ... Métodos findAll y findOne estándar ...

    @Transactional(readOnly = true)
    public Page<CustomerDetailsDTO> findAll(Pageable pageable) {
        return customerDetailsRepository.findAll(pageable).map(customerDetailsMapper::toDto);
    }

    public Page<CustomerDetailsDTO> findAllWithEagerRelationships(Pageable pageable) {
        return customerDetailsRepository.findAllWithEagerRelationships(pageable).map(customerDetailsMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<CustomerDetailsDTO> findOne(Long id) {
        return customerDetailsRepository.findOneWithEagerRelationships(id).map(customerDetailsMapper::toDto);
    }

    /**
     * Delete the customerDetails by id.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete CustomerDetails : {}", id);

        CustomerDetails customerDetails = customerDetailsRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CustomerDetails", id));

        // 5. Validar Integridad: No borrar si hay reservas
        String userId = customerDetails.getUser().getId();
        if (bookingRepository.existsByCustomerId(userId)) {
            throw new BusinessRuleException("No se puede eliminar el perfil porque tiene reservas asociadas.");
        }

        customerDetailsRepository.deleteById(id);
    }

    // --- VALIDACIONES PRIVADAS ---

    private void validateIdentityLock(CustomerDetails existing, CustomerDetailsDTO incoming) {
        if (incoming.getUser() != null && incoming.getUser().getId() != null) {
            if (!existing.getUser().getId().equals(incoming.getUser().getId())) {
                throw new BusinessRuleException("No está permitido transferir el perfil de cliente a otro usuario.");
            }
        }
    }

    private void validateUniqueLicenseId(String licenseId, Long excludeId) {
        if (excludeId == null) {
            // Caso Create
            if (customerDetailsRepository.existsByLicenseId(licenseId)) {
                throw new BusinessRuleException("Ya existe un cliente con ese documento de identidad.");
            }
        } else {
            // Caso Update
            customerDetailsRepository.findOneByLicenseId(licenseId)
                .ifPresent(match -> {
                    if (!match.getId().equals(excludeId)) {
                        throw new BusinessRuleException("Ya existe un cliente con ese documento de identidad.");
                    }
                });
        }
    }
}
