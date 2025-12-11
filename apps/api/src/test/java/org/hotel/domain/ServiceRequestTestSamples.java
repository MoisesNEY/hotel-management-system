package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ServiceRequestTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ServiceRequest getServiceRequestSample1() {
        return new ServiceRequest().id(1L).details("details1");
    }

    public static ServiceRequest getServiceRequestSample2() {
        return new ServiceRequest().id(2L).details("details2");
    }

    public static ServiceRequest getServiceRequestRandomSampleGenerator() {
        return new ServiceRequest().id(longCount.incrementAndGet()).details(UUID.randomUUID().toString());
    }
}
