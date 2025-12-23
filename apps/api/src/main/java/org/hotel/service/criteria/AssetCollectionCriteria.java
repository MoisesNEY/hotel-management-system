package org.hotel.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.hotel.domain.enumeration.CollectionType;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link org.hotel.domain.AssetCollection} entity. This class is used
 * in {@link org.hotel.web.rest.AssetCollectionResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /asset-collections?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AssetCollectionCriteria implements Serializable, Criteria {

    /**
     * Class for filtering CollectionType
     */
    public static class CollectionTypeFilter extends Filter<CollectionType> {

        public CollectionTypeFilter() {}

        public CollectionTypeFilter(CollectionTypeFilter filter) {
            super(filter);
        }

        @Override
        public CollectionTypeFilter copy() {
            return new CollectionTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter code;

    private StringFilter name;

    private CollectionTypeFilter type;

    private StringFilter description;

    private BooleanFilter isActive;

    private LongFilter itemsId;

    private Boolean distinct;

    public AssetCollectionCriteria() {}

    public AssetCollectionCriteria(AssetCollectionCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.code = other.optionalCode().map(StringFilter::copy).orElse(null);
        this.name = other.optionalName().map(StringFilter::copy).orElse(null);
        this.type = other.optionalType().map(CollectionTypeFilter::copy).orElse(null);
        this.description = other.optionalDescription().map(StringFilter::copy).orElse(null);
        this.isActive = other.optionalIsActive().map(BooleanFilter::copy).orElse(null);
        this.itemsId = other.optionalItemsId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public AssetCollectionCriteria copy() {
        return new AssetCollectionCriteria(this);
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

    public StringFilter getName() {
        return name;
    }

    public Optional<StringFilter> optionalName() {
        return Optional.ofNullable(name);
    }

    public StringFilter name() {
        if (name == null) {
            setName(new StringFilter());
        }
        return name;
    }

    public void setName(StringFilter name) {
        this.name = name;
    }

    public CollectionTypeFilter getType() {
        return type;
    }

    public Optional<CollectionTypeFilter> optionalType() {
        return Optional.ofNullable(type);
    }

    public CollectionTypeFilter type() {
        if (type == null) {
            setType(new CollectionTypeFilter());
        }
        return type;
    }

    public void setType(CollectionTypeFilter type) {
        this.type = type;
    }

    public StringFilter getDescription() {
        return description;
    }

    public Optional<StringFilter> optionalDescription() {
        return Optional.ofNullable(description);
    }

    public StringFilter description() {
        if (description == null) {
            setDescription(new StringFilter());
        }
        return description;
    }

    public void setDescription(StringFilter description) {
        this.description = description;
    }

    public BooleanFilter getIsActive() {
        return isActive;
    }

    public Optional<BooleanFilter> optionalIsActive() {
        return Optional.ofNullable(isActive);
    }

    public BooleanFilter isActive() {
        if (isActive == null) {
            setIsActive(new BooleanFilter());
        }
        return isActive;
    }

    public void setIsActive(BooleanFilter isActive) {
        this.isActive = isActive;
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
        final AssetCollectionCriteria that = (AssetCollectionCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(code, that.code) &&
            Objects.equals(name, that.name) &&
            Objects.equals(type, that.type) &&
            Objects.equals(description, that.description) &&
            Objects.equals(isActive, that.isActive) &&
            Objects.equals(itemsId, that.itemsId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, code, name, type, description, isActive, itemsId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AssetCollectionCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalCode().map(f -> "code=" + f + ", ").orElse("") +
            optionalName().map(f -> "name=" + f + ", ").orElse("") +
            optionalType().map(f -> "type=" + f + ", ").orElse("") +
            optionalDescription().map(f -> "description=" + f + ", ").orElse("") +
            optionalIsActive().map(f -> "isActive=" + f + ", ").orElse("") +
            optionalItemsId().map(f -> "itemsId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
