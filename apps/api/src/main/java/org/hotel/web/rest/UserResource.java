package org.hotel.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import java.util.Set;
import org.hotel.config.Constants;
import org.hotel.domain.User;
import org.hotel.repository.UserRepository;
import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.KeycloakService;
import org.hotel.service.UserService;
import org.hotel.service.dto.AdminUserDTO;
import org.hotel.service.dto.CreateUserDTO;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.EmailAlreadyUsedException;
import org.hotel.web.rest.errors.LoginAlreadyUsedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/admin/users")
public class UserResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserResource.class);

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserService userService;
    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    public UserResource(UserService userService, UserRepository userRepository, KeycloakService keycloakService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
    }

    /**
     * {@code POST /admin/users} : Creates a new User with ROLE_EMPLOYEE.
     * SOLO ADMINISTRADORES pueden crear usuarios.
     */
    @PostMapping
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<AdminUserDTO> createUser(@Valid @RequestBody CreateUserDTO createDTO)
            throws URISyntaxException {
        LOG.debug("REST request to create User : {}", createDTO.getLogin());

        // Validate login uniqueness
        if (userRepository.findOneByLogin(createDTO.getLogin().toLowerCase()).isPresent()) {
            throw new LoginAlreadyUsedException();
        }

        // Validate email uniqueness
        if (userRepository.findOneByEmailIgnoreCase(createDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException();
        }

        // Create user in Keycloak
        String keycloakUserId = keycloakService.createUser(createDTO);

        // Build response DTO
        AdminUserDTO result = new AdminUserDTO();
        result.setId(keycloakUserId);
        result.setLogin(createDTO.getLogin());
        result.setEmail(createDTO.getEmail());
        result.setFirstName(createDTO.getFirstName());
        result.setLastName(createDTO.getLastName());
        result.setActivated(true);
        result.setAuthorities(Set.of(AuthoritiesConstants.EMPLOYEE));

        return ResponseEntity
                .created(new URI("/api/admin/users/" + result.getLogin()))
                .headers(HeaderUtil.createAlert(applicationName, "userManagement.created", result.getLogin()))
                .body(result);
    }

    /**
     * {@code GET /admin/users} : get all users with all the details.
     * Permitido para ADMIN y EMPLOYEE para poder mapear nombres y correos.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority(\"" + AuthoritiesConstants.ADMIN + "\", \"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get all User for an admin/employee");

        final Page<AdminUserDTO> page = userService.getAllManagedUsers(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * {@code GET /admin/users/:login} : get the "login" user.
     * Permitido para ADMIN y EMPLOYEE.
     */
    @GetMapping("/{login}")
    @PreAuthorize("hasAnyAuthority(\"" + AuthoritiesConstants.ADMIN + "\", \"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<AdminUserDTO> getUser(@PathVariable("login") String login) {
        LOG.debug("REST request to get User : {}", login);
        return ResponseUtil.wrapOrNotFound(userService.getUserWithAuthoritiesByLogin(login).map(AdminUserDTO::new));
    }

    /**
     * {@code PUT /admin/users} : Updates an existing User.
     * SOLO ADMINISTRADORES pueden editar usuarios.
     */
    @PutMapping
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<AdminUserDTO> updateUser(@Valid @RequestBody AdminUserDTO userDTO) {
        LOG.debug("REST request to update User : {}", userDTO);

        userRepository.findOneByEmailIgnoreCase(userDTO.getEmail())
                .filter(user -> !user.getId().equals(userDTO.getId()))
                .ifPresent(user -> {
                    throw new EmailAlreadyUsedException();
                });

        userRepository.findOneByLogin(userDTO.getLogin().toLowerCase())
                .filter(user -> !user.getId().equals(userDTO.getId()))
                .ifPresent(user -> {
                    throw new LoginAlreadyUsedException();
                });

        Optional<AdminUserDTO> updatedUser = userService.updateUser(userDTO);

        return ResponseUtil.wrapOrNotFound(
                updatedUser,
                HeaderUtil.createAlert(applicationName, "userManagement.updated", userDTO.getLogin()));
    }

    /**
     * {@code DELETE /admin/users/:login} : delete the "login" User.
     * SOLO ADMINISTRADORES pueden eliminar usuarios.
     */
    @DeleteMapping("/{login}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteUser(@PathVariable("login") String login) {
        LOG.debug("REST request to delete User: {}", login);
        userService.deleteUser(login);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createAlert(applicationName, "userManagement.deleted", login))
                .build();
    }
}