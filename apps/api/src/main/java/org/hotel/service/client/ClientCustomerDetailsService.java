package org.hotel.service.client;

import org.hotel.domain.Customer;
import org.hotel.domain.User;
import org.hotel.repository.CustomerRepository;
import org.hotel.repository.UserRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsCreateRequest;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsUpdateRequest;
import org.hotel.service.dto.client.response.customerdetails.CustomerDetailsResponse;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;

@Service
@Transactional
public class ClientCustomerDetailsService {

    private final Logger log = LoggerFactory.getLogger(ClientCustomerDetailsService.class);

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public ClientCustomerDetailsService(
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
    public Optional<CustomerDetailsResponse> findMyProfile() {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        return customerRepository.findOneByUser_Login(userLogin)
            .map(this::toClientResponse);
    }

    /**
     * Crea el perfil inicial.
     */
    public CustomerDetailsResponse createProfile(CustomerDetailsCreateRequest request) {
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
        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setGender(request.getGender());
        entity.setPhone(request.getPhone());
        entity.setAddressLine1(request.getAddressLine1());
        entity.setCity(request.getCity());
        entity.setCountry(request.getCountry());
        entity.setLicenseId(request.getLicenseId());
        entity.setBirthDate(request.getBirthDate());
        
        // Asignar email del usuario si no viene en request (request anterior no tenía email)
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

        entity.setUser(currentUser); // Link User
        entity.setIdentificationType("DNI"); // Default or add to request if needed

        entity = customerRepository.save(entity);

        return toClientResponse(entity);
    }

    /**
     * Actualiza datos parciales.
     */
    public CustomerDetailsResponse updateProfile(CustomerDetailsUpdateRequest request) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        Customer entity = customerRepository.findOneByUser_Login(userLogin)
            .orElseThrow(() -> new RuntimeException("Perfil no encontrado. Debes crearlo primero."));

        // Update fields
        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setGender(request.getGender());
        entity.setPhone(request.getPhone());
        entity.setAddressLine1(request.getAddressLine1());
        entity.setCity(request.getCity());
        entity.setCountry(request.getCountry());

        entity = customerRepository.save(entity);

        return toClientResponse(entity);
    }

    private CustomerDetailsResponse toClientResponse(Customer entity) {
        CustomerDetailsResponse response = new CustomerDetailsResponse();
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
