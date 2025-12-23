package org.hotel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.hotel.domain.enumeration.RequestStatus;

/**
 * A ServiceRequest.
 */
@Entity
@Table(name = "service_request")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ServiceRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "request_date", nullable = false)
    private Instant requestDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status;

    @Column(name = "details")
    private String details;

    @Column(name = "delivery_room_number")
    private String deliveryRoomNumber;

    @Min(value = 1)
    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "total_cost", precision = 21, scale = 2)
    private BigDecimal totalCost;

    @ManyToOne(optional = false)
    @NotNull
    private HotelService service;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "bookingItems", "serviceRequests", "customer" }, allowSetters = true)
    private Booking booking;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ServiceRequest id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getRequestDate() {
        return this.requestDate;
    }

    public ServiceRequest requestDate(Instant requestDate) {
        this.setRequestDate(requestDate);
        return this;
    }

    public void setRequestDate(Instant requestDate) {
        this.requestDate = requestDate;
    }

    public RequestStatus getStatus() {
        return this.status;
    }

    public ServiceRequest status(RequestStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getDetails() {
        return this.details;
    }

    public ServiceRequest details(String details) {
        this.setDetails(details);
        return this;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getDeliveryRoomNumber() {
        return this.deliveryRoomNumber;
    }

    public ServiceRequest deliveryRoomNumber(String deliveryRoomNumber) {
        this.setDeliveryRoomNumber(deliveryRoomNumber);
        return this;
    }

    public void setDeliveryRoomNumber(String deliveryRoomNumber) {
        this.deliveryRoomNumber = deliveryRoomNumber;
    }

    public Integer getQuantity() {
        return this.quantity;
    }

    public ServiceRequest quantity(Integer quantity) {
        this.setQuantity(quantity);
        return this;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotalCost() {
        return this.totalCost;
    }

    public ServiceRequest totalCost(BigDecimal totalCost) {
        this.setTotalCost(totalCost);
        return this;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public HotelService getService() {
        return this.service;
    }

    public void setService(HotelService hotelService) {
        this.service = hotelService;
    }

    public ServiceRequest service(HotelService hotelService) {
        this.setService(hotelService);
        return this;
    }

    public Booking getBooking() {
        return this.booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public ServiceRequest booking(Booking booking) {
        this.setBooking(booking);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ServiceRequest)) {
            return false;
        }
        return getId() != null && getId().equals(((ServiceRequest) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ServiceRequest{" +
            "id=" + getId() +
            ", requestDate='" + getRequestDate() + "'" +
            ", status='" + getStatus() + "'" +
            ", details='" + getDetails() + "'" +
            ", deliveryRoomNumber='" + getDeliveryRoomNumber() + "'" +
            ", quantity=" + getQuantity() +
            ", totalCost=" + getTotalCost() +
            "}";
    }
}
