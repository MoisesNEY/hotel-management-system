package org.hotel.repository;

import org.hotel.domain.AssetCollection;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for the AssetCollection entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AssetCollectionRepository
        extends JpaRepository<AssetCollection, Long>, JpaSpecificationExecutor<AssetCollection> {
    Optional<AssetCollection> findByCode(String code);
}
