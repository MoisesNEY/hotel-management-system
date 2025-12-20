package org.hotel.service;

import jakarta.persistence.criteria.JoinType;
import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem_;
import org.hotel.domain.Booking_;
import org.hotel.domain.ServiceRequest_;
import org.hotel.domain.User_;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.service.criteria.BookingCriteria;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.mapper.BookingMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Booking} entities in the database.
 * The main input is a {@link BookingCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link BookingDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class BookingQueryService extends QueryService<Booking> {

    private static final Logger LOG = LoggerFactory.getLogger(BookingQueryService.class);

    private final BookingRepository bookingRepository;

    private final BookingMapper bookingMapper;

    public BookingQueryService(BookingRepository bookingRepository, BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
    }

    /**
     * Return a {@link Page} of {@link BookingDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<BookingDTO> findByCriteria(BookingCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Booking> specification = createSpecification(criteria);
        return bookingRepository.findAll(specification, page).map(bookingMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(BookingCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Booking> specification = createSpecification(criteria);
        return bookingRepository.count(specification);
    }

    /**
     * Function to convert {@link BookingCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Booking> createSpecification(BookingCriteria criteria) {
        Specification<Booking> specification = Specification.where((root, query, cb) -> {
            // Fetch bookingItems and nested relationships only for data queries, not count queries
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                jakarta.persistence.criteria.Fetch<Booking, org.hotel.domain.BookingItem> itemsFetch = root.fetch(Booking_.bookingItems, JoinType.LEFT);
                itemsFetch.fetch(BookingItem_.roomType, JoinType.LEFT);
                itemsFetch.fetch(BookingItem_.assignedRoom, JoinType.LEFT);
            }
            return null;
        });
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), Booking_.id),
                buildStringSpecification(criteria.getCode(), Booking_.code),
                buildRangeSpecification(criteria.getCheckInDate(), Booking_.checkInDate),
                buildRangeSpecification(criteria.getCheckOutDate(), Booking_.checkOutDate),
                buildRangeSpecification(criteria.getGuestCount(), Booking_.guestCount),
                buildSpecification(criteria.getStatus(), Booking_.status),
                buildStringSpecification(criteria.getNotes(), Booking_.notes),
                buildStringSpecification(criteria.getSpecialRequests(), Booking_.specialRequests),
                buildSpecification(criteria.getBookingItemsId(), root ->
                    root.join(Booking_.bookingItems, JoinType.LEFT).get(BookingItem_.id)
                ),
                buildSpecification(criteria.getServiceRequestsId(), root ->
                    root.join(Booking_.serviceRequests, JoinType.LEFT).get(ServiceRequest_.id)
                ),
                buildSpecification(criteria.getCustomerId(), root -> root.join(Booking_.customer, JoinType.LEFT).get(User_.id))
            );
        }
        return specification;
    }
}
