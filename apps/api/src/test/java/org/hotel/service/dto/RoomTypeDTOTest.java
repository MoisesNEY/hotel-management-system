package org.hotel.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RoomTypeDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RoomTypeDTO.class);
        RoomTypeDTO roomTypeDTO1 = new RoomTypeDTO();
        roomTypeDTO1.setId(1L);
        RoomTypeDTO roomTypeDTO2 = new RoomTypeDTO();
        assertThat(roomTypeDTO1).isNotEqualTo(roomTypeDTO2);
        roomTypeDTO2.setId(roomTypeDTO1.getId());
        assertThat(roomTypeDTO1).isEqualTo(roomTypeDTO2);
        roomTypeDTO2.setId(2L);
        assertThat(roomTypeDTO1).isNotEqualTo(roomTypeDTO2);
        roomTypeDTO1.setId(null);
        assertThat(roomTypeDTO1).isNotEqualTo(roomTypeDTO2);
    }
}
