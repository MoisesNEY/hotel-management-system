package org.hotel.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class BookingItemDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(BookingItemDTO.class);
        BookingItemDTO bookingItemDTO1 = new BookingItemDTO();
        bookingItemDTO1.setId(1L);
        BookingItemDTO bookingItemDTO2 = new BookingItemDTO();
        assertThat(bookingItemDTO1).isNotEqualTo(bookingItemDTO2);
        bookingItemDTO2.setId(bookingItemDTO1.getId());
        assertThat(bookingItemDTO1).isEqualTo(bookingItemDTO2);
        bookingItemDTO2.setId(2L);
        assertThat(bookingItemDTO1).isNotEqualTo(bookingItemDTO2);
        bookingItemDTO1.setId(null);
        assertThat(bookingItemDTO1).isNotEqualTo(bookingItemDTO2);
    }
}
