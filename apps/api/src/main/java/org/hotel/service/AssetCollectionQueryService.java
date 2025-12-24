package org.hotel.service;

import jakarta.persistence.criteria.JoinType;
import org.hotel.domain.*; // for static metamodels
import org.hotel.domain.AssetCollection;
import org.hotel.repository.AssetCollectionRepository;
import org.hotel.service.criteria.AssetCollectionCriteria;
import org.hotel.service.dto.AssetCollectionDTO;
import org.hotel.service.mapper.AssetCollectionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link AssetCollection} entities in the database.
 * The main input is a {@link AssetCollectionCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link AssetCollectionDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class AssetCollectionQueryService extends QueryService<AssetCollection> {

    private static final Logger LOG = LoggerFactory.getLogger(AssetCollectionQueryService.class);

    private final AssetCollectionRepository assetCollectionRepository;

    private final AssetCollectionMapper assetCollectionMapper;

    public AssetCollectionQueryService(AssetCollectionRepository assetCollectionRepository, AssetCollectionMapper assetCollectionMapper) {
        this.assetCollectionRepository = assetCollectionRepository;
        this.assetCollectionMapper = assetCollectionMapper;
    }

    /**
     * Return a {@link Page} of {@link AssetCollectionDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<AssetCollectionDTO> findByCriteria(AssetCollectionCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<AssetCollection> specification = createSpecification(criteria);
        return assetCollectionRepository.findAll(specification, page).map(assetCollectionMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(AssetCollectionCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<AssetCollection> specification = createSpecification(criteria);
        return assetCollectionRepository.count(specification);
    }

    /**
     * Function to convert {@link AssetCollectionCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<AssetCollection> createSpecification(AssetCollectionCriteria criteria) {
        Specification<AssetCollection> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), AssetCollection_.id),
                buildStringSpecification(criteria.getCode(), AssetCollection_.code),
                buildStringSpecification(criteria.getName(), AssetCollection_.name),
                buildSpecification(criteria.getType(), AssetCollection_.type),
                buildStringSpecification(criteria.getDescription(), AssetCollection_.description),
                buildSpecification(criteria.getIsActive(), AssetCollection_.isActive),
                buildSpecification(criteria.getItemsId(), root -> root.join(AssetCollection_.items, JoinType.LEFT).get(WebContent_.id))
            );
        }
        return specification;
    }
}
