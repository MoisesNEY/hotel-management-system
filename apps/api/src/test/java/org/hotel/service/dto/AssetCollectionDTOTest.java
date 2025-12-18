package org.hotel.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class AssetCollectionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AssetCollectionDTO.class);
        AssetCollectionDTO assetCollectionDTO1 = new AssetCollectionDTO();
        assetCollectionDTO1.setId(1L);
        AssetCollectionDTO assetCollectionDTO2 = new AssetCollectionDTO();
        assertThat(assetCollectionDTO1).isNotEqualTo(assetCollectionDTO2);
        assetCollectionDTO2.setId(assetCollectionDTO1.getId());
        assertThat(assetCollectionDTO1).isEqualTo(assetCollectionDTO2);
        assetCollectionDTO2.setId(2L);
        assertThat(assetCollectionDTO1).isNotEqualTo(assetCollectionDTO2);
        assetCollectionDTO1.setId(null);
        assertThat(assetCollectionDTO1).isNotEqualTo(assetCollectionDTO2);
    }
}
