package org.hotel.service.mapper;

import org.hotel.domain.Invoice;
import org.hotel.domain.InvoiceItem;
import org.hotel.service.dto.InvoiceDTO;
import org.hotel.service.dto.InvoiceItemDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link InvoiceItem} and its DTO {@link InvoiceItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface InvoiceItemMapper extends EntityMapper<InvoiceItemDTO, InvoiceItem> {
    @Mapping(target = "invoice", source = "invoice", qualifiedByName = "invoiceCode")
    InvoiceItemDTO toDto(InvoiceItem s);

    @Named("invoiceCode")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    InvoiceDTO toDtoInvoiceCode(Invoice invoice);
}
