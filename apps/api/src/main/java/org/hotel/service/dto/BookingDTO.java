package org.hotel.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import org.hotel.domain.enumeration.BookingStatus;

/**
 * A DTO for the {@link org.hotel.domain.Booking} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class BookingDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate checkInDate;

    @NotNull
    private LocalDate checkOutDate;

    @NotNull
    @Min(value = 1)
    private Integer guestCount;

    @NotNull
    private BookingStatus status;

    @DecimalMin(value = "0")
    private BigDecimal totalPrice;

    private String notes;

    @NotNull
    private RoomTypeDTO roomType;

    private RoomDTO assignedRoom;

    @NotNull
    private AdminUserDTO customer;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public Integer getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public AdminUserDTO getCustomer() {
        return customer;
    }

    public void setCustomer(AdminUserDTO customer) {
        this.customer = customer;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BookingDTO)) {
            return false;
        }

        BookingDTO bookingDTO = (BookingDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, bookingDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "BookingDTO{" +
            "id=" + getId() +
            ", checkInDate='" + getCheckInDate() + "'" +
            ", checkOutDate='" + getCheckOutDate() + "'" +
            ", guestCount=" + getGuestCount() +
            ", status='" + getStatus() + "'" +
            ", totalPrice=" + getTotalPrice() +
            ", notes='" + getNotes() + "'" +
            ", roomType=" + getRoomType() +
            ", assignedRoom=" + getAssignedRoom() +
            ", customer=" + getCustomer() +
            "}";
    }
}
