package org.hotel.service.client;

import org.hotel.domain.Customer;
import org.hotel.domain.User;
import org.hotel.repository.CustomerRepository;
import org.hotel.repository.UserRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.customer.CustomerCreateRequest;
import org.hotel.service.dto.client.request.customer.CustomerUpdateRequest;
import org.hotel.service.dto.client.response.customer.CustomerResponse;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.BusinessRuleException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;

@Service
@Transactional
public class ClientCustomerService {



    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public ClientCustomerService(
        CustomerRepository customerRepository,
        UserRepository userRepository
    ) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    /**
     * Obtiene el perfil del usuario logueado actualmente.
     */
    @Transactional(readOnly = true)
    public Optional<CustomerResponse> findMyProfile() {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        return customerRepository.findOneByUser_Login(userLogin)
            .map(this::toClientResponse);
    }

    /**
     * Crea el perfil inicial.
     */
    public CustomerResponse createProfile(CustomerCreateRequest request) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        if (customerRepository.findOneByUser_Login(userLogin).isPresent()) {
            throw new BadRequestAlertException(
                "El perfil de cliente ya existe. Usa la opción de actualizar.",
                "customer",
                "profileExists"
            );
        }

        User currentUser = userRepository.findOneByLogin(userLogin)
            .orElseThrow(() -> new RuntimeException("Usuario JHipster no encontrado"));

        Customer entity = new Customer();
        entity.setFirstName(request.getFirstName() != null ? request.getFirstName() : currentUser.getFirstName());
        entity.setLastName(request.getLastName() != null ? request.getLastName() : currentUser.getLastName());
        entity.setGender(request.getGender());
        entity.setPhone(request.getPhone());
        entity.setAddressLine1(request.getAddressLine1());
        entity.setCity(request.getCity());
        entity.setCountry(request.getCountry());
        entity.setLicenseId(request.getLicenseId());
        entity.setBirthDate(request.getBirthDate());
        
        if (currentUser.getEmail() != null) {
            entity.setEmail(currentUser.getEmail());
        }

        // Check Age
        int age = Period.between(request.getBirthDate(), LocalDate.now()).getYears();
        if (age < 18) {
            throw new BusinessRuleException("Debes ser mayor de 18 años para acceder nuestros servicios.");
        }
        if (age > 120) {
            throw new BusinessRuleException("La fecha de nacimiento no es válida.");
        }

        if (entity.getFirstName() == null || entity.getLastName() == null) {
             throw new BadRequestAlertException("Nombre y apellido son obligatorios si no están en tu perfil de usuario.", "customer", "missingName");
        }

        entity.setUser(currentUser); 
        entity.setIdentificationType("DNI"); 

        entity = customerRepository.save(entity);

        return toClientResponse(entity);
    }

    /**
     * Actualiza datos parciales.
     */
    public CustomerResponse updateProfile(CustomerUpdateRequest request) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        Customer entity = customerRepository.findOneByUser_Login(userLogin)
            .orElseThrow(() -> new RuntimeException("Perfil no encontrado. Debes crearlo primero."));

        if (request.getFirstName() != null) entity.setFirstName(request.getFirstName());
        if (request.getLastName() != null) entity.setLastName(request.getLastName());
        if (request.getGender() != null) entity.setGender(request.getGender());
        if (request.getPhone() != null) entity.setPhone(request.getPhone());
        if (request.getAddressLine1() != null) entity.setAddressLine1(request.getAddressLine1());
        if (request.getCity() != null) entity.setCity(request.getCity());
        if (request.getCountry() != null) entity.setCountry(request.getCountry());

        entity = customerRepository.save(entity);

        return toClientResponse(entity);
    }

    private CustomerResponse toClientResponse(Customer entity) {
        CustomerResponse response = new CustomerResponse();
        response.setId(entity.getId());
        response.setFirstName(entity.getFirstName());
        response.setLastName(entity.getLastName());
        response.setEmail(entity.getEmail());
        response.setGender(entity.getGender());
        response.setPhone(entity.getPhone());
        response.setAddressLine1(entity.getAddressLine1());
        response.setCity(entity.getCity());
        response.setCountry(entity.getCountry());
        response.setLicenseId(entity.getLicenseId());
        response.setBirthDate(entity.getBirthDate());
        return response;
    }
}
