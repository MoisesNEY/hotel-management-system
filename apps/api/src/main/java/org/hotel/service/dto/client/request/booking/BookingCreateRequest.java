package org.hotel.service.dto.client.request.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
public class BookingCreateRequest implements Serializable {
    @NotNull
    private LocalDate checkinDate;
    @NotNull
    private LocalDate checkoutDate;
    @NotNull
    @Min(1)
    private Integer guestCount;
    @NotNull
    private Long roomTypeId;
    private String notes;
}
