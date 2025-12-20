package org.hotel.service.dto.client.request.booking;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class BookingItemRequest {
    private Long roomTypeId;
    private String occupantName; // Opcional
}
