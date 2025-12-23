package org.hotel.repository;

import java.util.List;
import java.util.Optional;
import org.hotel.domain.InvoiceItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the InvoiceItem entity.
 */
@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    default Optional<InvoiceItem> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<InvoiceItem> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<InvoiceItem> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select invoiceItem from InvoiceItem invoiceItem left join fetch invoiceItem.invoice",
        countQuery = "select count(invoiceItem) from InvoiceItem invoiceItem"
    )
    Page<InvoiceItem> findAllWithToOneRelationships(Pageable pageable);

    @Query("select invoiceItem from InvoiceItem invoiceItem left join fetch invoiceItem.invoice")
    List<InvoiceItem> findAllWithToOneRelationships();

    @Query("select invoiceItem from InvoiceItem invoiceItem left join fetch invoiceItem.invoice where invoiceItem.id =:id")
    Optional<InvoiceItem> findOneWithToOneRelationships(@Param("id") Long id);
}
