package org.hotel.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class HotelServiceCriteriaTest {

    @Test
    void newHotelServiceCriteriaHasAllFiltersNullTest() {
        var hotelServiceCriteria = new HotelServiceCriteria();
        assertThat(hotelServiceCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void hotelServiceCriteriaFluentMethodsCreatesFiltersTest() {
        var hotelServiceCriteria = new HotelServiceCriteria();

        setAllFilters(hotelServiceCriteria);

        assertThat(hotelServiceCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void hotelServiceCriteriaCopyCreatesNullFilterTest() {
        var hotelServiceCriteria = new HotelServiceCriteria();
        var copy = hotelServiceCriteria.copy();

        assertThat(hotelServiceCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(hotelServiceCriteria)
        );
    }

    @Test
    void hotelServiceCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var hotelServiceCriteria = new HotelServiceCriteria();
        setAllFilters(hotelServiceCriteria);

        var copy = hotelServiceCriteria.copy();

        assertThat(hotelServiceCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(hotelServiceCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var hotelServiceCriteria = new HotelServiceCriteria();

        assertThat(hotelServiceCriteria).hasToString("HotelServiceCriteria{}");
    }

    private static void setAllFilters(HotelServiceCriteria hotelServiceCriteria) {
        hotelServiceCriteria.id();
        hotelServiceCriteria.name();
        hotelServiceCriteria.description();
        hotelServiceCriteria.cost();
        hotelServiceCriteria.imageUrl();
        hotelServiceCriteria.isDeleted();
        hotelServiceCriteria.startHour();
        hotelServiceCriteria.endHour();
        hotelServiceCriteria.status();
        hotelServiceCriteria.distinct();
    }

    private static Condition<HotelServiceCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getName()) &&
                condition.apply(criteria.getDescription()) &&
                condition.apply(criteria.getCost()) &&
                condition.apply(criteria.getImageUrl()) &&
                condition.apply(criteria.getIsDeleted()) &&
                condition.apply(criteria.getStartHour()) &&
                condition.apply(criteria.getEndHour()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<HotelServiceCriteria> copyFiltersAre(
        HotelServiceCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getName(), copy.getName()) &&
                condition.apply(criteria.getDescription(), copy.getDescription()) &&
                condition.apply(criteria.getCost(), copy.getCost()) &&
                condition.apply(criteria.getImageUrl(), copy.getImageUrl()) &&
                condition.apply(criteria.getIsDeleted(), copy.getIsDeleted()) &&
                condition.apply(criteria.getStartHour(), copy.getStartHour()) &&
                condition.apply(criteria.getEndHour(), copy.getEndHour()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
