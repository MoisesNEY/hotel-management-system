package org.hotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.hotel.domain.Booking;
import org.hotel.domain.enumeration.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Booking entity.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("select booking from Booking booking where booking.customer.login = ?#{authentication.name}")
    List<Booking> findByCustomerIsCurrentUser();

    default Optional<Booking> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Booking> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Booking> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }
    /**
     * 1. Para "Mis Reservas" (Paginado).
     * Spring genera: SELECT * FROM booking b JOIN jhi_user u ON b.customer_id = u.id WHERE u.login = ?
     */
    Page<Booking> findByCustomer_Login(String login, Pageable pageable);

    /**
     * 2. Para Validar Propiedad (Seguridad IDOR).
     * Usado al crear ServiceRequest.
     * Spring genera: SELECT * FROM booking WHERE id = ? AND customer.login = ?
     */
    Optional<Booking> findByIdAndCustomer_Login(Long id, String login);
    @Query(
        value = "select booking from Booking booking left join fetch booking.roomType left join fetch booking.assignedRoom left join fetch booking.customer",
        countQuery = "select count(booking) from Booking booking"
    )
    Page<Booking> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select booking from Booking booking left join fetch booking.roomType left join fetch booking.assignedRoom left join fetch booking.customer"
    )
    List<Booking> findAllWithToOneRelationships();

    @Query(
        "select booking from Booking booking left join fetch booking.roomType left join fetch booking.assignedRoom left join fetch booking.customer where booking.id =:id"
    )
    Optional<Booking> findOneWithToOneRelationships(@Param("id") Long id);
    /**
     * Cuenta cuántas reservas CONFIRMADAS o PENDIENTES existen para un tipo de habitación
     * que se solapan con las fechas solicitadas.
     * * Lógica de Solapamiento de Fechas:
     * (ReservaExistente.checkIn < NuevoCheckOut) AND (ReservaExistente.CheckOut > NuevoCheckIn)
     */
    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.roomType.id = :roomTypeId
        AND b.status <> 'CANCELLED'
        AND b.checkInDate < :checkOutDate
        AND b.checkOutDate > :checkInDate
    """)
    long countOverlappingBookings(
        @Param("roomTypeId") Long roomTypeId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );
    @Query("SELECT COUNT(b) FROM Booking b " +
        "WHERE b.roomType.id = :typeId " +
        "AND b.id != :excludeId " +
        "AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN') " +
        "AND (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)")
    long countOverlappingBookingsExcludingSelf(@Param("typeId") Long typeId,
                                               @Param("checkIn") LocalDate checkIn,
                                               @Param("checkOut") LocalDate checkOut,
                                               @Param("excludeId") Long excludeId);
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.assignedRoom.id = :roomId AND b.status IN ('CONFIRMED', 'CHECKED_IN')")
    boolean existsActiveBookingForRoom(@Param("roomId") Long roomId);
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.id = :id AND b.status IN ('CONFIRMED', 'CHECKED_IN')")
    boolean existsActiveBookingById(@Param("id") Long id);
    // Para saber si el Usuario asociado a este perfil tiene reservas
    boolean existsByCustomerId(String userId);
}