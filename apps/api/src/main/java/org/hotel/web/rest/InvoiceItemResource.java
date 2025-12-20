package org.hotel.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.hotel.repository.InvoiceItemRepository;
import org.hotel.service.InvoiceItemService;
import org.hotel.service.dto.InvoiceItemDTO;
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
 * REST controller for managing {@link org.hotel.domain.InvoiceItem}.
 */
@RestController
@RequestMapping("/api/invoice-items")
public class InvoiceItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(InvoiceItemResource.class);

    private static final String ENTITY_NAME = "hotelBackendInvoiceItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final InvoiceItemService invoiceItemService;

    private final InvoiceItemRepository invoiceItemRepository;

    public InvoiceItemResource(InvoiceItemService invoiceItemService, InvoiceItemRepository invoiceItemRepository) {
        this.invoiceItemService = invoiceItemService;
        this.invoiceItemRepository = invoiceItemRepository;
    }

    /**
     * {@code POST  /invoice-items} : Create a new invoiceItem.
     *
     * @param invoiceItemDTO the invoiceItemDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new invoiceItemDTO, or with status {@code 400 (Bad Request)} if the invoiceItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<InvoiceItemDTO> createInvoiceItem(@Valid @RequestBody InvoiceItemDTO invoiceItemDTO) throws URISyntaxException {
        LOG.debug("REST request to save InvoiceItem : {}", invoiceItemDTO);
        if (invoiceItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new invoiceItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        invoiceItemDTO = invoiceItemService.save(invoiceItemDTO);
        return ResponseEntity.created(new URI("/api/invoice-items/" + invoiceItemDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, invoiceItemDTO.getId().toString()))
            .body(invoiceItemDTO);
    }

    /**
     * {@code PUT  /invoice-items/:id} : Updates an existing invoiceItem.
     *
     * @param id the id of the invoiceItemDTO to save.
     * @param invoiceItemDTO the invoiceItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated invoiceItemDTO,
     * or with status {@code 400 (Bad Request)} if the invoiceItemDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the invoiceItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceItemDTO> updateInvoiceItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody InvoiceItemDTO invoiceItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update InvoiceItem : {}, {}", id, invoiceItemDTO);
        if (invoiceItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, invoiceItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!invoiceItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        invoiceItemDTO = invoiceItemService.update(invoiceItemDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, invoiceItemDTO.getId().toString()))
            .body(invoiceItemDTO);
    }

    /**
     * {@code PATCH  /invoice-items/:id} : Partial updates given fields of an existing invoiceItem, field will ignore if it is null
     *
     * @param id the id of the invoiceItemDTO to save.
     * @param invoiceItemDTO the invoiceItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated invoiceItemDTO,
     * or with status {@code 400 (Bad Request)} if the invoiceItemDTO is not valid,
     * or with status {@code 404 (Not Found)} if the invoiceItemDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the invoiceItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<InvoiceItemDTO> partialUpdateInvoiceItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody InvoiceItemDTO invoiceItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update InvoiceItem partially : {}, {}", id, invoiceItemDTO);
        if (invoiceItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, invoiceItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!invoiceItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<InvoiceItemDTO> result = invoiceItemService.partialUpdate(invoiceItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, invoiceItemDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /invoice-items} : get all the invoiceItems.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of invoiceItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<InvoiceItemDTO>> getAllInvoiceItems(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of InvoiceItems");
        Page<InvoiceItemDTO> page;
        if (eagerload) {
            page = invoiceItemService.findAllWithEagerRelationships(pageable);
        } else {
            page = invoiceItemService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /invoice-items/:id} : get the "id" invoiceItem.
     *
     * @param id the id of the invoiceItemDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the invoiceItemDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceItemDTO> getInvoiceItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get InvoiceItem : {}", id);
        Optional<InvoiceItemDTO> invoiceItemDTO = invoiceItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(invoiceItemDTO);
    }

    /**
     * {@code DELETE  /invoice-items/:id} : delete the "id" invoiceItem.
     *
     * @param id the id of the invoiceItemDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoiceItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete InvoiceItem : {}", id);
        invoiceItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
