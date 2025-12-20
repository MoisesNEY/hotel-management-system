package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.BookingItemTestSamples.*;
import static org.hotel.domain.BookingTestSamples.*;
import static org.hotel.domain.RoomTestSamples.*;
import static org.hotel.domain.RoomTypeTestSamples.*;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class BookingItemTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(BookingItem.class);
        BookingItem bookingItem1 = getBookingItemSample1();
        BookingItem bookingItem2 = new BookingItem();
        assertThat(bookingItem1).isNotEqualTo(bookingItem2);

        bookingItem2.setId(bookingItem1.getId());
        assertThat(bookingItem1).isEqualTo(bookingItem2);

        bookingItem2 = getBookingItemSample2();
        assertThat(bookingItem1).isNotEqualTo(bookingItem2);
    }

    @Test
    void roomTypeTest() {
        BookingItem bookingItem = getBookingItemRandomSampleGenerator();
        RoomType roomTypeBack = getRoomTypeRandomSampleGenerator();

        bookingItem.setRoomType(roomTypeBack);
        assertThat(bookingItem.getRoomType()).isEqualTo(roomTypeBack);

        bookingItem.roomType(null);
        assertThat(bookingItem.getRoomType()).isNull();
    }

    @Test
    void assignedRoomTest() {
        BookingItem bookingItem = getBookingItemRandomSampleGenerator();
        Room roomBack = getRoomRandomSampleGenerator();

        bookingItem.setAssignedRoom(roomBack);
        assertThat(bookingItem.getAssignedRoom()).isEqualTo(roomBack);

        bookingItem.assignedRoom(null);
        assertThat(bookingItem.getAssignedRoom()).isNull();
    }

    @Test
    void bookingTest() {
        BookingItem bookingItem = getBookingItemRandomSampleGenerator();
        Booking bookingBack = getBookingRandomSampleGenerator();

        bookingItem.setBooking(bookingBack);
        assertThat(bookingItem.getBooking()).isEqualTo(bookingBack);

        bookingItem.booking(null);
        assertThat(bookingItem.getBooking()).isNull();
    }
}
