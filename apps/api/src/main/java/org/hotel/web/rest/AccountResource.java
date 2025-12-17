package org.hotel.web.rest;

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

    public AccountResource(UserService userService) {
        this.userService = userService;
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
}
