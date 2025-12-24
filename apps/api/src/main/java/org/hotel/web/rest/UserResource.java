package org.hotel.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import java.util.Set;
import org.hotel.domain.Authority;
import org.hotel.domain.User;
import org.hotel.repository.AuthorityRepository;
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
    private final AuthorityRepository authorityRepository;

    public UserResource(UserService userService, UserRepository userRepository, KeycloakService keycloakService,
            AuthorityRepository authorityRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
        this.authorityRepository = authorityRepository;
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

        // Sync user to local database
        User newUser = new User();
        newUser.setId(keycloakUserId);
        newUser.setLogin(createDTO.getLogin().toLowerCase());
        newUser.setEmail(createDTO.getEmail().toLowerCase());
        newUser.setFirstName(createDTO.getFirstName());
        newUser.setLastName(createDTO.getLastName());
        newUser.setActivated(true);
        newUser.setLangKey("es"); // Default language

        // Assign ROLE_EMPLOYEE authority
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.EMPLOYEE).ifPresent(authorities::add);
        newUser.setAuthorities(authorities);

        userRepository.save(newUser);
        LOG.info("User {} saved to local database", createDTO.getLogin());

        // Build response DTO
        AdminUserDTO result = new AdminUserDTO(newUser);

        return ResponseEntity
                .created(new URI("/api/admin/users/" + result.getLogin()))
                .headers(HeaderUtil.createAlert(applicationName, "userManagement.created", result.getLogin()))
                .body(result);
    }

    /**
     * {@code GET /admin/users} : get all users with all the details FROM KEYCLOAK.
     * Permitido para ADMIN y EMPLOYEE para poder mapear nombres y correos.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority(\"" + AuthoritiesConstants.ADMIN + "\", \"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get all Users from Keycloak for an admin/employee");

        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();

        // Fetch users from Keycloak
        List<AdminUserDTO> users = keycloakService.getAllUsers(page * size, size);
        int totalCount = keycloakService.countUsers();

        // Build headers with pagination info
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(totalCount));

        return new ResponseEntity<>(users, headers, HttpStatus.OK);
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
     * {@code PUT /admin/users} : Updates an existing User in Keycloak.
     * SOLO ADMINISTRADORES pueden editar usuarios.
     */
    @PutMapping
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<AdminUserDTO> updateUser(@Valid @RequestBody AdminUserDTO userDTO) {
        LOG.debug("REST request to update User in Keycloak: {}", userDTO);

        // Update user in Keycloak
        keycloakService.updateUserAdmin(userDTO);

        // Also update in local DB if exists
        userRepository.findById(userDTO.getId()).ifPresent(user -> {
            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            userRepository.save(user);
        });

        return ResponseEntity.ok()
                .headers(HeaderUtil.createAlert(applicationName, "userManagement.updated", userDTO.getLogin()))
                .body(userDTO);
    }

    /**
     * {@code DELETE /admin/users/:login} : delete the "login" User from Keycloak.
     * SOLO ADMINISTRADORES pueden eliminar usuarios.
     */
    @DeleteMapping("/{login}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteUser(@PathVariable("login") String login) {
        LOG.debug("REST request to delete User from Keycloak: {}", login);

        // Delete from Keycloak
        boolean deleted = keycloakService.deleteUserByUsername(login);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        // Also delete from local DB if exists
        userRepository.findOneByLogin(login).ifPresent(userRepository::delete);

        return ResponseEntity.noContent()
                .headers(HeaderUtil.createAlert(applicationName, "userManagement.deleted", login))
                .build();
    }
}
