package org.hotel.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class HotelServiceDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HotelServiceDTO.class);
        HotelServiceDTO hotelServiceDTO1 = new HotelServiceDTO();
        hotelServiceDTO1.setId(1L);
        HotelServiceDTO hotelServiceDTO2 = new HotelServiceDTO();
        assertThat(hotelServiceDTO1).isNotEqualTo(hotelServiceDTO2);
        hotelServiceDTO2.setId(hotelServiceDTO1.getId());
        assertThat(hotelServiceDTO1).isEqualTo(hotelServiceDTO2);
        hotelServiceDTO2.setId(2L);
        assertThat(hotelServiceDTO1).isNotEqualTo(hotelServiceDTO2);
        hotelServiceDTO1.setId(null);
        assertThat(hotelServiceDTO1).isNotEqualTo(hotelServiceDTO2);
    }
}
