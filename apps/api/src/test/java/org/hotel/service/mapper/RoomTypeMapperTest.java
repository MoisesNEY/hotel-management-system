package org.hotel.service.mapper;

import static org.hotel.domain.RoomTypeAsserts.*;
import static org.hotel.domain.RoomTypeTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RoomTypeMapperTest {

    private RoomTypeMapper roomTypeMapper;

    @BeforeEach
    void setUp() {
        roomTypeMapper = new RoomTypeMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRoomTypeSample1();
        var actual = roomTypeMapper.toEntity(roomTypeMapper.toDto(expected));
        assertRoomTypeAllPropertiesEquals(expected, actual);
    }
}
