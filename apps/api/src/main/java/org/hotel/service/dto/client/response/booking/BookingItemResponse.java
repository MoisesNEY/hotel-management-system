package org.hotel.service.dto.client.response.booking;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

@NoArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingItemResponse implements Serializable {

    private Long id;
    private BigDecimal price;
    private String roomTypeName;
    private String roomTypeImage;

    private String assignedRoomNumber;
    private String occupantName;
}
