package org.hotel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import org.hotel.domain.enumeration.BookingStatus;

/**
 * A Booking.
 */
@Entity
@Table(name = "booking")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Booking implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @NotNull
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @NotNull
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @NotNull
    @Min(value = 1)
    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "special_requests")
    private String specialRequests;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "booking")
    @JsonIgnoreProperties(value = { "roomType", "assignedRoom", "booking" }, allowSetters = true)
    private Set<BookingItem> bookingItems = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "booking")
    @JsonIgnoreProperties(value = { "service", "booking" }, allowSetters = true)
    private Set<ServiceRequest> serviceRequests = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    private User customer;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Booking id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public Booking code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public LocalDate getCheckInDate() {
        return this.checkInDate;
    }

    public Booking checkInDate(LocalDate checkInDate) {
        this.setCheckInDate(checkInDate);
        return this;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return this.checkOutDate;
    }

    public Booking checkOutDate(LocalDate checkOutDate) {
        this.setCheckOutDate(checkOutDate);
        return this;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public Integer getGuestCount() {
        return this.guestCount;
    }

    public Booking guestCount(Integer guestCount) {
        this.setGuestCount(guestCount);
        return this;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }

    public BookingStatus getStatus() {
        return this.status;
    }

    public Booking status(BookingStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return this.notes;
    }

    public Booking notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getSpecialRequests() {
        return this.specialRequests;
    }

    public Booking specialRequests(String specialRequests) {
        this.setSpecialRequests(specialRequests);
        return this;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public Set<BookingItem> getBookingItems() {
        return this.bookingItems;
    }

    public void setBookingItems(Set<BookingItem> bookingItems) {
        if (this.bookingItems != null) {
            this.bookingItems.forEach(i -> i.setBooking(null));
        }
        if (bookingItems != null) {
            bookingItems.forEach(i -> i.setBooking(this));
        }
        this.bookingItems = bookingItems;
    }

    public Booking bookingItems(Set<BookingItem> bookingItems) {
        this.setBookingItems(bookingItems);
        return this;
    }

    public Booking addBookingItems(BookingItem bookingItem) {
        this.bookingItems.add(bookingItem);
        bookingItem.setBooking(this);
        return this;
    }

    public Booking removeBookingItems(BookingItem bookingItem) {
        this.bookingItems.remove(bookingItem);
        bookingItem.setBooking(null);
        return this;
    }

    public Set<ServiceRequest> getServiceRequests() {
        return this.serviceRequests;
    }

    public void setServiceRequests(Set<ServiceRequest> serviceRequests) {
        if (this.serviceRequests != null) {
            this.serviceRequests.forEach(i -> i.setBooking(null));
        }
        if (serviceRequests != null) {
            serviceRequests.forEach(i -> i.setBooking(this));
        }
        this.serviceRequests = serviceRequests;
    }

    public Booking serviceRequests(Set<ServiceRequest> serviceRequests) {
        this.setServiceRequests(serviceRequests);
        return this;
    }

    public Booking addServiceRequests(ServiceRequest serviceRequest) {
        this.serviceRequests.add(serviceRequest);
        serviceRequest.setBooking(this);
        return this;
    }

    public Booking removeServiceRequests(ServiceRequest serviceRequest) {
        this.serviceRequests.remove(serviceRequest);
        serviceRequest.setBooking(null);
        return this;
    }

    public User getCustomer() {
        return this.customer;
    }

    public void setCustomer(User user) {
        this.customer = user;
    }

    public Booking customer(User user) {
        this.setCustomer(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Booking)) {
            return false;
        }
        return getId() != null && getId().equals(((Booking) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Booking{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", checkInDate='" + getCheckInDate() + "'" +
            ", checkOutDate='" + getCheckOutDate() + "'" +
            ", guestCount=" + getGuestCount() +
            ", status='" + getStatus() + "'" +
            ", notes='" + getNotes() + "'" +
            ", specialRequests='" + getSpecialRequests() + "'" +
            "}";
    }
}
