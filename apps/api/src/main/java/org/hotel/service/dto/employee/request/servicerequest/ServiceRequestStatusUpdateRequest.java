package org.hotel.service.dto.employee.request.servicerequest;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hotel.domain.enumeration.RequestStatus;

import java.io.Serializable;

@NoArgsConstructor
@Getter
@Setter
public class ServiceRequestStatusUpdateRequest implements Serializable {
    @NotNull(message = "El nuevo estado es obligatorio")
    private RequestStatus status;
}
