package org.hotel.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link org.hotel.domain.BookingItem} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class BookingItemDTO implements Serializable {

    private Long id;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal price;

    private String occupantName;

    @NotNull
    private RoomTypeDTO roomType;

    private RoomDTO assignedRoom;

    @NotNull
    private BookingDTO booking;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getOccupantName() {
        return occupantName;
    }

    public void setOccupantName(String occupantName) {
        this.occupantName = occupantName;
    }

    public RoomTypeDTO getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomTypeDTO roomType) {
        this.roomType = roomType;
    }

    public RoomDTO getAssignedRoom() {
        return assignedRoom;
    }

    public void setAssignedRoom(RoomDTO assignedRoom) {
        this.assignedRoom = assignedRoom;
    }

    public BookingDTO getBooking() {
        return booking;
    }

    public void setBooking(BookingDTO booking) {
        this.booking = booking;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BookingItemDTO)) {
            return false;
        }

        BookingItemDTO bookingItemDTO = (BookingItemDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, bookingItemDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "BookingItemDTO{" +
            "id=" + getId() +
            ", price=" + getPrice() +
            ", occupantName='" + getOccupantName() + "'" +
            ", roomType=" + getRoomType() +
            ", assignedRoom=" + getAssignedRoom() +
            ", booking=" + getBooking() +
            "}";
    }
}
