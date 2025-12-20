package org.hotel.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.hotel.domain.enumeration.InvoiceStatus;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link org.hotel.domain.Invoice} entity. This class is used
 * in {@link org.hotel.web.rest.InvoiceResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /invoices?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class InvoiceCriteria implements Serializable, Criteria {

    /**
     * Class for filtering InvoiceStatus
     */
    public static class InvoiceStatusFilter extends Filter<InvoiceStatus> {

        public InvoiceStatusFilter() {}

        public InvoiceStatusFilter(InvoiceStatusFilter filter) {
            super(filter);
        }

        @Override
        public InvoiceStatusFilter copy() {
            return new InvoiceStatusFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter code;

    private InstantFilter issuedDate;

    private InvoiceStatusFilter status;

    private BigDecimalFilter taxAmount;

    private BigDecimalFilter totalAmount;

    private StringFilter currency;

    private LongFilter itemsId;

    private LongFilter paymentsId;

    private LongFilter bookingId;

    private Boolean distinct;

    public InvoiceCriteria() {}

    public InvoiceCriteria(InvoiceCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.code = other.optionalCode().map(StringFilter::copy).orElse(null);
        this.issuedDate = other.optionalIssuedDate().map(InstantFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(InvoiceStatusFilter::copy).orElse(null);
        this.taxAmount = other.optionalTaxAmount().map(BigDecimalFilter::copy).orElse(null);
        this.totalAmount = other.optionalTotalAmount().map(BigDecimalFilter::copy).orElse(null);
        this.currency = other.optionalCurrency().map(StringFilter::copy).orElse(null);
        this.itemsId = other.optionalItemsId().map(LongFilter::copy).orElse(null);
        this.paymentsId = other.optionalPaymentsId().map(LongFilter::copy).orElse(null);
        this.bookingId = other.optionalBookingId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public InvoiceCriteria copy() {
        return new InvoiceCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public StringFilter getCode() {
        return code;
    }

    public Optional<StringFilter> optionalCode() {
        return Optional.ofNullable(code);
    }

    public StringFilter code() {
        if (code == null) {
            setCode(new StringFilter());
        }
        return code;
    }

    public void setCode(StringFilter code) {
        this.code = code;
    }

    public InstantFilter getIssuedDate() {
        return issuedDate;
    }

    public Optional<InstantFilter> optionalIssuedDate() {
        return Optional.ofNullable(issuedDate);
    }

    public InstantFilter issuedDate() {
        if (issuedDate == null) {
            setIssuedDate(new InstantFilter());
        }
        return issuedDate;
    }

    public void setIssuedDate(InstantFilter issuedDate) {
        this.issuedDate = issuedDate;
    }

    public InvoiceStatusFilter getStatus() {
        return status;
    }

    public Optional<InvoiceStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public InvoiceStatusFilter status() {
        if (status == null) {
            setStatus(new InvoiceStatusFilter());
        }
        return status;
    }

    public void setStatus(InvoiceStatusFilter status) {
        this.status = status;
    }

    public BigDecimalFilter getTaxAmount() {
        return taxAmount;
    }

    public Optional<BigDecimalFilter> optionalTaxAmount() {
        return Optional.ofNullable(taxAmount);
    }

    public BigDecimalFilter taxAmount() {
        if (taxAmount == null) {
            setTaxAmount(new BigDecimalFilter());
        }
        return taxAmount;
    }

    public void setTaxAmount(BigDecimalFilter taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimalFilter getTotalAmount() {
        return totalAmount;
    }

    public Optional<BigDecimalFilter> optionalTotalAmount() {
        return Optional.ofNullable(totalAmount);
    }

    public BigDecimalFilter totalAmount() {
        if (totalAmount == null) {
            setTotalAmount(new BigDecimalFilter());
        }
        return totalAmount;
    }

    public void setTotalAmount(BigDecimalFilter totalAmount) {
        this.totalAmount = totalAmount;
    }

    public StringFilter getCurrency() {
        return currency;
    }

    public Optional<StringFilter> optionalCurrency() {
        return Optional.ofNullable(currency);
    }

    public StringFilter currency() {
        if (currency == null) {
            setCurrency(new StringFilter());
        }
        return currency;
    }

    public void setCurrency(StringFilter currency) {
        this.currency = currency;
    }

    public LongFilter getItemsId() {
        return itemsId;
    }

    public Optional<LongFilter> optionalItemsId() {
        return Optional.ofNullable(itemsId);
    }

    public LongFilter itemsId() {
        if (itemsId == null) {
            setItemsId(new LongFilter());
        }
        return itemsId;
    }

    public void setItemsId(LongFilter itemsId) {
        this.itemsId = itemsId;
    }

    public LongFilter getPaymentsId() {
        return paymentsId;
    }

    public Optional<LongFilter> optionalPaymentsId() {
        return Optional.ofNullable(paymentsId);
    }

    public LongFilter paymentsId() {
        if (paymentsId == null) {
            setPaymentsId(new LongFilter());
        }
        return paymentsId;
    }

    public void setPaymentsId(LongFilter paymentsId) {
        this.paymentsId = paymentsId;
    }

    public LongFilter getBookingId() {
        return bookingId;
    }

    public Optional<LongFilter> optionalBookingId() {
        return Optional.ofNullable(bookingId);
    }

    public LongFilter bookingId() {
        if (bookingId == null) {
            setBookingId(new LongFilter());
        }
        return bookingId;
    }

    public void setBookingId(LongFilter bookingId) {
        this.bookingId = bookingId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final InvoiceCriteria that = (InvoiceCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(code, that.code) &&
            Objects.equals(issuedDate, that.issuedDate) &&
            Objects.equals(status, that.status) &&
            Objects.equals(taxAmount, that.taxAmount) &&
            Objects.equals(totalAmount, that.totalAmount) &&
            Objects.equals(currency, that.currency) &&
            Objects.equals(itemsId, that.itemsId) &&
            Objects.equals(paymentsId, that.paymentsId) &&
            Objects.equals(bookingId, that.bookingId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, code, issuedDate, status, taxAmount, totalAmount, currency, itemsId, paymentsId, bookingId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "InvoiceCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalCode().map(f -> "code=" + f + ", ").orElse("") +
            optionalIssuedDate().map(f -> "issuedDate=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalTaxAmount().map(f -> "taxAmount=" + f + ", ").orElse("") +
            optionalTotalAmount().map(f -> "totalAmount=" + f + ", ").orElse("") +
            optionalCurrency().map(f -> "currency=" + f + ", ").orElse("") +
            optionalItemsId().map(f -> "itemsId=" + f + ", ").orElse("") +
            optionalPaymentsId().map(f -> "paymentsId=" + f + ", ").orElse("") +
            optionalBookingId().map(f -> "bookingId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
