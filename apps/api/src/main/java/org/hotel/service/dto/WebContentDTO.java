package org.hotel.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link org.hotel.domain.WebContent} entity.
 */
@Schema(description = "El contenido real. Puede ser una imagen, un teléfono o una coordenada.")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class WebContentDTO implements Serializable {

    private Long id;

    @Size(max = 100)
    private String title;

    @Size(max = 500)
    private String subtitle;

    @Size(max = 2048)
    private String imageUrl;

    @Size(max = 2048)
    private String actionUrl;

    @NotNull
    private Integer sortOrder;

    private Boolean isActive;

    @NotNull
    private AssetCollectionDTO collection;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public AssetCollectionDTO getCollection() {
        return collection;
    }

    public void setCollection(AssetCollectionDTO collection) {
        this.collection = collection;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof WebContentDTO)) {
            return false;
        }

        WebContentDTO webContentDTO = (WebContentDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, webContentDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "WebContentDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", subtitle='" + getSubtitle() + "'" +
            ", imageUrl='" + getImageUrl() + "'" +
            ", actionUrl='" + getActionUrl() + "'" +
            ", sortOrder=" + getSortOrder() +
            ", isActive='" + getIsActive() + "'" +
            ", collection=" + getCollection() +
            "}";
    }
}
