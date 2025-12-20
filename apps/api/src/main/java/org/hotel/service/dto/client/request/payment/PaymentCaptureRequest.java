package org.hotel.service.dto.client.request.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
public class PaymentCaptureRequest implements Serializable {
    @NotNull
    private String paypalOrderId;
    @NotNull
    private String invoiceCode;
}
