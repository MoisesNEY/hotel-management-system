package org.hotel.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hotel.domain.CustomerDetailsTestSamples.*;

import org.hotel.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CustomerDetailsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CustomerDetails.class);
        CustomerDetails customerDetails1 = getCustomerDetailsSample1();
        CustomerDetails customerDetails2 = new CustomerDetails();
        assertThat(customerDetails1).isNotEqualTo(customerDetails2);

        customerDetails2.setId(customerDetails1.getId());
        assertThat(customerDetails1).isEqualTo(customerDetails2);

        customerDetails2 = getCustomerDetailsSample2();
        assertThat(customerDetails1).isNotEqualTo(customerDetails2);
    }
}
