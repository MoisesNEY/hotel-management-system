package org.hotel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 * A RoomType.
 */
@Entity
@Table(name = "room_type")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoomType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 3)
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "base_price", precision = 21, scale = 2, nullable = false)
    private BigDecimal basePrice;

    @NotNull
    @Min(value = 1)
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "roomType")
    @JsonIgnoreProperties(value = { "roomType" }, allowSetters = true)
    private Set<Room> rooms = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public RoomType id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public RoomType name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public RoomType description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBasePrice() {
        return this.basePrice;
    }

    public RoomType basePrice(BigDecimal basePrice) {
        this.setBasePrice(basePrice);
        return this;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getMaxCapacity() {
        return this.maxCapacity;
    }

    public RoomType maxCapacity(Integer maxCapacity) {
        this.setMaxCapacity(maxCapacity);
        return this;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public String getImageUrl() {
        return this.imageUrl;
    }

    public RoomType imageUrl(String imageUrl) {
        this.setImageUrl(imageUrl);
        return this;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Set<Room> getRooms() {
        return this.rooms;
    }

    public void setRooms(Set<Room> rooms) {
        if (this.rooms != null) {
            this.rooms.forEach(i -> i.setRoomType(null));
        }
        if (rooms != null) {
            rooms.forEach(i -> i.setRoomType(this));
        }
        this.rooms = rooms;
    }

    public RoomType rooms(Set<Room> rooms) {
        this.setRooms(rooms);
        return this;
    }

    public RoomType addRooms(Room room) {
        this.rooms.add(room);
        room.setRoomType(this);
        return this;
    }

    public RoomType removeRooms(Room room) {
        this.rooms.remove(room);
        room.setRoomType(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RoomType)) {
            return false;
        }
        return getId() != null && getId().equals(((RoomType) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoomType{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", basePrice=" + getBasePrice() +
            ", maxCapacity=" + getMaxCapacity() +
            ", imageUrl='" + getImageUrl() + "'" +
            "}";
    }
}
