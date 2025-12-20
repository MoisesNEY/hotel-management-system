package org.hotel.repository;

import java.net.http.HttpHeaders;
import java.util.List;
import java.util.Optional;
import org.hotel.domain.ServiceRequest;
import org.hotel.domain.enumeration.RequestStatus;
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

    @Query(
        value = "select serviceRequest from ServiceRequest serviceRequest left join fetch serviceRequest.service left join fetch serviceRequest.booking",
        countQuery = "select count(serviceRequest) from ServiceRequest serviceRequest"
    )
    Page<ServiceRequest> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select serviceRequest from ServiceRequest serviceRequest left join fetch serviceRequest.service left join fetch serviceRequest.booking"
    )
    List<ServiceRequest> findAllWithToOneRelationships();

    @Query(
        "select serviceRequest from ServiceRequest serviceRequest left join fetch serviceRequest.service left join fetch serviceRequest.booking where serviceRequest.id =:id"
    )
    Optional<ServiceRequest> findOneWithToOneRelationships(@Param("id") Long id);

    boolean existsByBookingId(Long bookingId);

    boolean existsByStatusAndServiceId(RequestStatus requestStatus, Long id);

    Page<ServiceRequest> findByBooking_Customer_Login(String userLogin, Pageable pageable);
}
