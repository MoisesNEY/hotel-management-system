package org.hotel.service.client;

import org.hotel.domain.CustomerDetails;
import org.hotel.domain.User;
import org.hotel.repository.CustomerDetailsRepository;
import org.hotel.repository.UserRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsCreateRequest;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsUpdateRequest;
import org.hotel.service.dto.client.response.customerdetails.CustomerDetailsResponse;
import org.hotel.service.mapper.client.ClientCustomerDetailsMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class ClientCustomerDetailsService {

    private final Logger log = LoggerFactory.getLogger(ClientCustomerDetailsService.class);

    private final CustomerDetailsRepository customerDetailsRepository;
    private final ClientCustomerDetailsMapper clientCustomerDetailsMapper;
    private final UserRepository userRepository; // <--- NECESARIO

    public ClientCustomerDetailsService(
        CustomerDetailsRepository customerDetailsRepository,
        ClientCustomerDetailsMapper clientCustomerDetailsMapper,
        UserRepository userRepository
    ) {
        this.customerDetailsRepository = customerDetailsRepository;
        this.clientCustomerDetailsMapper = clientCustomerDetailsMapper;
        this.userRepository = userRepository;
    }

    /**
     * Obtiene el perfil del usuario logueado actualmente.
     * Retorna Optional porque puede que el usuario exista en Keycloak/User,
     * pero aún no haya rellenado este formulario de detalles.
     */
    @Transactional(readOnly = true)
    public Optional<CustomerDetailsResponse> findMyProfile() {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        // Buscamos por LOGIN
        return customerDetailsRepository.findOneByUserLogin(userLogin)
            .map(clientCustomerDetailsMapper::toClientResponse);
    }

    /**
     * Crea el perfil inicial (Solo se debe llamar una vez).
     */
    public CustomerDetailsResponse createProfile(CustomerDetailsCreateRequest request) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        // Validar que no exista ya un perfil para evitar duplicados/errores
        if (customerDetailsRepository.findOneByUserLogin(userLogin).isPresent()) {
            throw new BadRequestAlertException(
                "El perfil de cliente ya existe. Usa la opción de actualizar.",
                "customerDetails",
                "profileExists"
            );
        }

        // Obtener el User de JHipster para hacer el vínculo
        User currentUser = userRepository.findOneByLogin(userLogin)
            .orElseThrow(() -> new RuntimeException("Usuario JHipster no encontrado"));

        CustomerDetails entity = clientCustomerDetailsMapper.toEntity(request);

        entity.setUser(currentUser);

        entity = customerDetailsRepository.save(entity);

        return clientCustomerDetailsMapper.toClientResponse(entity);
    }

    /**
     * Actualiza datos parciales (Teléfono, Dirección, etc.).
     * No permite cambiar datos sensibles ni User.
     */
    public CustomerDetailsResponse updateProfile(CustomerDetailsUpdateRequest request) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        CustomerDetails entity = customerDetailsRepository.findOneByUserLogin(userLogin)
            .orElseThrow(() -> new RuntimeException("Perfil no encontrado. Debes crearlo primero."));

        clientCustomerDetailsMapper.updateFromDto(request, entity);

        entity = customerDetailsRepository.save(entity);

        return clientCustomerDetailsMapper.toClientResponse(entity);
    }
}
