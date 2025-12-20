package org.hotel.service.dto.client.request.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
public class BookingCreateRequest implements Serializable {

    @NotNull(message = "La fecha de entrada es obligatoria")
    @FutureOrPresent(message = "La fecha de entrada debe ser hoy o futura")
    private LocalDate checkInDate;

    @NotNull(message = "La fecha de salida es obligatoria")
    @Future(message = "La fecha de salida debe ser futura")
    private LocalDate checkOutDate;

    @NotNull(message = "El conteo de huéspedes es obligatorio")
    @Min(value = 1, message = "Debe haber al menos 1 huésped")
    private Integer guestCount;

    private String specialRequests;

    @NotEmpty(message = "Debes seleccionar al menos una habitación")
    private List<BookingItemRequest> items;

    /**
     * DTO interno para definir cada habitación que se quiere reservar.
     */
    @NoArgsConstructor
    @Getter
    @Setter
    public static class BookingItemRequest implements Serializable {

        @NotNull(message = "El tipo de habitación es obligatorio")
        private Long roomTypeId;

        private String occupantName; // Opcional: Nombre de quien ocupará esta habitación
    }
}
