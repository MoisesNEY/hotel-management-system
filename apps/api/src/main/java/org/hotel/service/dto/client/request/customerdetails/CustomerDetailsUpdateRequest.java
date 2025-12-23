package org.hotel.service.dto.client.request.customerdetails;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hotel.domain.enumeration.Gender;

import java.io.Serializable;

@NoArgsConstructor
@Getter
@Setter
public class CustomerDetailsUpdateRequest implements Serializable {
    @NotNull
    private String firstName;
    @NotNull
    private String lastName;
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
}
