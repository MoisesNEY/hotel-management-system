package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class RoomTypeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static RoomType getRoomTypeSample1() {
        return new RoomType().id(1L).name("name1").maxCapacity(1).imageUrl("imageUrl1");
    }

    public static RoomType getRoomTypeSample2() {
        return new RoomType().id(2L).name("name2").maxCapacity(2).imageUrl("imageUrl2");
    }

    public static RoomType getRoomTypeRandomSampleGenerator() {
        return new RoomType()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .maxCapacity(intCount.incrementAndGet())
            .imageUrl(UUID.randomUUID().toString());
    }
}
