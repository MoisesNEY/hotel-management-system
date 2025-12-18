package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.AssetCollectionTestSamples.*;
import static org.hotel.domain.WebContentTestSamples.*;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class WebContentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(WebContent.class);
        WebContent webContent1 = getWebContentSample1();
        WebContent webContent2 = new WebContent();
        assertThat(webContent1).isNotEqualTo(webContent2);

        webContent2.setId(webContent1.getId());
        assertThat(webContent1).isEqualTo(webContent2);

        webContent2 = getWebContentSample2();
        assertThat(webContent1).isNotEqualTo(webContent2);
    }

    @Test
    void collectionTest() {
        WebContent webContent = getWebContentRandomSampleGenerator();
        AssetCollection assetCollectionBack = getAssetCollectionRandomSampleGenerator();

        webContent.setCollection(assetCollectionBack);
        assertThat(webContent.getCollection()).isEqualTo(assetCollectionBack);

        webContent.collection(null);
        assertThat(webContent.getCollection()).isNull();
    }
}
