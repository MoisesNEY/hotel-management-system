package org.hotel.web.rest;

import org.hotel.service.FileStorageService;
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
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static final Logger LOG = LoggerFactory.getLogger(AccountResource.class);

    private final UserService userService;
    private final KeycloakService keycloakService;
    private final FileStorageService fileStorageService;

    public AccountResource(UserService userService, KeycloakService keycloakService,
            FileStorageService fileStorageService) {
        this.userService = userService;
        this.keycloakService = keycloakService;
        this.fileStorageService = fileStorageService;
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

    /**
     * {@code POST  /account/profile-picture} : Update the current user's profile
     * picture.
     *
     * @param file the image file to upload.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the new
     *         URL.
     */
    @PostMapping("/account/profile-picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof AbstractAuthenticationToken authToken) {
            AdminUserDTO user = userService.getUserFromAuthentication(authToken);
            LOG.debug("REST request to upload profile picture for user: {}", user.getLogin());

            // 1. Si ya tenía una foto, borrar del Minio para no acumular basura
            if (user.getImageUrl() != null && !user.getImageUrl().isEmpty()) {
                try {
                    fileStorageService.delete(user.getImageUrl());
                } catch (Exception e) {
                    LOG.warn("Could not delete old profile picture {}: {}", user.getImageUrl(), e.getMessage());
                }
            }

            // 2. Guardar nueva foto en Minio (en carpeta 'profiles')
            String newUrl = fileStorageService.save(file, "profiles");

            // 3. Actualizar solo la URL en la base de datos
            userService.updateUser(
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getLangKey(),
                    newUrl);

            // 4. Sincronizar cambio con Keycloak para persistencia total
            user.setImageUrl(newUrl);
            keycloakService.updateUser(user);

            return ResponseEntity.ok(newUrl);
        }

        throw new RuntimeException("User could not be found");
    }

    /**
     * {@code DELETE  /account/profile-picture} : Remove the current user's profile
     * picture.
     *
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/account/profile-picture")
    public ResponseEntity<Void> deleteProfilePicture() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof AbstractAuthenticationToken authToken) {
            AdminUserDTO user = userService.getUserFromAuthentication(authToken);
            LOG.debug("REST request to delete profile picture for user: {}", user.getLogin());

            if (user.getImageUrl() != null && !user.getImageUrl().isEmpty()) {
                fileStorageService.delete(user.getImageUrl());
            }

            userService.updateUser(
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getLangKey(),
                    null);

            // 2. Sincronizar eliminación con Keycloak
            user.setImageUrl(null);
            keycloakService.updateUser(user);

            return ResponseEntity.noContent().build();
        }

        throw new RuntimeException("User could not be found");
    }
}
