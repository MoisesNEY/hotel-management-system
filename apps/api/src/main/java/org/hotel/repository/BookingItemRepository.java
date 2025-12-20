package org.hotel.repository;

import java.util.List;
import java.util.Optional;
import org.hotel.domain.BookingItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the BookingItem entity.
 */
@Repository
public interface BookingItemRepository extends JpaRepository<BookingItem, Long> {
    default Optional<BookingItem> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<BookingItem> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<BookingItem> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select bookingItem from BookingItem bookingItem left join fetch bookingItem.roomType left join fetch bookingItem.assignedRoom left join fetch bookingItem.booking",
        countQuery = "select count(bookingItem) from BookingItem bookingItem"
    )
    Page<BookingItem> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select bookingItem from BookingItem bookingItem left join fetch bookingItem.roomType left join fetch bookingItem.assignedRoom left join fetch bookingItem.booking"
    )
    List<BookingItem> findAllWithToOneRelationships();

    @Query(
        "select bookingItem from BookingItem bookingItem left join fetch bookingItem.roomType left join fetch bookingItem.assignedRoom left join fetch bookingItem.booking where bookingItem.id =:id"
    )
    Optional<BookingItem> findOneWithToOneRelationships(@Param("id") Long id);
}
