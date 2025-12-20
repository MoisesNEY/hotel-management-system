package org.hotel.service.mapper;

import static org.hotel.domain.InvoiceItemAsserts.*;
import static org.hotel.domain.InvoiceItemTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InvoiceItemMapperTest {

    private InvoiceItemMapper invoiceItemMapper;

    @BeforeEach
    void setUp() {
        invoiceItemMapper = new InvoiceItemMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getInvoiceItemSample1();
        var actual = invoiceItemMapper.toEntity(invoiceItemMapper.toDto(expected));
        assertInvoiceItemAllPropertiesEquals(expected, actual);
    }
}
