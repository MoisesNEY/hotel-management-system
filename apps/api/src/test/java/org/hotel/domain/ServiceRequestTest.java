package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.BookingTestSamples.*;
import static org.hotel.domain.HotelServiceTestSamples.*;
import static org.hotel.domain.ServiceRequestTestSamples.*;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ServiceRequestTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ServiceRequest.class);
        ServiceRequest serviceRequest1 = getServiceRequestSample1();
        ServiceRequest serviceRequest2 = new ServiceRequest();
        assertThat(serviceRequest1).isNotEqualTo(serviceRequest2);

        serviceRequest2.setId(serviceRequest1.getId());
        assertThat(serviceRequest1).isEqualTo(serviceRequest2);

        serviceRequest2 = getServiceRequestSample2();
        assertThat(serviceRequest1).isNotEqualTo(serviceRequest2);
    }

    @Test
    void serviceTest() {
        ServiceRequest serviceRequest = getServiceRequestRandomSampleGenerator();
        HotelService hotelServiceBack = getHotelServiceRandomSampleGenerator();

        serviceRequest.setService(hotelServiceBack);
        assertThat(serviceRequest.getService()).isEqualTo(hotelServiceBack);

        serviceRequest.service(null);
        assertThat(serviceRequest.getService()).isNull();
    }

    @Test
    void bookingTest() {
        ServiceRequest serviceRequest = getServiceRequestRandomSampleGenerator();
        Booking bookingBack = getBookingRandomSampleGenerator();

        serviceRequest.setBooking(bookingBack);
        assertThat(serviceRequest.getBooking()).isEqualTo(bookingBack);

        serviceRequest.booking(null);
        assertThat(serviceRequest.getBooking()).isNull();
    }
}
