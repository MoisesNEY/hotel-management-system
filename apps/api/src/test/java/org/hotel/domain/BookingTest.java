package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.BookingTestSamples.*;
import static org.hotel.domain.RoomTestSamples.*;
import static org.hotel.domain.RoomTypeTestSamples.*;
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
    void roomTypeTest() {
        Booking booking = getBookingRandomSampleGenerator();
        RoomType roomTypeBack = getRoomTypeRandomSampleGenerator();

        booking.setRoomType(roomTypeBack);
        assertThat(booking.getRoomType()).isEqualTo(roomTypeBack);

        booking.roomType(null);
        assertThat(booking.getRoomType()).isNull();
    }

    @Test
    void assignedRoomTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Room roomBack = getRoomRandomSampleGenerator();

        booking.setAssignedRoom(roomBack);
        assertThat(booking.getAssignedRoom()).isEqualTo(roomBack);

        booking.assignedRoom(null);
        assertThat(booking.getAssignedRoom()).isNull();
    }
}
