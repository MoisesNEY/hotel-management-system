package org.hotel.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class AssetCollectionCriteriaTest {

    @Test
    void newAssetCollectionCriteriaHasAllFiltersNullTest() {
        var assetCollectionCriteria = new AssetCollectionCriteria();
        assertThat(assetCollectionCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void assetCollectionCriteriaFluentMethodsCreatesFiltersTest() {
        var assetCollectionCriteria = new AssetCollectionCriteria();

        setAllFilters(assetCollectionCriteria);

        assertThat(assetCollectionCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void assetCollectionCriteriaCopyCreatesNullFilterTest() {
        var assetCollectionCriteria = new AssetCollectionCriteria();
        var copy = assetCollectionCriteria.copy();

        assertThat(assetCollectionCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(assetCollectionCriteria)
        );
    }

    @Test
    void assetCollectionCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var assetCollectionCriteria = new AssetCollectionCriteria();
        setAllFilters(assetCollectionCriteria);

        var copy = assetCollectionCriteria.copy();

        assertThat(assetCollectionCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(assetCollectionCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var assetCollectionCriteria = new AssetCollectionCriteria();

        assertThat(assetCollectionCriteria).hasToString("AssetCollectionCriteria{}");
    }

    private static void setAllFilters(AssetCollectionCriteria assetCollectionCriteria) {
        assetCollectionCriteria.id();
        assetCollectionCriteria.code();
        assetCollectionCriteria.name();
        assetCollectionCriteria.type();
        assetCollectionCriteria.description();
        assetCollectionCriteria.itemsId();
        assetCollectionCriteria.distinct();
    }

    private static Condition<AssetCollectionCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCode()) &&
                condition.apply(criteria.getName()) &&
                condition.apply(criteria.getType()) &&
                condition.apply(criteria.getDescription()) &&
                condition.apply(criteria.getItemsId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<AssetCollectionCriteria> copyFiltersAre(
        AssetCollectionCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCode(), copy.getCode()) &&
                condition.apply(criteria.getName(), copy.getName()) &&
                condition.apply(criteria.getType(), copy.getType()) &&
                condition.apply(criteria.getDescription(), copy.getDescription()) &&
                condition.apply(criteria.getItemsId(), copy.getItemsId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
