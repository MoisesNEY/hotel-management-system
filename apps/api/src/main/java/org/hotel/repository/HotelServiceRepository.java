package org.hotel.repository;

import org.hotel.domain.HotelService;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the HotelService entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HotelServiceRepository extends JpaRepository<HotelService, Long> {}
