package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class BookingTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Booking getBookingSample1() {
        return new Booking().id(1L).guestCount(1).notes("notes1");
    }

    public static Booking getBookingSample2() {
        return new Booking().id(2L).guestCount(2).notes("notes2");
    }

    public static Booking getBookingRandomSampleGenerator() {
        return new Booking().id(longCount.incrementAndGet()).guestCount(intCount.incrementAndGet()).notes(UUID.randomUUID().toString());
    }
}
