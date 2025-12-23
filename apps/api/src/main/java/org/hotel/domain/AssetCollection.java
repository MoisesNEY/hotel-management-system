package org.hotel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.hotel.domain.enumeration.CollectionType;

/**
 * Define una \"Sección\" en la web pública.
 * Ej: 'CONTACT_INFO', 'HOME_HERO', 'FOOTER_MAP'
 */
@Entity
@Table(name = "asset_collection")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AssetCollection implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 2, max = 50)
    @Column(name = "code", length = 50, nullable = false, unique = true)
    private String code;

    @NotNull
    @Size(max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private CollectionType type;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "collection")
    @JsonIgnoreProperties(value = { "collection" }, allowSetters = true)
    private Set<WebContent> items = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AssetCollection id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public AssetCollection code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return this.name;
    }

    public AssetCollection name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CollectionType getType() {
        return this.type;
    }

    public AssetCollection type(CollectionType type) {
        this.setType(type);
        return this;
    }

    public void setType(CollectionType type) {
        this.type = type;
    }

    public String getDescription() {
        return this.description;
    }

    public AssetCollection description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public AssetCollection isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<WebContent> getItems() {
        return this.items;
    }

    public void setItems(Set<WebContent> webContents) {
        if (this.items != null) {
            this.items.forEach(i -> i.setCollection(null));
        }
        if (webContents != null) {
            webContents.forEach(i -> i.setCollection(this));
        }
        this.items = webContents;
    }

    public AssetCollection items(Set<WebContent> webContents) {
        this.setItems(webContents);
        return this;
    }

    public AssetCollection addItems(WebContent webContent) {
        this.items.add(webContent);
        webContent.setCollection(this);
        return this;
    }

    public AssetCollection removeItems(WebContent webContent) {
        this.items.remove(webContent);
        webContent.setCollection(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AssetCollection)) {
            return false;
        }
        return getId() != null && getId().equals(((AssetCollection) o).getId());
    }

    @Override
    public int hashCode() {
        // see
        // https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AssetCollection{" +
                "id=" + getId() +
                ", code='" + getCode() + "'" +
                ", name='" + getName() + "'" +
                ", type='" + getType() + "'" +
                ", description='" + getDescription() + "'" +
                ", isActive='" + getIsActive() + "'" +
                "}";
    }
}
