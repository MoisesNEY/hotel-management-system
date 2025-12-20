package org.hotel.service.dto.client.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@NoArgsConstructor
@Getter
@Setter
public class BookingItemRequest implements Serializable {

    @NotNull(message = "El tipo de habitación es obligatorio")
    private Long roomTypeId;

    @NotNull(message = "El nombre del ocupante es obligatorio")
    private String occupantName;
}
