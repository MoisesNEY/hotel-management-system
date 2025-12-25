package org.hotel.service;

import jakarta.persistence.criteria.JoinType;
import org.hotel.domain.*; // for static metamodels
import org.hotel.domain.Invoice;
import org.hotel.repository.InvoiceRepository;
import org.hotel.service.criteria.InvoiceCriteria;
import org.hotel.service.dto.InvoiceDTO;
import org.hotel.service.mapper.InvoiceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Invoice} entities in the database.
 * The main input is a {@link InvoiceCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link InvoiceDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class InvoiceQueryService extends QueryService<Invoice> {

    private static final Logger LOG = LoggerFactory.getLogger(InvoiceQueryService.class);

    private final InvoiceRepository invoiceRepository;

    private final InvoiceMapper invoiceMapper;

    public InvoiceQueryService(InvoiceRepository invoiceRepository, InvoiceMapper invoiceMapper) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceMapper = invoiceMapper;
    }

    /**
     * Return a {@link Page} of {@link InvoiceDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<InvoiceDTO> findByCriteria(InvoiceCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Invoice> specification = createSpecification(criteria);
        
        // Use eager loading for booking and customer
        Specification<Invoice> eagerSpec = (root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch(Invoice_.booking, JoinType.LEFT).fetch(Booking_.customer, JoinType.LEFT);
            }
            return specification.toPredicate(root, query, cb);
        };
        
        return invoiceRepository.findAll(eagerSpec, page).map(invoiceMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(InvoiceCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Invoice> specification = createSpecification(criteria);
        return invoiceRepository.count(specification);
    }

    /**
     * Function to convert {@link InvoiceCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Invoice> createSpecification(InvoiceCriteria criteria) {
        Specification<Invoice> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), Invoice_.id),
                buildStringSpecification(criteria.getCode(), Invoice_.code),
                buildRangeSpecification(criteria.getIssuedDate(), Invoice_.issuedDate),
                buildSpecification(criteria.getStatus(), Invoice_.status),
                buildRangeSpecification(criteria.getTaxAmount(), Invoice_.taxAmount),
                buildRangeSpecification(criteria.getTotalAmount(), Invoice_.totalAmount),
                buildStringSpecification(criteria.getCurrency(), Invoice_.currency),
                buildSpecification(criteria.getItemsId(), root -> root.join(Invoice_.items, JoinType.LEFT).get(InvoiceItem_.id)),
                buildSpecification(criteria.getPaymentsId(), root -> root.join(Invoice_.payments, JoinType.LEFT).get(Payment_.id)),
                buildSpecification(criteria.getBookingId(), root -> root.join(Invoice_.booking, JoinType.LEFT).get(Booking_.id))
            );
        }
        return specification;
    }
}
