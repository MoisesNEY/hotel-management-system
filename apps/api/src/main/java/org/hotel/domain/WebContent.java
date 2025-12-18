package org.hotel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * El contenido real. Puede ser una imagen, un teléfono o una coordenada.
 */
@Entity
@Table(name = "web_content")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class WebContent implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Size(max = 100)
    @Column(name = "title", length = 100)
    private String title;

    @Size(max = 500)
    @Column(name = "subtitle", length = 500)
    private String subtitle;

    @Size(max = 2048)
    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Size(max = 2048)
    @Column(name = "action_url", length = 2048)
    private String actionUrl;

    @NotNull
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "items" }, allowSetters = true)
    private AssetCollection collection;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public WebContent id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public WebContent title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return this.subtitle;
    }

    public WebContent subtitle(String subtitle) {
        this.setSubtitle(subtitle);
        return this;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getImageUrl() {
        return this.imageUrl;
    }

    public WebContent imageUrl(String imageUrl) {
        this.setImageUrl(imageUrl);
        return this;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getActionUrl() {
        return this.actionUrl;
    }

    public WebContent actionUrl(String actionUrl) {
        this.setActionUrl(actionUrl);
        return this;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public Integer getSortOrder() {
        return this.sortOrder;
    }

    public WebContent sortOrder(Integer sortOrder) {
        this.setSortOrder(sortOrder);
        return this;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public WebContent isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public AssetCollection getCollection() {
        return this.collection;
    }

    public void setCollection(AssetCollection assetCollection) {
        this.collection = assetCollection;
    }

    public WebContent collection(AssetCollection assetCollection) {
        this.setCollection(assetCollection);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof WebContent)) {
            return false;
        }
        return getId() != null && getId().equals(((WebContent) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "WebContent{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", subtitle='" + getSubtitle() + "'" +
            ", imageUrl='" + getImageUrl() + "'" +
            ", actionUrl='" + getActionUrl() + "'" +
            ", sortOrder=" + getSortOrder() +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
