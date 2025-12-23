package org.hotel.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import org.hotel.domain.enumeration.BookingStatus;

/**
 * A DTO for the {@link org.hotel.domain.Booking} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class BookingDTO implements Serializable {

    private Long id;

    private String code;

    @NotNull
    private LocalDate checkInDate;

    @NotNull
    private LocalDate checkOutDate;

    @NotNull
    @Min(value = 1)
    private Integer guestCount;

    @NotNull
    private BookingStatus status;

    private String notes;

    private String specialRequests;

    @NotNull
    private CustomerDTO customer;

    private java.util.List<BookingItemDTO> items;
    
    private java.math.BigDecimal totalPrice;

    public java.math.BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(java.math.BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public java.util.List<BookingItemDTO> getItems() {
        return items;
    }

    public void setItems(java.util.List<BookingItemDTO> items) {
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
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
            ", code='" + getCode() + "'" +
            ", checkInDate='" + getCheckInDate() + "'" +
            ", checkOutDate='" + getCheckOutDate() + "'" +
            ", guestCount=" + getGuestCount() +
            ", status='" + getStatus() + "'" +
            ", notes='" + getNotes() + "'" +
            ", specialRequests='" + getSpecialRequests() + "'" +
            ", customer=" + getCustomer() +
            "}";
    }
}
