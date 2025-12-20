package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class HotelServiceTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static HotelService getHotelServiceSample1() {
        return new HotelService()
            .id(1L)
            .name("name1")
            .description("description1")
            .imageUrl("imageUrl1")
            .startHour("startHour1")
            .endHour("endHour1");
    }

    public static HotelService getHotelServiceSample2() {
        return new HotelService()
            .id(2L)
            .name("name2")
            .description("description2")
            .imageUrl("imageUrl2")
            .startHour("startHour2")
            .endHour("endHour2");
    }

    public static HotelService getHotelServiceRandomSampleGenerator() {
        return new HotelService()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString())
            .imageUrl(UUID.randomUUID().toString())
            .startHour(UUID.randomUUID().toString())
            .endHour(UUID.randomUUID().toString());
    }
}
