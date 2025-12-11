package org.hotel.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import org.hotel.domain.enumeration.RequestStatus;

/**
 * A DTO for the {@link org.hotel.domain.ServiceRequest} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ServiceRequestDTO implements Serializable {

    private Long id;

    @NotNull
    private Instant requestDate;

    private String details;

    @NotNull
    private RequestStatus status;

    @NotNull
    private HotelServiceDTO service;

    @NotNull
    private BookingDTO booking;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(Instant requestDate) {
        this.requestDate = requestDate;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public HotelServiceDTO getService() {
        return service;
    }

    public void setService(HotelServiceDTO service) {
        this.service = service;
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
        if (!(o instanceof ServiceRequestDTO)) {
            return false;
        }

        ServiceRequestDTO serviceRequestDTO = (ServiceRequestDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, serviceRequestDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ServiceRequestDTO{" +
            "id=" + getId() +
            ", requestDate='" + getRequestDate() + "'" +
            ", details='" + getDetails() + "'" +
            ", status='" + getStatus() + "'" +
            ", service=" + getService() +
            ", booking=" + getBooking() +
            "}";
    }
}
