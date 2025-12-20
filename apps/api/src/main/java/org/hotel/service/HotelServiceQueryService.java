package org.hotel.service;

import org.hotel.domain.*; // for static metamodels
import org.hotel.domain.HotelService;
import org.hotel.repository.HotelServiceRepository;
import org.hotel.service.criteria.HotelServiceCriteria;
import org.hotel.service.dto.HotelServiceDTO;
import org.hotel.service.mapper.HotelServiceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link HotelService} entities in the database.
 * The main input is a {@link HotelServiceCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link HotelServiceDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class HotelServiceQueryService extends QueryService<HotelService> {

    private static final Logger LOG = LoggerFactory.getLogger(HotelServiceQueryService.class);

    private final HotelServiceRepository hotelServiceRepository;

    private final HotelServiceMapper hotelServiceMapper;

    public HotelServiceQueryService(HotelServiceRepository hotelServiceRepository, HotelServiceMapper hotelServiceMapper) {
        this.hotelServiceRepository = hotelServiceRepository;
        this.hotelServiceMapper = hotelServiceMapper;
    }

    /**
     * Return a {@link Page} of {@link HotelServiceDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<HotelServiceDTO> findByCriteria(HotelServiceCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<HotelService> specification = createSpecification(criteria);
        return hotelServiceRepository.findAll(specification, page).map(hotelServiceMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(HotelServiceCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<HotelService> specification = createSpecification(criteria);
        return hotelServiceRepository.count(specification);
    }

    /**
     * Function to convert {@link HotelServiceCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<HotelService> createSpecification(HotelServiceCriteria criteria) {
        Specification<HotelService> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), HotelService_.id),
                buildStringSpecification(criteria.getName(), HotelService_.name),
                buildStringSpecification(criteria.getDescription(), HotelService_.description),
                buildRangeSpecification(criteria.getCost(), HotelService_.cost),
                buildStringSpecification(criteria.getImageUrl(), HotelService_.imageUrl),
                buildSpecification(criteria.getIsDeleted(), HotelService_.isDeleted),
                buildStringSpecification(criteria.getStartHour(), HotelService_.startHour),
                buildStringSpecification(criteria.getEndHour(), HotelService_.endHour),
                buildSpecification(criteria.getStatus(), HotelService_.status)
            );
        }
        return specification;
    }
}
