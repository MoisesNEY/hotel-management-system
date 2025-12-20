package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class BookingItemTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static BookingItem getBookingItemSample1() {
        return new BookingItem().id(1L).occupantName("occupantName1");
    }

    public static BookingItem getBookingItemSample2() {
        return new BookingItem().id(2L).occupantName("occupantName2");
    }

    public static BookingItem getBookingItemRandomSampleGenerator() {
        return new BookingItem().id(longCount.incrementAndGet()).occupantName(UUID.randomUUID().toString());
    }
}
