package org.hotel.service.dto.client.response.booking;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hotel.domain.enumeration.BookingStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse implements Serializable {
    private Long id;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestCount;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String roomTypeName;
    private String roomTypeImage;
    private String assignedRoomNumber;
}
