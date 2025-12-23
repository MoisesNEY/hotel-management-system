package org.hotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.hotel.domain.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Booking entity.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    default Optional<Booking> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Booking> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Booking> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select booking from Booking booking left join fetch booking.customer",
        countQuery = "select count(booking) from Booking booking"
    )
    Page<Booking> findAllWithToOneRelationships(Pageable pageable);

    @Query("select booking from Booking booking left join fetch booking.customer")
    List<Booking> findAllWithToOneRelationships();

    @Query("select booking from Booking booking left join fetch booking.customer where booking.id =:id")
    Optional<Booking> findOneWithToOneRelationships(@Param("id") Long id);

    @Query("select count(b) from Booking b join b.bookingItems bi where bi.roomType.id = :roomTypeId and b.status <> 'CANCELLED' and ((b.checkInDate < :checkOut and b.checkOutDate > :checkIn))")
    long countOverlappingBookings(@Param("roomTypeId") Long roomTypeId, @Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut);

    @Query("select count(b) from Booking b join b.bookingItems bi where bi.roomType.id = :roomTypeId and b.status <> 'CANCELLED' and ((b.checkInDate < :checkOut and b.checkOutDate > :checkIn)) and b.id <> :excludeId")
    long countOverlappingBookingsExcludingSelf(@Param("roomTypeId") Long roomTypeId, @Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut, @Param("excludeId") Long excludeId);

    Page<Booking> findByCustomer_User_Login(String login, Pageable pageable);

    Optional<Booking> findByIdAndCustomer_User_Login(Long id, String login);
}
