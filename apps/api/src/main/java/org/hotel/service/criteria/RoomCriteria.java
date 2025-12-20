package org.hotel.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.hotel.domain.enumeration.RoomStatus;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link org.hotel.domain.Room} entity. This class is used
 * in {@link org.hotel.web.rest.RoomResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /rooms?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoomCriteria implements Serializable, Criteria {

    /**
     * Class for filtering RoomStatus
     */
    public static class RoomStatusFilter extends Filter<RoomStatus> {

        public RoomStatusFilter() {}

        public RoomStatusFilter(RoomStatusFilter filter) {
            super(filter);
        }

        @Override
        public RoomStatusFilter copy() {
            return new RoomStatusFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter roomNumber;

    private RoomStatusFilter status;

    private BooleanFilter isDeleted;

    private LongFilter roomTypeId;

    private Boolean distinct;

    public RoomCriteria() {}

    public RoomCriteria(RoomCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.roomNumber = other.optionalRoomNumber().map(StringFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(RoomStatusFilter::copy).orElse(null);
        this.isDeleted = other.optionalIsDeleted().map(BooleanFilter::copy).orElse(null);
        this.roomTypeId = other.optionalRoomTypeId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public RoomCriteria copy() {
        return new RoomCriteria(this);
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

    public StringFilter getRoomNumber() {
        return roomNumber;
    }

    public Optional<StringFilter> optionalRoomNumber() {
        return Optional.ofNullable(roomNumber);
    }

    public StringFilter roomNumber() {
        if (roomNumber == null) {
            setRoomNumber(new StringFilter());
        }
        return roomNumber;
    }

    public void setRoomNumber(StringFilter roomNumber) {
        this.roomNumber = roomNumber;
    }

    public RoomStatusFilter getStatus() {
        return status;
    }

    public Optional<RoomStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public RoomStatusFilter status() {
        if (status == null) {
            setStatus(new RoomStatusFilter());
        }
        return status;
    }

    public void setStatus(RoomStatusFilter status) {
        this.status = status;
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

    public LongFilter getRoomTypeId() {
        return roomTypeId;
    }

    public Optional<LongFilter> optionalRoomTypeId() {
        return Optional.ofNullable(roomTypeId);
    }

    public LongFilter roomTypeId() {
        if (roomTypeId == null) {
            setRoomTypeId(new LongFilter());
        }
        return roomTypeId;
    }

    public void setRoomTypeId(LongFilter roomTypeId) {
        this.roomTypeId = roomTypeId;
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
        final RoomCriteria that = (RoomCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(roomNumber, that.roomNumber) &&
            Objects.equals(status, that.status) &&
            Objects.equals(isDeleted, that.isDeleted) &&
            Objects.equals(roomTypeId, that.roomTypeId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, roomNumber, status, isDeleted, roomTypeId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoomCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalRoomNumber().map(f -> "roomNumber=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalIsDeleted().map(f -> "isDeleted=" + f + ", ").orElse("") +
            optionalRoomTypeId().map(f -> "roomTypeId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
