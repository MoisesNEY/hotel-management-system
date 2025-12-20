package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ServiceRequestTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static ServiceRequest getServiceRequestSample1() {
        return new ServiceRequest().id(1L).details("details1").deliveryRoomNumber("deliveryRoomNumber1").quantity(1);
    }

    public static ServiceRequest getServiceRequestSample2() {
        return new ServiceRequest().id(2L).details("details2").deliveryRoomNumber("deliveryRoomNumber2").quantity(2);
    }

    public static ServiceRequest getServiceRequestRandomSampleGenerator() {
        return new ServiceRequest()
            .id(longCount.incrementAndGet())
            .details(UUID.randomUUID().toString())
            .deliveryRoomNumber(UUID.randomUUID().toString())
            .quantity(intCount.incrementAndGet());
    }
}
