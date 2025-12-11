package org.hotel.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * A HotelService.
 */
@Entity
@Table(name = "hotel_service")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HotelService implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @NotNull
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "cost", precision = 21, scale = 2, nullable = false)
    private BigDecimal cost;

    @Column(name = "image_url")
    private String imageUrl;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public HotelService id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public HotelService name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public HotelService description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsAvailable() {
        return this.isAvailable;
    }

    public HotelService isAvailable(Boolean isAvailable) {
        this.setIsAvailable(isAvailable);
        return this;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Boolean getIsDeleted() {
        return this.isDeleted;
    }

    public HotelService isDeleted(Boolean isDeleted) {
        this.setIsDeleted(isDeleted);
        return this;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public BigDecimal getCost() {
        return this.cost;
    }

    public HotelService cost(BigDecimal cost) {
        this.setCost(cost);
        return this;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public String getImageUrl() {
        return this.imageUrl;
    }

    public HotelService imageUrl(String imageUrl) {
        this.setImageUrl(imageUrl);
        return this;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HotelService)) {
            return false;
        }
        return getId() != null && getId().equals(((HotelService) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HotelService{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", isAvailable='" + getIsAvailable() + "'" +
            ", isDeleted='" + getIsDeleted() + "'" +
            ", cost=" + getCost() +
            ", imageUrl='" + getImageUrl() + "'" +
            "}";
    }
}
