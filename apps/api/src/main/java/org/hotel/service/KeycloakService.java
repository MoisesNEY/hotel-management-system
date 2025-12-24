package org.hotel.service;

import jakarta.ws.rs.core.Response;
import org.hotel.config.ApplicationProperties;
import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.dto.AdminUserDTO;
import org.hotel.service.dto.CreateUserDTO;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

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

    /**
     * Create a new user in Keycloak with ROLE_EMPLOYEE.
     *
     * @param createDTO user data to create.
     * @return the Keycloak user ID of the created user.
     */
    public String createUser(CreateUserDTO createDTO) {
        LOG.debug("Request to create user in Keycloak: {}", createDTO.getLogin());

        try (Keycloak keycloak = getKeycloakInstance()) {
            String realmName = applicationProperties.getKeycloak().getRealm();
            RealmResource realmResource = keycloak.realm(realmName);
            UsersResource usersResource = realmResource.users();

            // 1. Create user representation
            UserRepresentation user = new UserRepresentation();
            user.setUsername(createDTO.getLogin());
            user.setEmail(createDTO.getEmail());
            user.setFirstName(createDTO.getFirstName());
            user.setLastName(createDTO.getLastName());
            user.setEnabled(true);
            user.setEmailVerified(true);

            // 2. Create user in Keycloak
            Response response = usersResource.create(user);

            if (response.getStatus() != 201) {
                String errorMessage = response.readEntity(String.class);
                LOG.error("Failed to create user in Keycloak. Status: {}, Error: {}", response.getStatus(),
                        errorMessage);
                throw new RuntimeException("Could not create user in Keycloak: " + errorMessage);
            }

            // 3. Extract user ID from response location header
            String locationHeader = response.getHeaderString("Location");
            String userId = locationHeader.substring(locationHeader.lastIndexOf('/') + 1);
            LOG.debug("Created user with ID: {}", userId);

            // 4. Set password for the user
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(createDTO.getPassword());
            credential.setTemporary(false);

            UserResource userResource = usersResource.get(userId);
            userResource.resetPassword(credential);

            // 5. Add user to the "Employees" group (which has ROLE_EMPLOYEE mapped)
            String employeesGroupName = "Employees";
            var groups = realmResource.groups().groups(employeesGroupName, 0, 1);
            if (groups.isEmpty()) {
                LOG.error("Group '{}' not found in Keycloak realm", employeesGroupName);
                throw new RuntimeException("Group 'Employees' not found in Keycloak. Please create the group.");
            }
            String groupId = groups.get(0).getId();
            userResource.joinGroup(groupId);
            LOG.debug("User {} added to group '{}'", createDTO.getLogin(), employeesGroupName);

            LOG.info("User {} successfully created in Keycloak with ROLE_EMPLOYEE", createDTO.getLogin());
            return userId;

        } catch (Exception e) {
            LOG.error("Error creating user in Keycloak: {}", e.getMessage(), e);
            throw new RuntimeException("Could not create user in Keycloak", e);
        }
    }
}
