package org.hotel.service.dto.client.request.servicerequest;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@NoArgsConstructor
@Getter
@Setter
public class ServiceRequestCreateRequest implements Serializable {
    @NotNull
    private String details;
    @NotNull
    private Long serviceId;
    @NotNull
    private Long bookingId;
}
