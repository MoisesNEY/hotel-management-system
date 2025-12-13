package org.hotel.repository;

import java.util.List;
import java.util.Optional;
import org.hotel.domain.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ServiceRequest entity.
 */
@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    default Optional<ServiceRequest> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ServiceRequest> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ServiceRequest> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }
    // Buscar solicitudes filtrando por el login del cliente asociado a la reserva
    Page<ServiceRequest> findByBooking_Customer_Login(String login, Pageable pageable);
    @Query(
        value = "select serviceRequest from ServiceRequest serviceRequest left join fetch serviceRequest.service",
        countQuery = "select count(serviceRequest) from ServiceRequest serviceRequest"
    )
    Page<ServiceRequest> findAllWithToOneRelationships(Pageable pageable);

    @Query("select serviceRequest from ServiceRequest serviceRequest left join fetch serviceRequest.service")
    List<ServiceRequest> findAllWithToOneRelationships();

    @Query("select serviceRequest from ServiceRequest serviceRequest left join fetch serviceRequest.service where serviceRequest.id =:id")
    Optional<ServiceRequest> findOneWithToOneRelationships(@Param("id") Long id);
}
