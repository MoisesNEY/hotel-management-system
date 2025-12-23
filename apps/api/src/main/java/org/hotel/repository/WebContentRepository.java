package org.hotel.repository;

import java.util.List;
import java.util.Optional;
import org.hotel.domain.WebContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the WebContent entity.
 */
@Repository
public interface WebContentRepository extends JpaRepository<WebContent, Long>, JpaSpecificationExecutor<WebContent> {
    default Optional<WebContent> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<WebContent> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<WebContent> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(value = "select webContent from WebContent webContent left join fetch webContent.collection", countQuery = "select count(webContent) from WebContent webContent")
    Page<WebContent> findAllWithToOneRelationships(Pageable pageable);

    @Query("select webContent from WebContent webContent left join fetch webContent.collection")
    List<WebContent> findAllWithToOneRelationships();

    @Query("select webContent from WebContent webContent left join fetch webContent.collection where webContent.id =:id")
    Optional<WebContent> findOneWithToOneRelationships(@Param("id") Long id);

    // 1. Para Carruseles y Listas: Trae todo lo activo de una sección, siempre que
    // la sección esté activa (o null).
    @Query("select w from WebContent w join w.collection c where c.code = :code " +
            "and (w.isActive = true) " +
            "and (c.isActive = true) " +
            "order by w.sortOrder asc")
    List<WebContent> findAllByCollectionCodeAndIsActiveTrueAndCollectionIsActiveTrueOrderBySortOrderAsc(
            @Param("code") String code);

    // 2. Para Hero/Mapas: Trae solo el PRIMER elemento activo de una sección activa
    // (o null).
    @Query("select w from WebContent w join w.collection c where c.code = :code " +
            "and (w.isActive = true or w.isActive is null) " +
            "and (c.isActive = true or c.isActive is null) " +
            "order by w.sortOrder asc")
    List<WebContent> findByCollectionCodeAndIsActiveRobust(@Param("code") String code);

    default Optional<WebContent> findFirstByCollectionCodeAndIsActiveTrueAndCollectionIsActiveTrueOrderBySortOrderAsc(
            String code) {
        return findByCollectionCodeAndIsActiveRobust(code).stream().findFirst();
    }
}
