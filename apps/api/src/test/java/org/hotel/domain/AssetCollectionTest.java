package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.AssetCollectionTestSamples.*;
import static org.hotel.domain.WebContentTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class AssetCollectionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AssetCollection.class);
        AssetCollection assetCollection1 = getAssetCollectionSample1();
        AssetCollection assetCollection2 = new AssetCollection();
        assertThat(assetCollection1).isNotEqualTo(assetCollection2);

        assetCollection2.setId(assetCollection1.getId());
        assertThat(assetCollection1).isEqualTo(assetCollection2);

        assetCollection2 = getAssetCollectionSample2();
        assertThat(assetCollection1).isNotEqualTo(assetCollection2);
    }

    @Test
    void itemsTest() {
        AssetCollection assetCollection = getAssetCollectionRandomSampleGenerator();
        WebContent webContentBack = getWebContentRandomSampleGenerator();

        assetCollection.addItems(webContentBack);
        assertThat(assetCollection.getItems()).containsOnly(webContentBack);
        assertThat(webContentBack.getCollection()).isEqualTo(assetCollection);

        assetCollection.removeItems(webContentBack);
        assertThat(assetCollection.getItems()).doesNotContain(webContentBack);
        assertThat(webContentBack.getCollection()).isNull();

        assetCollection.items(new HashSet<>(Set.of(webContentBack)));
        assertThat(assetCollection.getItems()).containsOnly(webContentBack);
        assertThat(webContentBack.getCollection()).isEqualTo(assetCollection);

        assetCollection.setItems(new HashSet<>());
        assertThat(assetCollection.getItems()).doesNotContain(webContentBack);
        assertThat(webContentBack.getCollection()).isNull();
    }
}
