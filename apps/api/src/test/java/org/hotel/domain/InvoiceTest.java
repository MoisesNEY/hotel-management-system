package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.BookingTestSamples.*;
import static org.hotel.domain.InvoiceItemTestSamples.*;
import static org.hotel.domain.InvoiceTestSamples.*;
import static org.hotel.domain.PaymentTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class InvoiceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Invoice.class);
        Invoice invoice1 = getInvoiceSample1();
        Invoice invoice2 = new Invoice();
        assertThat(invoice1).isNotEqualTo(invoice2);

        invoice2.setId(invoice1.getId());
        assertThat(invoice1).isEqualTo(invoice2);

        invoice2 = getInvoiceSample2();
        assertThat(invoice1).isNotEqualTo(invoice2);
    }

    @Test
    void itemsTest() {
        Invoice invoice = getInvoiceRandomSampleGenerator();
        InvoiceItem invoiceItemBack = getInvoiceItemRandomSampleGenerator();

        invoice.addItems(invoiceItemBack);
        assertThat(invoice.getItems()).containsOnly(invoiceItemBack);
        assertThat(invoiceItemBack.getInvoice()).isEqualTo(invoice);

        invoice.removeItems(invoiceItemBack);
        assertThat(invoice.getItems()).doesNotContain(invoiceItemBack);
        assertThat(invoiceItemBack.getInvoice()).isNull();

        invoice.items(new HashSet<>(Set.of(invoiceItemBack)));
        assertThat(invoice.getItems()).containsOnly(invoiceItemBack);
        assertThat(invoiceItemBack.getInvoice()).isEqualTo(invoice);

        invoice.setItems(new HashSet<>());
        assertThat(invoice.getItems()).doesNotContain(invoiceItemBack);
        assertThat(invoiceItemBack.getInvoice()).isNull();
    }

    @Test
    void paymentsTest() {
        Invoice invoice = getInvoiceRandomSampleGenerator();
        Payment paymentBack = getPaymentRandomSampleGenerator();

        invoice.addPayments(paymentBack);
        assertThat(invoice.getPayments()).containsOnly(paymentBack);
        assertThat(paymentBack.getInvoice()).isEqualTo(invoice);

        invoice.removePayments(paymentBack);
        assertThat(invoice.getPayments()).doesNotContain(paymentBack);
        assertThat(paymentBack.getInvoice()).isNull();

        invoice.payments(new HashSet<>(Set.of(paymentBack)));
        assertThat(invoice.getPayments()).containsOnly(paymentBack);
        assertThat(paymentBack.getInvoice()).isEqualTo(invoice);

        invoice.setPayments(new HashSet<>());
        assertThat(invoice.getPayments()).doesNotContain(paymentBack);
        assertThat(paymentBack.getInvoice()).isNull();
    }

    @Test
    void bookingTest() {
        Invoice invoice = getInvoiceRandomSampleGenerator();
        Booking bookingBack = getBookingRandomSampleGenerator();

        invoice.setBooking(bookingBack);
        assertThat(invoice.getBooking()).isEqualTo(bookingBack);

        invoice.booking(null);
        assertThat(invoice.getBooking()).isNull();
    }
}
