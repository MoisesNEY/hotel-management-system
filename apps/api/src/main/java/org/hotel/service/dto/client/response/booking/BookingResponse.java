package org.hotel.service.dto.client.response.booking;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hotel.domain.enumeration.BookingStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse implements Serializable {
    private Long id;
    private String code;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestCount;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String specialRequests;
    private List<BookingItemResponse> items;
    private Long invoiceId;
    private String invoiceStatus;

    @NoArgsConstructor
    @Getter
    @Setter
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BookingItemResponse implements Serializable {
        private Long id;
        private BigDecimal price;
        private String roomTypeName;
        private String roomTypeImage;

        private String assignedRoomNumber;
        private String occupantName;
    }
}
