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

    @NotNull(message = "Debes indicar a qué línea de la reserva pertenece esta asignación")
    private Long bookingItemId; // NUEVO: Para diferenciar si asignas la Suite o la Twin

    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long roomId;        // La habitación física (ej: 205)
}