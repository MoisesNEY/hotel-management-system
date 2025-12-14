package org.hotel.service.dto.employee.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@NoArgsConstructor
@Setter
@Getter
public class AssignRoomRequest implements Serializable {
    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long roomId;
}
