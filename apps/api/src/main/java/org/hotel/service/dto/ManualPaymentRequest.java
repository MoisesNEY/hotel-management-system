package org.hotel.service.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class ManualPaymentRequest implements Serializable {
    
    private Long invoiceId;
    private BigDecimal amount;

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
