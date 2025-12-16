package org.hotel.service;

import java.util.Objects;
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

    public CustomerDetailsService(CustomerDetailsRepository customerDetailsRepository, BookingRepository bookingRepository, CustomerDetailsMapper customerDetailsMapper) {
        this.customerDetailsRepository = customerDetailsRepository;
        this.bookingRepository = bookingRepository;
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

        // Validar que el usuario no tenga ya un perfil creado (OneToOne)
        if (customerDetailsDTO.getUser() != null &&
            customerDetailsRepository.existsByUserId(customerDetailsDTO.getUser().getId())) {
            throw new BusinessRuleException("Este usuario ya tiene un perfil de cliente asignado.");
        }

        // Validar duplicidad de documento de identidad (DNI/Pasaporte)
        validateUniqueLicenseId(customerDetailsDTO.getLicenseId(), null);

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

        // Recuperamos la entidad actual para comparar
        CustomerDetails existingDetails = customerDetailsRepository.findById(customerDetailsDTO.getId())
            .orElseThrow(() -> new ResourceNotFoundException("CustomerDetails", customerDetailsDTO.getId()));

        // No permitimos cambiar el usuario asociado una vez creado.
        validateIdentityLock(existingDetails, customerDetailsDTO);

        // Validar duplicidad de DNI (excluyendo el actual)
        validateUniqueLicenseId(customerDetailsDTO.getLicenseId(), customerDetailsDTO.getId());

        CustomerDetails customerDetails = customerDetailsMapper.toEntity(customerDetailsDTO);
        // Nos aseguramos que el usuario sea el original, por seguridad extra
        customerDetails.setUser(existingDetails.getUser());

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

                // 1. Validar Identity Lock si viene el campo User
                if (customerDetailsDTO.getUser() != null) {
                    validateIdentityLock(existingCustomerDetails, customerDetailsDTO);
                }

                // 2. Validar DNI si viene el campo
                if (customerDetailsDTO.getLicenseId() != null) {
                    validateUniqueLicenseId(customerDetailsDTO.getLicenseId(), existingCustomerDetails.getId());
                }

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

        CustomerDetails customerDetails = customerDetailsRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CustomerDetails", id));

        // Validar integridad: No borrar si el usuario tiene reservas
        String userId = customerDetails.getUser().getId();
        if (bookingRepository.existsByCustomerId(userId)) {
            throw new BusinessRuleException("No se puede eliminar el perfil del cliente porque tiene reservas asociadas.");
        }

        customerDetailsRepository.deleteById(id);
    }
    private void validateIdentityLock(CustomerDetails existing, CustomerDetailsDTO incoming) {
        // Si el DTO trae un usuario y es DIFERENTE al que ya existe en DB -> Error
        if (incoming.getUser() != null && incoming.getUser().getId() != null) {
            if (!existing.getUser().getId().equals(incoming.getUser().getId())) {
                throw new BusinessRuleException("No está permitido transferir el perfil de cliente a otro usuario del sistema.");
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
            // Caso Update: Buscar si existe alguien con ese DNI pero con ID distinto
            customerDetailsRepository.findOneByLicenseId(licenseId)
                .ifPresent(match -> {
                    if (!match.getId().equals(excludeId)) {
                        throw new BusinessRuleException("Ya existe un cliente con ese documento de identidad.");
                    }
                });
        }
    }
}
