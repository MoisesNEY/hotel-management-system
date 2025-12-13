package org.hotel.service.dto.client.request.customerdetails;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hotel.domain.enumeration.Gender;
import org.hotel.service.dto.UserDTO;

import java.io.Serializable;
import java.time.LocalDate;


@NoArgsConstructor
@Getter
@Setter
public class CustomerDetailsCreateRequest implements Serializable {
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
}
