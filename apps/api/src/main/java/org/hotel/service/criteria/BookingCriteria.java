package org.hotel.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.hotel.domain.enumeration.BookingStatus;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link org.hotel.domain.Booking} entity. This class is used
 * in {@link org.hotel.web.rest.BookingResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /bookings?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class BookingCriteria implements Serializable, Criteria {

    /**
     * Class for filtering BookingStatus
     */
    public static class BookingStatusFilter extends Filter<BookingStatus> {

        public BookingStatusFilter() {}

        public BookingStatusFilter(BookingStatusFilter filter) {
            super(filter);
        }

        @Override
        public BookingStatusFilter copy() {
            return new BookingStatusFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter code;

    private LocalDateFilter checkInDate;

    private LocalDateFilter checkOutDate;

    private IntegerFilter guestCount;

    private BookingStatusFilter status;

    private StringFilter notes;

    private StringFilter specialRequests;

    private LongFilter bookingItemsId;

    private LongFilter serviceRequestsId;

    private StringFilter customerId;

    private Boolean distinct;

    public BookingCriteria() {}

    public BookingCriteria(BookingCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.code = other.optionalCode().map(StringFilter::copy).orElse(null);
        this.checkInDate = other.optionalCheckInDate().map(LocalDateFilter::copy).orElse(null);
        this.checkOutDate = other.optionalCheckOutDate().map(LocalDateFilter::copy).orElse(null);
        this.guestCount = other.optionalGuestCount().map(IntegerFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(BookingStatusFilter::copy).orElse(null);
        this.notes = other.optionalNotes().map(StringFilter::copy).orElse(null);
        this.specialRequests = other.optionalSpecialRequests().map(StringFilter::copy).orElse(null);
        this.bookingItemsId = other.optionalBookingItemsId().map(LongFilter::copy).orElse(null);
        this.serviceRequestsId = other.optionalServiceRequestsId().map(LongFilter::copy).orElse(null);
        this.customerId = other.optionalCustomerId().map(StringFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public BookingCriteria copy() {
        return new BookingCriteria(this);
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

    public LocalDateFilter getCheckInDate() {
        return checkInDate;
    }

    public Optional<LocalDateFilter> optionalCheckInDate() {
        return Optional.ofNullable(checkInDate);
    }

    public LocalDateFilter checkInDate() {
        if (checkInDate == null) {
            setCheckInDate(new LocalDateFilter());
        }
        return checkInDate;
    }

    public void setCheckInDate(LocalDateFilter checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDateFilter getCheckOutDate() {
        return checkOutDate;
    }

    public Optional<LocalDateFilter> optionalCheckOutDate() {
        return Optional.ofNullable(checkOutDate);
    }

    public LocalDateFilter checkOutDate() {
        if (checkOutDate == null) {
            setCheckOutDate(new LocalDateFilter());
        }
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDateFilter checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public IntegerFilter getGuestCount() {
        return guestCount;
    }

    public Optional<IntegerFilter> optionalGuestCount() {
        return Optional.ofNullable(guestCount);
    }

    public IntegerFilter guestCount() {
        if (guestCount == null) {
            setGuestCount(new IntegerFilter());
        }
        return guestCount;
    }

    public void setGuestCount(IntegerFilter guestCount) {
        this.guestCount = guestCount;
    }

    public BookingStatusFilter getStatus() {
        return status;
    }

    public Optional<BookingStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public BookingStatusFilter status() {
        if (status == null) {
            setStatus(new BookingStatusFilter());
        }
        return status;
    }

    public void setStatus(BookingStatusFilter status) {
        this.status = status;
    }

    public StringFilter getNotes() {
        return notes;
    }

    public Optional<StringFilter> optionalNotes() {
        return Optional.ofNullable(notes);
    }

    public StringFilter notes() {
        if (notes == null) {
            setNotes(new StringFilter());
        }
        return notes;
    }

    public void setNotes(StringFilter notes) {
        this.notes = notes;
    }

    public StringFilter getSpecialRequests() {
        return specialRequests;
    }

    public Optional<StringFilter> optionalSpecialRequests() {
        return Optional.ofNullable(specialRequests);
    }

    public StringFilter specialRequests() {
        if (specialRequests == null) {
            setSpecialRequests(new StringFilter());
        }
        return specialRequests;
    }

    public void setSpecialRequests(StringFilter specialRequests) {
        this.specialRequests = specialRequests;
    }

    public LongFilter getBookingItemsId() {
        return bookingItemsId;
    }

    public Optional<LongFilter> optionalBookingItemsId() {
        return Optional.ofNullable(bookingItemsId);
    }

    public LongFilter bookingItemsId() {
        if (bookingItemsId == null) {
            setBookingItemsId(new LongFilter());
        }
        return bookingItemsId;
    }

    public void setBookingItemsId(LongFilter bookingItemsId) {
        this.bookingItemsId = bookingItemsId;
    }

    public LongFilter getServiceRequestsId() {
        return serviceRequestsId;
    }

    public Optional<LongFilter> optionalServiceRequestsId() {
        return Optional.ofNullable(serviceRequestsId);
    }

    public LongFilter serviceRequestsId() {
        if (serviceRequestsId == null) {
            setServiceRequestsId(new LongFilter());
        }
        return serviceRequestsId;
    }

    public void setServiceRequestsId(LongFilter serviceRequestsId) {
        this.serviceRequestsId = serviceRequestsId;
    }

    public StringFilter getCustomerId() {
        return customerId;
    }

    public Optional<StringFilter> optionalCustomerId() {
        return Optional.ofNullable(customerId);
    }

    public StringFilter customerId() {
        if (customerId == null) {
            setCustomerId(new StringFilter());
        }
        return customerId;
    }

    public void setCustomerId(StringFilter customerId) {
        this.customerId = customerId;
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
        final BookingCriteria that = (BookingCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(code, that.code) &&
            Objects.equals(checkInDate, that.checkInDate) &&
            Objects.equals(checkOutDate, that.checkOutDate) &&
            Objects.equals(guestCount, that.guestCount) &&
            Objects.equals(status, that.status) &&
            Objects.equals(notes, that.notes) &&
            Objects.equals(specialRequests, that.specialRequests) &&
            Objects.equals(bookingItemsId, that.bookingItemsId) &&
            Objects.equals(serviceRequestsId, that.serviceRequestsId) &&
            Objects.equals(customerId, that.customerId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            code,
            checkInDate,
            checkOutDate,
            guestCount,
            status,
            notes,
            specialRequests,
            bookingItemsId,
            serviceRequestsId,
            customerId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "BookingCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalCode().map(f -> "code=" + f + ", ").orElse("") +
            optionalCheckInDate().map(f -> "checkInDate=" + f + ", ").orElse("") +
            optionalCheckOutDate().map(f -> "checkOutDate=" + f + ", ").orElse("") +
            optionalGuestCount().map(f -> "guestCount=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalNotes().map(f -> "notes=" + f + ", ").orElse("") +
            optionalSpecialRequests().map(f -> "specialRequests=" + f + ", ").orElse("") +
            optionalBookingItemsId().map(f -> "bookingItemsId=" + f + ", ").orElse("") +
            optionalServiceRequestsId().map(f -> "serviceRequestsId=" + f + ", ").orElse("") +
            optionalCustomerId().map(f -> "customerId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
