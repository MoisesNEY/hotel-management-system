package org.hotel.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class WebContentTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static WebContent getWebContentSample1() {
        return new WebContent().id(1L).title("title1").subtitle("subtitle1").imageUrl("imageUrl1").actionUrl("actionUrl1").sortOrder(1);
    }

    public static WebContent getWebContentSample2() {
        return new WebContent().id(2L).title("title2").subtitle("subtitle2").imageUrl("imageUrl2").actionUrl("actionUrl2").sortOrder(2);
    }

    public static WebContent getWebContentRandomSampleGenerator() {
        return new WebContent()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .subtitle(UUID.randomUUID().toString())
            .imageUrl(UUID.randomUUID().toString())
            .actionUrl(UUID.randomUUID().toString())
            .sortOrder(intCount.incrementAndGet());
    }
}
