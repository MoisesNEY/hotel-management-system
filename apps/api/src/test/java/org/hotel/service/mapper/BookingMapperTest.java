package org.hotel.service.mapper;

import static org.hotel.domain.BookingAsserts.*;
import static org.hotel.domain.BookingTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BookingMapperTest {

    private BookingMapper bookingMapper;

    @BeforeEach
    void setUp() {
        bookingMapper = new BookingMapperImpl();
        // Manually inject dependencies since we are not using Spring Context here
        org.springframework.test.util.ReflectionTestUtils.setField(bookingMapper, "bookingItemMapper", new BookingItemMapperImpl());
        org.springframework.test.util.ReflectionTestUtils.setField(bookingMapper, "customerMapper", new CustomerMapperImpl());
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getBookingSample1();
        var actual = bookingMapper.toEntity(bookingMapper.toDto(expected));
        assertBookingAllPropertiesEquals(expected, actual);
    }
}
