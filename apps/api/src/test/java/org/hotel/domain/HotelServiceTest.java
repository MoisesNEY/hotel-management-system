package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.HotelServiceTestSamples.*;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class HotelServiceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(HotelService.class);
        HotelService hotelService1 = getHotelServiceSample1();
        HotelService hotelService2 = new HotelService();
        assertThat(hotelService1).isNotEqualTo(hotelService2);

        hotelService2.setId(hotelService1.getId());
        assertThat(hotelService1).isEqualTo(hotelService2);

        hotelService2 = getHotelServiceSample2();
        assertThat(hotelService1).isNotEqualTo(hotelService2);
    }
}
