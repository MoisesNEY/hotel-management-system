package org.hotel.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link org.hotel.domain.WebContent} entity. This class is used
 * in {@link org.hotel.web.rest.WebContentResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /web-contents?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class WebContentCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter title;

    private StringFilter subtitle;

    private StringFilter imageUrl;

    private StringFilter actionUrl;

    private IntegerFilter sortOrder;

    private BooleanFilter isActive;

    private LongFilter collectionId;

    private Boolean distinct;

    public WebContentCriteria() {}

    public WebContentCriteria(WebContentCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.title = other.optionalTitle().map(StringFilter::copy).orElse(null);
        this.subtitle = other.optionalSubtitle().map(StringFilter::copy).orElse(null);
        this.imageUrl = other.optionalImageUrl().map(StringFilter::copy).orElse(null);
        this.actionUrl = other.optionalActionUrl().map(StringFilter::copy).orElse(null);
        this.sortOrder = other.optionalSortOrder().map(IntegerFilter::copy).orElse(null);
        this.isActive = other.optionalIsActive().map(BooleanFilter::copy).orElse(null);
        this.collectionId = other.optionalCollectionId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public WebContentCriteria copy() {
        return new WebContentCriteria(this);
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

    public StringFilter getTitle() {
        return title;
    }

    public Optional<StringFilter> optionalTitle() {
        return Optional.ofNullable(title);
    }

    public StringFilter title() {
        if (title == null) {
            setTitle(new StringFilter());
        }
        return title;
    }

    public void setTitle(StringFilter title) {
        this.title = title;
    }

    public StringFilter getSubtitle() {
        return subtitle;
    }

    public Optional<StringFilter> optionalSubtitle() {
        return Optional.ofNullable(subtitle);
    }

    public StringFilter subtitle() {
        if (subtitle == null) {
            setSubtitle(new StringFilter());
        }
        return subtitle;
    }

    public void setSubtitle(StringFilter subtitle) {
        this.subtitle = subtitle;
    }

    public StringFilter getImageUrl() {
        return imageUrl;
    }

    public Optional<StringFilter> optionalImageUrl() {
        return Optional.ofNullable(imageUrl);
    }

    public StringFilter imageUrl() {
        if (imageUrl == null) {
            setImageUrl(new StringFilter());
        }
        return imageUrl;
    }

    public void setImageUrl(StringFilter imageUrl) {
        this.imageUrl = imageUrl;
    }

    public StringFilter getActionUrl() {
        return actionUrl;
    }

    public Optional<StringFilter> optionalActionUrl() {
        return Optional.ofNullable(actionUrl);
    }

    public StringFilter actionUrl() {
        if (actionUrl == null) {
            setActionUrl(new StringFilter());
        }
        return actionUrl;
    }

    public void setActionUrl(StringFilter actionUrl) {
        this.actionUrl = actionUrl;
    }

    public IntegerFilter getSortOrder() {
        return sortOrder;
    }

    public Optional<IntegerFilter> optionalSortOrder() {
        return Optional.ofNullable(sortOrder);
    }

    public IntegerFilter sortOrder() {
        if (sortOrder == null) {
            setSortOrder(new IntegerFilter());
        }
        return sortOrder;
    }

    public void setSortOrder(IntegerFilter sortOrder) {
        this.sortOrder = sortOrder;
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

    public LongFilter getCollectionId() {
        return collectionId;
    }

    public Optional<LongFilter> optionalCollectionId() {
        return Optional.ofNullable(collectionId);
    }

    public LongFilter collectionId() {
        if (collectionId == null) {
            setCollectionId(new LongFilter());
        }
        return collectionId;
    }

    public void setCollectionId(LongFilter collectionId) {
        this.collectionId = collectionId;
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
        final WebContentCriteria that = (WebContentCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(title, that.title) &&
            Objects.equals(subtitle, that.subtitle) &&
            Objects.equals(imageUrl, that.imageUrl) &&
            Objects.equals(actionUrl, that.actionUrl) &&
            Objects.equals(sortOrder, that.sortOrder) &&
            Objects.equals(isActive, that.isActive) &&
            Objects.equals(collectionId, that.collectionId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, subtitle, imageUrl, actionUrl, sortOrder, isActive, collectionId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "WebContentCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalTitle().map(f -> "title=" + f + ", ").orElse("") +
            optionalSubtitle().map(f -> "subtitle=" + f + ", ").orElse("") +
            optionalImageUrl().map(f -> "imageUrl=" + f + ", ").orElse("") +
            optionalActionUrl().map(f -> "actionUrl=" + f + ", ").orElse("") +
            optionalSortOrder().map(f -> "sortOrder=" + f + ", ").orElse("") +
            optionalIsActive().map(f -> "isActive=" + f + ", ").orElse("") +
            optionalCollectionId().map(f -> "collectionId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
