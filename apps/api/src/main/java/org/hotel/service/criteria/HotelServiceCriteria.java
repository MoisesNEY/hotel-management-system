package org.hotel.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.hotel.domain.enumeration.ServiceStatus;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link org.hotel.domain.HotelService} entity. This class is used
 * in {@link org.hotel.web.rest.HotelServiceResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /hotel-services?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HotelServiceCriteria implements Serializable, Criteria {

    /**
     * Class for filtering ServiceStatus
     */
    public static class ServiceStatusFilter extends Filter<ServiceStatus> {

        public ServiceStatusFilter() {}

        public ServiceStatusFilter(ServiceStatusFilter filter) {
            super(filter);
        }

        @Override
        public ServiceStatusFilter copy() {
            return new ServiceStatusFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter name;

    private StringFilter description;

    private BigDecimalFilter cost;

    private StringFilter imageUrl;

    private BooleanFilter isDeleted;

    private StringFilter startHour;

    private StringFilter endHour;

    private ServiceStatusFilter status;

    private Boolean distinct;

    public HotelServiceCriteria() {}

    public HotelServiceCriteria(HotelServiceCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.name = other.optionalName().map(StringFilter::copy).orElse(null);
        this.description = other.optionalDescription().map(StringFilter::copy).orElse(null);
        this.cost = other.optionalCost().map(BigDecimalFilter::copy).orElse(null);
        this.imageUrl = other.optionalImageUrl().map(StringFilter::copy).orElse(null);
        this.isDeleted = other.optionalIsDeleted().map(BooleanFilter::copy).orElse(null);
        this.startHour = other.optionalStartHour().map(StringFilter::copy).orElse(null);
        this.endHour = other.optionalEndHour().map(StringFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(ServiceStatusFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public HotelServiceCriteria copy() {
        return new HotelServiceCriteria(this);
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

    public BigDecimalFilter getCost() {
        return cost;
    }

    public Optional<BigDecimalFilter> optionalCost() {
        return Optional.ofNullable(cost);
    }

    public BigDecimalFilter cost() {
        if (cost == null) {
            setCost(new BigDecimalFilter());
        }
        return cost;
    }

    public void setCost(BigDecimalFilter cost) {
        this.cost = cost;
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

    public BooleanFilter getIsDeleted() {
        return isDeleted;
    }

    public Optional<BooleanFilter> optionalIsDeleted() {
        return Optional.ofNullable(isDeleted);
    }

    public BooleanFilter isDeleted() {
        if (isDeleted == null) {
            setIsDeleted(new BooleanFilter());
        }
        return isDeleted;
    }

    public void setIsDeleted(BooleanFilter isDeleted) {
        this.isDeleted = isDeleted;
    }

    public StringFilter getStartHour() {
        return startHour;
    }

    public Optional<StringFilter> optionalStartHour() {
        return Optional.ofNullable(startHour);
    }

    public StringFilter startHour() {
        if (startHour == null) {
            setStartHour(new StringFilter());
        }
        return startHour;
    }

    public void setStartHour(StringFilter startHour) {
        this.startHour = startHour;
    }

    public StringFilter getEndHour() {
        return endHour;
    }

    public Optional<StringFilter> optionalEndHour() {
        return Optional.ofNullable(endHour);
    }

    public StringFilter endHour() {
        if (endHour == null) {
            setEndHour(new StringFilter());
        }
        return endHour;
    }

    public void setEndHour(StringFilter endHour) {
        this.endHour = endHour;
    }

    public ServiceStatusFilter getStatus() {
        return status;
    }

    public Optional<ServiceStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public ServiceStatusFilter status() {
        if (status == null) {
            setStatus(new ServiceStatusFilter());
        }
        return status;
    }

    public void setStatus(ServiceStatusFilter status) {
        this.status = status;
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
        final HotelServiceCriteria that = (HotelServiceCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(name, that.name) &&
            Objects.equals(description, that.description) &&
            Objects.equals(cost, that.cost) &&
            Objects.equals(imageUrl, that.imageUrl) &&
            Objects.equals(isDeleted, that.isDeleted) &&
            Objects.equals(startHour, that.startHour) &&
            Objects.equals(endHour, that.endHour) &&
            Objects.equals(status, that.status) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, description, cost, imageUrl, isDeleted, startHour, endHour, status, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HotelServiceCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalName().map(f -> "name=" + f + ", ").orElse("") +
            optionalDescription().map(f -> "description=" + f + ", ").orElse("") +
            optionalCost().map(f -> "cost=" + f + ", ").orElse("") +
            optionalImageUrl().map(f -> "imageUrl=" + f + ", ").orElse("") +
            optionalIsDeleted().map(f -> "isDeleted=" + f + ", ").orElse("") +
            optionalStartHour().map(f -> "startHour=" + f + ", ").orElse("") +
            optionalEndHour().map(f -> "endHour=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
