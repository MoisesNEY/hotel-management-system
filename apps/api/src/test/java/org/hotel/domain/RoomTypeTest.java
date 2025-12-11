package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.RoomTestSamples.*;
import static org.hotel.domain.RoomTypeTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RoomTypeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(RoomType.class);
        RoomType roomType1 = getRoomTypeSample1();
        RoomType roomType2 = new RoomType();
        assertThat(roomType1).isNotEqualTo(roomType2);

        roomType2.setId(roomType1.getId());
        assertThat(roomType1).isEqualTo(roomType2);

        roomType2 = getRoomTypeSample2();
        assertThat(roomType1).isNotEqualTo(roomType2);
    }

    @Test
    void roomsTest() {
        RoomType roomType = getRoomTypeRandomSampleGenerator();
        Room roomBack = getRoomRandomSampleGenerator();

        roomType.addRooms(roomBack);
        assertThat(roomType.getRooms()).containsOnly(roomBack);
        assertThat(roomBack.getRoomType()).isEqualTo(roomType);

        roomType.removeRooms(roomBack);
        assertThat(roomType.getRooms()).doesNotContain(roomBack);
        assertThat(roomBack.getRoomType()).isNull();

        roomType.rooms(new HashSet<>(Set.of(roomBack)));
        assertThat(roomType.getRooms()).containsOnly(roomBack);
        assertThat(roomBack.getRoomType()).isEqualTo(roomType);

        roomType.setRooms(new HashSet<>());
        assertThat(roomType.getRooms()).doesNotContain(roomBack);
        assertThat(roomBack.getRoomType()).isNull();
    }
}
