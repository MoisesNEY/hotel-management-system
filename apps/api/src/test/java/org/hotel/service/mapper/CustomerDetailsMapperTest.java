package org.hotel.service.mapper;

import static org.hotel.domain.CustomerDetailsAsserts.*;
import static org.hotel.domain.CustomerDetailsTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CustomerDetailsMapperTest {

    private CustomerDetailsMapper customerDetailsMapper;

    @BeforeEach
    void setUp() {
        customerDetailsMapper = new CustomerDetailsMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCustomerDetailsSample1();
        var actual = customerDetailsMapper.toEntity(customerDetailsMapper.toDto(expected));
        assertCustomerDetailsAllPropertiesEquals(expected, actual);
    }
}
