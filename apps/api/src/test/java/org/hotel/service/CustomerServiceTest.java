package org.hotel.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.hotel.domain.Customer;
import org.hotel.domain.User;
import org.hotel.repository.CustomerRepository;
import org.hotel.service.dto.CustomerDTO;
import org.hotel.service.mapper.CustomerMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        customerService = new CustomerService(customerRepository, customerMapper);
    }

    @Test
    void registerOnlineCustomer_ShouldLinkUserAndSave_WhenCustomerDoesNotExist() {
        // Arrange
        User user = new User();
        user.setLogin("test-user");

        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setLicenseId("ABC-123");

        Customer customerEntity = new Customer();
        customerEntity.setLicenseId("ABC-123");

        Customer savedCustomer = new Customer();
        savedCustomer.setId(1L);
        savedCustomer.setLicenseId("ABC-123");
        savedCustomer.setUser(user);

        when(customerRepository.findOneByLicenseId("ABC-123")).thenReturn(Optional.empty());
        when(customerMapper.toEntity(customerDTO)).thenReturn(customerEntity);
        when(customerRepository.save(customerEntity)).thenReturn(savedCustomer);
        when(customerMapper.toDto(savedCustomer)).thenReturn(customerDTO);

        // Act
        CustomerDTO result = customerService.registerOnlineCustomer(user, customerDTO);

        // Assert
        assertThat(result).isNotNull();
        verify(customerRepository).save(any(Customer.class));
        assertThat(customerEntity.getUser()).isEqualTo(user);
    }

    @Test
    void registerOnlineCustomer_ShouldThrowException_WhenLicenseIdExists() {
        // Arrange
        User user = new User();
        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setLicenseId("ABC-123");

        when(customerRepository.findOneByLicenseId("ABC-123")).thenReturn(Optional.of(new Customer()));

        // Act & Assert
        assertThatThrownBy(() -> customerService.registerOnlineCustomer(user, customerDTO))
            .isInstanceOf(BadRequestAlertException.class)
            .hasMessageContaining("Customer with this License ID already exists");
    }

    @Test
    void createWalkInCustomer_ShouldNotLinkUser_WhenCustomerDoesNotExist() {
        // Arrange
        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setLicenseId("WALK-IN-123");

        Customer customerEntity = new Customer();
        customerEntity.setLicenseId("WALK-IN-123");

        Customer savedCustomer = new Customer();
        savedCustomer.setId(2L);
        savedCustomer.setLicenseId("WALK-IN-123");
        savedCustomer.setUser(null);

        when(customerRepository.findOneByLicenseId("WALK-IN-123")).thenReturn(Optional.empty());
        when(customerMapper.toEntity(customerDTO)).thenReturn(customerEntity);
        when(customerRepository.save(customerEntity)).thenReturn(savedCustomer);
        when(customerMapper.toDto(savedCustomer)).thenReturn(customerDTO);

        // Act
        CustomerDTO result = customerService.createWalkInCustomer(customerDTO);

        // Assert
        assertThat(result).isNotNull();
        verify(customerRepository).save(any(Customer.class));
        assertThat(customerEntity.getUser()).isNull();
    }

    @Test
    void createWalkInCustomer_ShouldThrowException_WhenLicenseIdExists() {
        // Arrange
        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setLicenseId("WALK-IN-123");

        when(customerRepository.findOneByLicenseId("WALK-IN-123")).thenReturn(Optional.of(new Customer()));

        // Act & Assert
        assertThatThrownBy(() -> customerService.createWalkInCustomer(customerDTO))
            .isInstanceOf(BadRequestAlertException.class)
            .hasMessageContaining("Customer with this License ID already exists");
    }
}
