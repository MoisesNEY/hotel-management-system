package org.hotel.service.mapper;

import static org.hotel.domain.BookingAsserts.*;
import static org.hotel.domain.BookingTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingMapperTest {

    @InjectMocks
    private BookingMapperImpl bookingMapper;

    @Spy
    private UserMapper userMapper = new UserMapper();

    @BeforeEach
    void setUp() {
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getBookingSample1();
        var actual = bookingMapper.toEntity(bookingMapper.toDto(expected));
        assertBookingAllPropertiesEquals(expected, actual);
    }
}
