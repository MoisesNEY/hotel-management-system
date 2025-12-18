package org.hotel.service;

import jakarta.persistence.criteria.JoinType;
import org.hotel.domain.*; // for static metamodels
import org.hotel.domain.WebContent;
import org.hotel.repository.WebContentRepository;
import org.hotel.service.criteria.WebContentCriteria;
import org.hotel.service.dto.WebContentDTO;
import org.hotel.service.mapper.WebContentMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link WebContent} entities in the database.
 * The main input is a {@link WebContentCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link WebContentDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class WebContentQueryService extends QueryService<WebContent> {

    private static final Logger LOG = LoggerFactory.getLogger(WebContentQueryService.class);

    private final WebContentRepository webContentRepository;

    private final WebContentMapper webContentMapper;

    public WebContentQueryService(WebContentRepository webContentRepository, WebContentMapper webContentMapper) {
        this.webContentRepository = webContentRepository;
        this.webContentMapper = webContentMapper;
    }

    /**
     * Return a {@link Page} of {@link WebContentDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<WebContentDTO> findByCriteria(WebContentCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<WebContent> specification = createSpecification(criteria);
        return webContentRepository.findAll(specification, page).map(webContentMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(WebContentCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<WebContent> specification = createSpecification(criteria);
        return webContentRepository.count(specification);
    }

    /**
     * Function to convert {@link WebContentCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<WebContent> createSpecification(WebContentCriteria criteria) {
        Specification<WebContent> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), WebContent_.id),
                buildStringSpecification(criteria.getTitle(), WebContent_.title),
                buildStringSpecification(criteria.getSubtitle(), WebContent_.subtitle),
                buildStringSpecification(criteria.getImageUrl(), WebContent_.imageUrl),
                buildStringSpecification(criteria.getActionUrl(), WebContent_.actionUrl),
                buildRangeSpecification(criteria.getSortOrder(), WebContent_.sortOrder),
                buildSpecification(criteria.getIsActive(), WebContent_.isActive),
                buildSpecification(criteria.getCollectionId(), root ->
                    root.join(WebContent_.collection, JoinType.LEFT).get(AssetCollection_.id)
                )
            );
        }
        return specification;
    }
}
