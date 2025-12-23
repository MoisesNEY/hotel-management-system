package org.hotel.repository;

import java.net.http.HttpHeaders;
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
    Page<Booking> findByCustomer_Login(String login, Pageable pageable);
    Optional<Booking> findByIdAndCustomer_Login(Long id, String login);

    @Query(
        value = "select booking from Booking booking " +
            "left join fetch booking.customer " +
            "left join fetch booking.bookingItems bi " +
            "left join fetch bi.roomType " +
            "left join fetch bi.assignedRoom",
        countQuery = "select count(booking) from Booking booking"
    )
    Page<Booking> findAllWithToOneRelationships(Pageable pageable);

    @Query("select booking from Booking booking " +
        "left join fetch booking.customer " +
        "left join fetch booking.bookingItems bi " +
        "left join fetch bi.roomType " +
        "left join fetch bi.assignedRoom " +
        "where booking.id =:id")
    Optional<Booking> findOneWithToOneRelationships(@Param("id") Long id);

    @Query("""
        SELECT COUNT(b) FROM Booking b
        JOIN b.bookingItems bi
        WHERE bi.roomType.id = :roomTypeId
        AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT')
        AND b.checkInDate < :checkOutDate
        AND b.checkOutDate > :checkInDate
    """)
    long countOverlappingBookings(
        @Param("roomTypeId") Long roomTypeId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );

    /**
     * Valida Disponibilidad (Update):
     * Lo mismo, pero excluyendo la reserva actual (excludeId) para no auto-bloquearse.
     */
    @Query("""
        SELECT COUNT(b) FROM Booking b
        JOIN b.bookingItems bi
        WHERE bi.roomType.id = :typeId
        AND b.id != :excludeId
        AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT')
        AND (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)
    """)
    long countOverlappingBookingsExcludingSelf(
        @Param("typeId") Long typeId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        @Param("excludeId") Long excludeId
    );

    // Validar integridad referencial al borrar Usuario
    boolean existsByCustomerId(String userId);

    // Validar estado activo por ID
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.id = :id AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT')")
    boolean existsActiveBookingById(@Param("id") Long id);

}
