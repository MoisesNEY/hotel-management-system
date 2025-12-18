package org.hotel.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class WebContentDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(WebContentDTO.class);
        WebContentDTO webContentDTO1 = new WebContentDTO();
        webContentDTO1.setId(1L);
        WebContentDTO webContentDTO2 = new WebContentDTO();
        assertThat(webContentDTO1).isNotEqualTo(webContentDTO2);
        webContentDTO2.setId(webContentDTO1.getId());
        assertThat(webContentDTO1).isEqualTo(webContentDTO2);
        webContentDTO2.setId(2L);
        assertThat(webContentDTO1).isNotEqualTo(webContentDTO2);
        webContentDTO1.setId(null);
        assertThat(webContentDTO1).isNotEqualTo(webContentDTO2);
    }
}
