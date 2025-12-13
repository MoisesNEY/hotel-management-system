package org.hotel.service.dto.client.response.customerdetails;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hotel.domain.enumeration.Gender;
import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor
@Setter
@Getter
public class CustomerDetailsResponse implements Serializable {
    private Long id;
    private Gender gender;
    private String phone;
    private String addressLine1;
    private String city;
    private String country;
    private String licenseId;
    private LocalDate birthDate;
    private String firstName;
    private String lastName;
    private String email;
}
