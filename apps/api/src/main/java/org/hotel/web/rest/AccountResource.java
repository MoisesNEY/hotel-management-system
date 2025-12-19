package org.hotel.web.rest;

import org.hotel.service.KeycloakService;
import org.hotel.service.UserService;
import org.hotel.service.dto.AdminUserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static final Logger LOG = LoggerFactory.getLogger(AccountResource.class);

    private final UserService userService;
    private final KeycloakService keycloakService;

    public AccountResource(UserService userService, KeycloakService keycloakService) {
        this.userService = userService;
        this.keycloakService = keycloakService;
    }

    /**
     * {@code GET  /account} : get the current user.
     * This endpoint automatically synchronizes the user from Keycloak to the local
     * database.
     *
     * @return the current user.
     * @throws RuntimeException if the user couldn't be found.
     */
    @GetMapping("/account")
    public ResponseEntity<AdminUserDTO> getAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof AbstractAuthenticationToken authToken) {
            AdminUserDTO user = userService.getUserFromAuthentication(authToken);
            LOG.debug("REST request to get current user account: {}", user.getLogin());
            return ResponseEntity.ok(user);
        }

        throw new RuntimeException("User could not be found");
    }

    /**
     * {@code PUT  /account} : update the current user's account.
     * This endpoint updates both Keycloak and the local database.
     *
     * @param userDTO the user to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated user.
     */
    @PutMapping("/account")
    public ResponseEntity<AdminUserDTO> updateAccount(@RequestBody AdminUserDTO userDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof AbstractAuthenticationToken authToken) {
            AdminUserDTO currentUser = userService.getUserFromAuthentication(authToken);

            // Seguridad: Solo permitimos que el usuario se actualice a sí mismo
            userDTO.setId(currentUser.getId());
            userDTO.setLogin(currentUser.getLogin());

            LOG.debug("REST request to update current user account: {}", userDTO.getLogin());

            // 1. Actualizar Keycloak (Fuente de verdad)
            keycloakService.updateUser(userDTO);

            // 2. Actualizar DB Local
            userService.updateUser(
                    userDTO.getFirstName(),
                    userDTO.getLastName(),
                    userDTO.getEmail(),
                    userDTO.getLangKey(),
                    userDTO.getImageUrl());

            return ResponseEntity.ok(userDTO);
        }

        throw new RuntimeException("User could not be found");
    }
}
