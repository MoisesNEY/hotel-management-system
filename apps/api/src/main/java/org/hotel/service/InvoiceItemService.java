package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.InvoiceItem;
import org.hotel.repository.InvoiceItemRepository;
import org.hotel.service.dto.InvoiceItemDTO;
import org.hotel.service.mapper.InvoiceItemMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.InvoiceItem}.
 */
@Service
@Transactional
public class InvoiceItemService {

    private static final Logger LOG = LoggerFactory.getLogger(InvoiceItemService.class);

    private final InvoiceItemRepository invoiceItemRepository;

    private final InvoiceItemMapper invoiceItemMapper;

    public InvoiceItemService(InvoiceItemRepository invoiceItemRepository, InvoiceItemMapper invoiceItemMapper) {
        this.invoiceItemRepository = invoiceItemRepository;
        this.invoiceItemMapper = invoiceItemMapper;
    }

    /**
     * Save a invoiceItem.
     *
     * @param invoiceItemDTO the entity to save.
     * @return the persisted entity.
     */
    public InvoiceItemDTO save(InvoiceItemDTO invoiceItemDTO) {
        LOG.debug("Request to save InvoiceItem : {}", invoiceItemDTO);
        InvoiceItem invoiceItem = invoiceItemMapper.toEntity(invoiceItemDTO);
        invoiceItem = invoiceItemRepository.save(invoiceItem);
        return invoiceItemMapper.toDto(invoiceItem);
    }

    /**
     * Update a invoiceItem.
     *
     * @param invoiceItemDTO the entity to save.
     * @return the persisted entity.
     */
    public InvoiceItemDTO update(InvoiceItemDTO invoiceItemDTO) {
        LOG.debug("Request to update InvoiceItem : {}", invoiceItemDTO);
        InvoiceItem invoiceItem = invoiceItemMapper.toEntity(invoiceItemDTO);
        invoiceItem = invoiceItemRepository.save(invoiceItem);
        return invoiceItemMapper.toDto(invoiceItem);
    }

    /**
     * Partially update a invoiceItem.
     *
     * @param invoiceItemDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<InvoiceItemDTO> partialUpdate(InvoiceItemDTO invoiceItemDTO) {
        LOG.debug("Request to partially update InvoiceItem : {}", invoiceItemDTO);

        return invoiceItemRepository
            .findById(invoiceItemDTO.getId())
            .map(existingInvoiceItem -> {
                invoiceItemMapper.partialUpdate(existingInvoiceItem, invoiceItemDTO);

                return existingInvoiceItem;
            })
            .map(invoiceItemRepository::save)
            .map(invoiceItemMapper::toDto);
    }

    /**
     * Get all the invoiceItems.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<InvoiceItemDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all InvoiceItems");
        return invoiceItemRepository.findAll(pageable).map(invoiceItemMapper::toDto);
    }

    /**
     * Get all the invoiceItems with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<InvoiceItemDTO> findAllWithEagerRelationships(Pageable pageable) {
        return invoiceItemRepository.findAllWithEagerRelationships(pageable).map(invoiceItemMapper::toDto);
    }

    /**
     * Get one invoiceItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<InvoiceItemDTO> findOne(Long id) {
        LOG.debug("Request to get InvoiceItem : {}", id);
        return invoiceItemRepository.findOneWithEagerRelationships(id).map(invoiceItemMapper::toDto);
    }

    /**
     * Delete the invoiceItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete InvoiceItem : {}", id);
        invoiceItemRepository.deleteById(id);
    }
}
