package org.hotel.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class InvoiceItemDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(InvoiceItemDTO.class);
        InvoiceItemDTO invoiceItemDTO1 = new InvoiceItemDTO();
        invoiceItemDTO1.setId(1L);
        InvoiceItemDTO invoiceItemDTO2 = new InvoiceItemDTO();
        assertThat(invoiceItemDTO1).isNotEqualTo(invoiceItemDTO2);
        invoiceItemDTO2.setId(invoiceItemDTO1.getId());
        assertThat(invoiceItemDTO1).isEqualTo(invoiceItemDTO2);
        invoiceItemDTO2.setId(2L);
        assertThat(invoiceItemDTO1).isNotEqualTo(invoiceItemDTO2);
        invoiceItemDTO1.setId(null);
        assertThat(invoiceItemDTO1).isNotEqualTo(invoiceItemDTO2);
    }
}
