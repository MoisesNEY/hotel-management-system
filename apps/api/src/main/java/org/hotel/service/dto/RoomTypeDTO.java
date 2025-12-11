package org.hotel.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link org.hotel.domain.RoomType} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoomTypeDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 3)
    private String name;

    @Lob
    private String description;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal basePrice;

    @NotNull
    @Min(value = 1)
    private Integer maxCapacity;

    private String imageUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RoomTypeDTO)) {
            return false;
        }

        RoomTypeDTO roomTypeDTO = (RoomTypeDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, roomTypeDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoomTypeDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", basePrice=" + getBasePrice() +
            ", maxCapacity=" + getMaxCapacity() +
            ", imageUrl='" + getImageUrl() + "'" +
            "}";
    }
}
