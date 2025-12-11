package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.RoomTestSamples.*;
import static org.hotel.domain.RoomTypeTestSamples.*;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RoomTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Room.class);
        Room room1 = getRoomSample1();
        Room room2 = new Room();
        assertThat(room1).isNotEqualTo(room2);

        room2.setId(room1.getId());
        assertThat(room1).isEqualTo(room2);

        room2 = getRoomSample2();
        assertThat(room1).isNotEqualTo(room2);
    }

    @Test
    void roomTypeTest() {
        Room room = getRoomRandomSampleGenerator();
        RoomType roomTypeBack = getRoomTypeRandomSampleGenerator();

        room.setRoomType(roomTypeBack);
        assertThat(room.getRoomType()).isEqualTo(roomTypeBack);

        room.roomType(null);
        assertThat(room.getRoomType()).isNull();
    }
}
