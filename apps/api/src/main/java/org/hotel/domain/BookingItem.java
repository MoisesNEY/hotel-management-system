package org.hotel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * A BookingItem.
 */
@Entity
@Table(name = "booking_item")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class BookingItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "price", precision = 21, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "occupant_name")
    private String occupantName;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "rooms" }, allowSetters = true)
    private RoomType roomType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "roomType" }, allowSetters = true)
    private Room assignedRoom;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "bookingItems", "serviceRequests", "customer" }, allowSetters = true)
    private Booking booking;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public BookingItem id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrice() {
        return this.price;
    }

    public BookingItem price(BigDecimal price) {
        this.setPrice(price);
        return this;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getOccupantName() {
        return this.occupantName;
    }

    public BookingItem occupantName(String occupantName) {
        this.setOccupantName(occupantName);
        return this;
    }

    public void setOccupantName(String occupantName) {
        this.occupantName = occupantName;
    }

    public RoomType getRoomType() {
        return this.roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public BookingItem roomType(RoomType roomType) {
        this.setRoomType(roomType);
        return this;
    }

    public Room getAssignedRoom() {
        return this.assignedRoom;
    }

    public void setAssignedRoom(Room room) {
        this.assignedRoom = room;
    }

    public BookingItem assignedRoom(Room room) {
        this.setAssignedRoom(room);
        return this;
    }

    public Booking getBooking() {
        return this.booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public BookingItem booking(Booking booking) {
        this.setBooking(booking);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BookingItem)) {
            return false;
        }
        return getId() != null && getId().equals(((BookingItem) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "BookingItem{" +
            "id=" + getId() +
            ", price=" + getPrice() +
            ", occupantName='" + getOccupantName() + "'" +
            "}";
    }
}
