package org.hotel.service;

import org.hotel.config.ApplicationProperties;
import org.hotel.service.dto.AdminUserDTO;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class KeycloakService {

    private static final Logger LOG = LoggerFactory.getLogger(KeycloakService.class);

    private final ApplicationProperties applicationProperties;

    public KeycloakService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    private Keycloak getKeycloakInstance() {
        ApplicationProperties.Keycloak config = applicationProperties.getKeycloak();
        return KeycloakBuilder.builder()
                .serverUrl(config.getServerUrl())
                .realm(config.getRealm())
                .username(config.getUsername())
                .password(config.getPassword())
                .clientId("admin-cli")
                .build();
    }

    /**
     * Update user in Keycloak.
     *
     * @param userDTO user data to update.
     */
    public void updateUser(AdminUserDTO userDTO) {
        LOG.debug("Request to update user in Keycloak: {}", userDTO.getLogin());

        try (Keycloak keycloak = getKeycloakInstance()) {
            UserResource userResource = keycloak.realm(applicationProperties.getKeycloak().getRealm())
                    .users()
                    .get(userDTO.getId());

            UserRepresentation user = new UserRepresentation();
            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            // LangKey can be stored as a custom attribute or standard locale attribute
            user.singleAttribute("langKey", userDTO.getLangKey());
            user.singleAttribute("locale", userDTO.getLangKey());
            // Sincronizar URL de imagen con el atributo estándar de OIDC 'picture'
            user.singleAttribute("picture", userDTO.getImageUrl());

            userResource.update(user);
            LOG.info("User {} successfully updated in Keycloak", userDTO.getLogin());
        } catch (Exception e) {
            LOG.error("Error updating user in Keycloak: {}", e.getMessage(), e);
            throw new RuntimeException("Could not update user in Keycloak", e);
        }
    }
}
