package org.hotel.web.rest;

import java.util.List;
import java.util.Optional;

import org.hotel.repository.UserRepository;
import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.UserService;
import org.hotel.service.dto.AdminUserDTO;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
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

    public UserResource(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    /**
     * {@code GET /admin/users} : get all users with all the details.
     * ACCESO: ADMIN y EMPLOYEE (para visualizar nombres en listas de reserva/clientes).
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
     * ACCESO: ADMIN y EMPLOYEE.
     */
    @GetMapping("/{login}")
    @PreAuthorize("hasAnyAuthority(\"" + AuthoritiesConstants.ADMIN + "\", \"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<AdminUserDTO> getUser(@PathVariable("login") String login) {
        LOG.debug("REST request to get User : {}", login);
        return ResponseUtil.wrapOrNotFound(userService.getUserWithAuthoritiesByLogin(login).map(AdminUserDTO::new));
    }

    /**
     * {@code PUT /admin/users} : Updates an existing User.
     * ACCESO RESTRINGIDO: Solo Admin puede modificar usuarios del sistema.
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
     * ACCESO RESTRINGIDO: Solo Admin puede borrar usuarios.
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