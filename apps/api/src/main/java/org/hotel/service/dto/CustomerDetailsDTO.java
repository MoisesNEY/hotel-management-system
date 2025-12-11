package org.hotel.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import org.hotel.domain.enumeration.Gender;

/**
 * A DTO for the {@link org.hotel.domain.CustomerDetails} entity.
 */
@Schema(description = "Datos extendidos del cliente (Perfil).\nSe llena DESPUÉS del registro en Keycloak.")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CustomerDetailsDTO implements Serializable {

    private Long id;

    @NotNull
    private Gender gender;

    @NotNull
    @Pattern(regexp = "^\\+?[0-9]{7,15}$")
    private String phone;

    @NotNull
    private String addressLine1;

    @NotNull
    private String city;

    @NotNull
    private String country;

    @NotNull
    private String licenseId;

    @NotNull
    private LocalDate birthDate;

    @NotNull
    private UserDTO user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getLicenseId() {
        return licenseId;
    }

    public void setLicenseId(String licenseId) {
        this.licenseId = licenseId;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CustomerDetailsDTO)) {
            return false;
        }

        CustomerDetailsDTO customerDetailsDTO = (CustomerDetailsDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, customerDetailsDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CustomerDetailsDTO{" +
            "id=" + getId() +
            ", gender='" + getGender() + "'" +
            ", phone='" + getPhone() + "'" +
            ", addressLine1='" + getAddressLine1() + "'" +
            ", city='" + getCity() + "'" +
            ", country='" + getCountry() + "'" +
            ", licenseId='" + getLicenseId() + "'" +
            ", birthDate='" + getBirthDate() + "'" +
            ", user=" + getUser() +
            "}";
    }
}
