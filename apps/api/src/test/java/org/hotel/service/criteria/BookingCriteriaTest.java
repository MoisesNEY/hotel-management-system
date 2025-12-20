package org.hotel.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class BookingCriteriaTest {

    @Test
    void newBookingCriteriaHasAllFiltersNullTest() {
        var bookingCriteria = new BookingCriteria();
        assertThat(bookingCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void bookingCriteriaFluentMethodsCreatesFiltersTest() {
        var bookingCriteria = new BookingCriteria();

        setAllFilters(bookingCriteria);

        assertThat(bookingCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void bookingCriteriaCopyCreatesNullFilterTest() {
        var bookingCriteria = new BookingCriteria();
        var copy = bookingCriteria.copy();

        assertThat(bookingCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(bookingCriteria)
        );
    }

    @Test
    void bookingCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var bookingCriteria = new BookingCriteria();
        setAllFilters(bookingCriteria);

        var copy = bookingCriteria.copy();

        assertThat(bookingCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(bookingCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var bookingCriteria = new BookingCriteria();

        assertThat(bookingCriteria).hasToString("BookingCriteria{}");
    }

    private static void setAllFilters(BookingCriteria bookingCriteria) {
        bookingCriteria.id();
        bookingCriteria.code();
        bookingCriteria.checkInDate();
        bookingCriteria.checkOutDate();
        bookingCriteria.guestCount();
        bookingCriteria.status();
        bookingCriteria.notes();
        bookingCriteria.specialRequests();
        bookingCriteria.bookingItemsId();
        bookingCriteria.serviceRequestsId();
        bookingCriteria.customerId();
        bookingCriteria.distinct();
    }

    private static Condition<BookingCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCode()) &&
                condition.apply(criteria.getCheckInDate()) &&
                condition.apply(criteria.getCheckOutDate()) &&
                condition.apply(criteria.getGuestCount()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getNotes()) &&
                condition.apply(criteria.getSpecialRequests()) &&
                condition.apply(criteria.getBookingItemsId()) &&
                condition.apply(criteria.getServiceRequestsId()) &&
                condition.apply(criteria.getCustomerId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<BookingCriteria> copyFiltersAre(BookingCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCode(), copy.getCode()) &&
                condition.apply(criteria.getCheckInDate(), copy.getCheckInDate()) &&
                condition.apply(criteria.getCheckOutDate(), copy.getCheckOutDate()) &&
                condition.apply(criteria.getGuestCount(), copy.getGuestCount()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getNotes(), copy.getNotes()) &&
                condition.apply(criteria.getSpecialRequests(), copy.getSpecialRequests()) &&
                condition.apply(criteria.getBookingItemsId(), copy.getBookingItemsId()) &&
                condition.apply(criteria.getServiceRequestsId(), copy.getServiceRequestsId()) &&
                condition.apply(criteria.getCustomerId(), copy.getCustomerId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
