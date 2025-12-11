package org.hotel.service.mapper;

import static org.hotel.domain.HotelServiceAsserts.*;
import static org.hotel.domain.HotelServiceTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HotelServiceMapperTest {

    private HotelServiceMapper hotelServiceMapper;

    @BeforeEach
    void setUp() {
        hotelServiceMapper = new HotelServiceMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getHotelServiceSample1();
        var actual = hotelServiceMapper.toEntity(hotelServiceMapper.toDto(expected));
        assertHotelServiceAllPropertiesEquals(expected, actual);
    }
}
