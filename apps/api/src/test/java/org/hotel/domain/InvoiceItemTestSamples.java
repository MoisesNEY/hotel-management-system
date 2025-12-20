package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class InvoiceItemTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static InvoiceItem getInvoiceItemSample1() {
        return new InvoiceItem().id(1L).description("description1");
    }

    public static InvoiceItem getInvoiceItemSample2() {
        return new InvoiceItem().id(2L).description("description2");
    }

    public static InvoiceItem getInvoiceItemRandomSampleGenerator() {
        return new InvoiceItem().id(longCount.incrementAndGet()).description(UUID.randomUUID().toString());
    }
}
