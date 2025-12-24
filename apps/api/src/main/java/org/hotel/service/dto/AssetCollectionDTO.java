package org.hotel.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import org.hotel.domain.enumeration.CollectionType;

/**
 * A DTO for the {@link org.hotel.domain.AssetCollection} entity.
 */
@Schema(description = "Define una \"Sección\" en la web pública.\nEj: 'CONTACT_INFO', 'HOME_HERO', 'FOOTER_MAP'")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AssetCollectionDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 2, max = 50)
    private String code;

    @NotNull
    @Size(max = 100)
    private String name;

    @NotNull
    private CollectionType type;

    @Size(max = 500)
    private String description;

    private Boolean isActive;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CollectionType getType() {
        return type;
    }

    public void setType(CollectionType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AssetCollectionDTO)) {
            return false;
        }

        AssetCollectionDTO assetCollectionDTO = (AssetCollectionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, assetCollectionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AssetCollectionDTO{" +
                "id=" + getId() +
                ", code='" + getCode() + "'" +
                ", name='" + getName() + "'" +
                ", type='" + getType() + "'" +
                ", description='" + getDescription() + "'" +
                ", isActive='" + getIsActive() + "'" +
                "}";
    }
}
