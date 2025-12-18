package org.hotel.service.mapper;

import static org.hotel.domain.CustomerDetailsAsserts.*;
import static org.hotel.domain.CustomerDetailsTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerDetailsMapperTest {

    @InjectMocks
    private CustomerDetailsMapperImpl customerDetailsMapper;

    @Spy
    private UserMapper userMapper = new UserMapper();

    @BeforeEach
    void setUp() {
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCustomerDetailsSample1();
        var actual = customerDetailsMapper.toEntity(customerDetailsMapper.toDto(expected));
        assertCustomerDetailsAllPropertiesEquals(expected, actual);
    }
}
