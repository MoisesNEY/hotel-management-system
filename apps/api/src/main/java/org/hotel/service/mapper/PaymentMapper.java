package org.hotel.service.mapper;

import org.hotel.domain.Invoice;
import org.hotel.domain.Payment;
import org.hotel.service.dto.InvoiceDTO;
import org.hotel.service.dto.PaymentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Payment} and its DTO {@link PaymentDTO}.
 */
@Mapper(componentModel = "spring")
public interface PaymentMapper extends EntityMapper<PaymentDTO, Payment> {
    @Mapping(target = "invoice", source = "invoice", qualifiedByName = "invoiceCode")
    PaymentDTO toDto(Payment s);

    @Named("invoiceCode")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    InvoiceDTO toDtoInvoiceCode(Invoice invoice);
}
