package org.hotel.service.dto.client.response.servicerequest;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hotel.domain.enumeration.RequestStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@NoArgsConstructor
@Getter
@Setter
public class ServiceRequestResponse implements Serializable {
    private Long id;
    private Instant requestDate;
    private String details;
    private RequestStatus status;
    private Long serviceId;
    private String serviceName;
    private BigDecimal serviceCost;
    private Long bookingId;
}
