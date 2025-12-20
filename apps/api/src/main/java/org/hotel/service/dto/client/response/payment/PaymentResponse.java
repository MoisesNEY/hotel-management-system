package org.hotel.service.dto.client.response.payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PaymentResponse implements Serializable {
    private Long id;
    private java.time.Instant paymentDate;
    private BigDecimal amount;
    private String referenceNumber;
    private String invoiceNumber;
}
