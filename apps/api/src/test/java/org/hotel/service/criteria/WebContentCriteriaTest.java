package org.hotel.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class WebContentCriteriaTest {

    @Test
    void newWebContentCriteriaHasAllFiltersNullTest() {
        var webContentCriteria = new WebContentCriteria();
        assertThat(webContentCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void webContentCriteriaFluentMethodsCreatesFiltersTest() {
        var webContentCriteria = new WebContentCriteria();

        setAllFilters(webContentCriteria);

        assertThat(webContentCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void webContentCriteriaCopyCreatesNullFilterTest() {
        var webContentCriteria = new WebContentCriteria();
        var copy = webContentCriteria.copy();

        assertThat(webContentCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(webContentCriteria)
        );
    }

    @Test
    void webContentCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var webContentCriteria = new WebContentCriteria();
        setAllFilters(webContentCriteria);

        var copy = webContentCriteria.copy();

        assertThat(webContentCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(webContentCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var webContentCriteria = new WebContentCriteria();

        assertThat(webContentCriteria).hasToString("WebContentCriteria{}");
    }

    private static void setAllFilters(WebContentCriteria webContentCriteria) {
        webContentCriteria.id();
        webContentCriteria.title();
        webContentCriteria.subtitle();
        webContentCriteria.imageUrl();
        webContentCriteria.actionUrl();
        webContentCriteria.sortOrder();
        webContentCriteria.isActive();
        webContentCriteria.collectionId();
        webContentCriteria.distinct();
    }

    private static Condition<WebContentCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getTitle()) &&
                condition.apply(criteria.getSubtitle()) &&
                condition.apply(criteria.getImageUrl()) &&
                condition.apply(criteria.getActionUrl()) &&
                condition.apply(criteria.getSortOrder()) &&
                condition.apply(criteria.getIsActive()) &&
                condition.apply(criteria.getCollectionId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<WebContentCriteria> copyFiltersAre(WebContentCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getTitle(), copy.getTitle()) &&
                condition.apply(criteria.getSubtitle(), copy.getSubtitle()) &&
                condition.apply(criteria.getImageUrl(), copy.getImageUrl()) &&
                condition.apply(criteria.getActionUrl(), copy.getActionUrl()) &&
                condition.apply(criteria.getSortOrder(), copy.getSortOrder()) &&
                condition.apply(criteria.getIsActive(), copy.getIsActive()) &&
                condition.apply(criteria.getCollectionId(), copy.getCollectionId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
