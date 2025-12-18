package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class AssetCollectionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static AssetCollection getAssetCollectionSample1() {
        return new AssetCollection().id(1L).code("code1").name("name1").description("description1");
    }

    public static AssetCollection getAssetCollectionSample2() {
        return new AssetCollection().id(2L).code("code2").name("name2").description("description2");
    }

    public static AssetCollection getAssetCollectionRandomSampleGenerator() {
        return new AssetCollection()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString());
    }
}
