package org.hotel.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.hotel.repository.WebContentRepository;
import org.hotel.service.WebContentQueryService;
import org.hotel.service.WebContentService;
import org.hotel.service.criteria.WebContentCriteria;
import org.hotel.service.dto.WebContentDTO;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.hotel.domain.WebContent}.
 */
@RestController
@RequestMapping("/api/web-contents")
public class WebContentResource {

    private static final Logger LOG = LoggerFactory.getLogger(WebContentResource.class);

    private static final String ENTITY_NAME = "hotelBackendWebContent";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final WebContentService webContentService;

    private final WebContentRepository webContentRepository;

    private final WebContentQueryService webContentQueryService;

    public WebContentResource(
        WebContentService webContentService,
        WebContentRepository webContentRepository,
        WebContentQueryService webContentQueryService
    ) {
        this.webContentService = webContentService;
        this.webContentRepository = webContentRepository;
        this.webContentQueryService = webContentQueryService;
    }

    /**
     * {@code POST  /web-contents} : Create a new webContent.
     *
     * @param webContentDTO the webContentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new webContentDTO, or with status {@code 400 (Bad Request)} if the webContent has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<WebContentDTO> createWebContent(@Valid @RequestBody WebContentDTO webContentDTO) throws URISyntaxException {
        LOG.debug("REST request to save WebContent : {}", webContentDTO);
        if (webContentDTO.getId() != null) {
            throw new BadRequestAlertException("A new webContent cannot already have an ID", ENTITY_NAME, "idexists");
        }
        webContentDTO = webContentService.save(webContentDTO);
        return ResponseEntity.created(new URI("/api/web-contents/" + webContentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, webContentDTO.getId().toString()))
            .body(webContentDTO);
    }

    /**
     * {@code PUT  /web-contents/:id} : Updates an existing webContent.
     *
     * @param id the id of the webContentDTO to save.
     * @param webContentDTO the webContentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated webContentDTO,
     * or with status {@code 400 (Bad Request)} if the webContentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the webContentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<WebContentDTO> updateWebContent(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody WebContentDTO webContentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update WebContent : {}, {}", id, webContentDTO);
        if (webContentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, webContentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!webContentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        webContentDTO = webContentService.update(webContentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, webContentDTO.getId().toString()))
            .body(webContentDTO);
    }

    /**
     * {@code PATCH  /web-contents/:id} : Partial updates given fields of an existing webContent, field will ignore if it is null
     *
     * @param id the id of the webContentDTO to save.
     * @param webContentDTO the webContentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated webContentDTO,
     * or with status {@code 400 (Bad Request)} if the webContentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the webContentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the webContentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<WebContentDTO> partialUpdateWebContent(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody WebContentDTO webContentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update WebContent partially : {}, {}", id, webContentDTO);
        if (webContentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, webContentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!webContentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<WebContentDTO> result = webContentService.partialUpdate(webContentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, webContentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /web-contents} : get all the webContents.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of webContents in body.
     */
    @GetMapping("")
    public ResponseEntity<List<WebContentDTO>> getAllWebContents(
        WebContentCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get WebContents by criteria: {}", criteria);

        Page<WebContentDTO> page = webContentQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /web-contents/count} : count all the webContents.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countWebContents(WebContentCriteria criteria) {
        LOG.debug("REST request to count WebContents by criteria: {}", criteria);
        return ResponseEntity.ok().body(webContentQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /web-contents/:id} : get the "id" webContent.
     *
     * @param id the id of the webContentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the webContentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<WebContentDTO> getWebContent(@PathVariable("id") Long id) {
        LOG.debug("REST request to get WebContent : {}", id);
        Optional<WebContentDTO> webContentDTO = webContentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(webContentDTO);
    }

    /**
     * {@code DELETE  /web-contents/:id} : delete the "id" webContent.
     *
     * @param id the id of the webContentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWebContent(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete WebContent : {}", id);
        webContentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
