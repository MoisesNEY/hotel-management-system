package org.hotel.repository;

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
}
