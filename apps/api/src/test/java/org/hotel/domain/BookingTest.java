package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.BookingItemTestSamples.*;
import static org.hotel.domain.BookingTestSamples.*;
import static org.hotel.domain.CustomerTestSamples.*;
import static org.hotel.domain.ServiceRequestTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class BookingTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Booking.class);
        Booking booking1 = getBookingSample1();
        Booking booking2 = new Booking();
        assertThat(booking1).isNotEqualTo(booking2);

        booking2.setId(booking1.getId());
        assertThat(booking1).isEqualTo(booking2);

        booking2 = getBookingSample2();
        assertThat(booking1).isNotEqualTo(booking2);
    }

    @Test
    void bookingItemsTest() {
        Booking booking = getBookingRandomSampleGenerator();
        BookingItem bookingItemBack = getBookingItemRandomSampleGenerator();

        booking.addBookingItems(bookingItemBack);
        assertThat(booking.getBookingItems()).containsOnly(bookingItemBack);
        assertThat(bookingItemBack.getBooking()).isEqualTo(booking);

        booking.removeBookingItems(bookingItemBack);
        assertThat(booking.getBookingItems()).doesNotContain(bookingItemBack);
        assertThat(bookingItemBack.getBooking()).isNull();

        booking.bookingItems(new HashSet<>(Set.of(bookingItemBack)));
        assertThat(booking.getBookingItems()).containsOnly(bookingItemBack);
        assertThat(bookingItemBack.getBooking()).isEqualTo(booking);

        booking.setBookingItems(new HashSet<>());
        assertThat(booking.getBookingItems()).doesNotContain(bookingItemBack);
        assertThat(bookingItemBack.getBooking()).isNull();
    }

    @Test
    void serviceRequestsTest() {
        Booking booking = getBookingRandomSampleGenerator();
        ServiceRequest serviceRequestBack = getServiceRequestRandomSampleGenerator();

        booking.addServiceRequests(serviceRequestBack);
        assertThat(booking.getServiceRequests()).containsOnly(serviceRequestBack);
        assertThat(serviceRequestBack.getBooking()).isEqualTo(booking);

        booking.removeServiceRequests(serviceRequestBack);
        assertThat(booking.getServiceRequests()).doesNotContain(serviceRequestBack);
        assertThat(serviceRequestBack.getBooking()).isNull();

        booking.serviceRequests(new HashSet<>(Set.of(serviceRequestBack)));
        assertThat(booking.getServiceRequests()).containsOnly(serviceRequestBack);
        assertThat(serviceRequestBack.getBooking()).isEqualTo(booking);

        booking.setServiceRequests(new HashSet<>());
        assertThat(booking.getServiceRequests()).doesNotContain(serviceRequestBack);
        assertThat(serviceRequestBack.getBooking()).isNull();
    }

    @Test
    void customerTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        booking.setCustomer(customerBack);
        assertThat(booking.getCustomer()).isEqualTo(customerBack);

        booking.customer(null);
        assertThat(booking.getCustomer()).isNull();
    }
}
