package org.hotel.service.mapper;

import static org.hotel.domain.BookingItemAsserts.*;
import static org.hotel.domain.BookingItemTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BookingItemMapperTest {

    private BookingItemMapper bookingItemMapper;

    @BeforeEach
    void setUp() {
        bookingItemMapper = new BookingItemMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getBookingItemSample1();
        var actual = bookingItemMapper.toEntity(bookingItemMapper.toDto(expected));
        assertBookingItemAllPropertiesEquals(expected, actual);
    }
}
