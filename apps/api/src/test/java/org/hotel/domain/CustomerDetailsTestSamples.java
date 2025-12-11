package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CustomerDetailsTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static CustomerDetails getCustomerDetailsSample1() {
        return new CustomerDetails()
            .id(1L)
            .phone("phone1")
            .addressLine1("addressLine11")
            .city("city1")
            .country("country1")
            .licenseId("licenseId1");
    }

    public static CustomerDetails getCustomerDetailsSample2() {
        return new CustomerDetails()
            .id(2L)
            .phone("phone2")
            .addressLine1("addressLine12")
            .city("city2")
            .country("country2")
            .licenseId("licenseId2");
    }

    public static CustomerDetails getCustomerDetailsRandomSampleGenerator() {
        return new CustomerDetails()
            .id(longCount.incrementAndGet())
            .phone(UUID.randomUUID().toString())
            .addressLine1(UUID.randomUUID().toString())
            .city(UUID.randomUUID().toString())
            .country(UUID.randomUUID().toString())
            .licenseId(UUID.randomUUID().toString());
    }
}
