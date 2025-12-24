package org.hotel.service.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;

import java.util.Optional;
import org.hotel.domain.Booking;
import org.hotel.domain.Customer;
import org.hotel.domain.RoomType;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.CustomerRepository;
import org.hotel.repository.InvoiceRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.BookingDomainService;
import org.hotel.service.MailService;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.request.booking.BookingItemRequest;
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.hotel.service.mapper.client.ClientBookingMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClientBookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ClientBookingMapper clientBookingMapper;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingDomainService bookingDomainService;

    @Mock
    private MailService mailService;

    @Mock
    private InvoiceRepository invoiceRepository;

    private ClientBookingService clientBookingService;

    private MockedStatic<SecurityUtils> securityUtilsMock;

    @BeforeEach
    void setUp() {
        clientBookingService = new ClientBookingService(
            bookingRepository,
            clientBookingMapper,
            customerRepository,
            roomTypeRepository,
            roomRepository,
            bookingDomainService,
            mailService,
            invoiceRepository
        );
        securityUtilsMock = Mockito.mockStatic(SecurityUtils.class);
    }

    @AfterEach
    void tearDown() {
        securityUtilsMock.close();
    }

    @Test
    void createClientBooking_ShouldCreateBookingAndSendEmail() {
        // Arrange
        String userLogin = "test-user";
        securityUtilsMock.when(SecurityUtils::getCurrentUserLogin).thenReturn(Optional.of(userLogin));

        BookingCreateRequest request = new BookingCreateRequest();
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setItems(new ArrayList<>());
        BookingItemRequest itemRequest = new BookingItemRequest();
        itemRequest.setRoomTypeId(1L);
        itemRequest.setOccupantName("John Doe");
        request.getItems().add(itemRequest);

        Customer customer = new Customer();
        customer.setId(100L);
        customer.setEmail("john.doe@example.com");

        Booking bookingEntity = new Booking();
        bookingEntity.setId(1L);
        
        RoomType roomType = new RoomType();
        roomType.setId(1L);
        roomType.setBasePrice(BigDecimal.valueOf(100));

        when(customerRepository.findOneByUser_Login(userLogin)).thenReturn(Optional.of(customer));
        when(bookingDomainService.validateAndCalculateNights(any(LocalDate.class), any(LocalDate.class))).thenReturn(2L);
        when(clientBookingMapper.toEntity(request)).thenReturn(bookingEntity);
        when(roomTypeRepository.findById(1L)).thenReturn(Optional.of(roomType));
        when(bookingDomainService.calculateItemPrice(eq(roomType), eq(2L))).thenReturn(BigDecimal.valueOf(200));
        when(bookingRepository.save(any(Booking.class))).thenReturn(bookingEntity);
        
        BookingResponse response = new BookingResponse();
        response.setId(1L);
        when(clientBookingMapper.toClientResponse(bookingEntity)).thenReturn(response);

        // Act
        BookingResponse result = clientBookingService.createClientBooking(request);

        // Assert
        assertThat(result).isNotNull();
        verify(customerRepository).findOneByUser_Login(userLogin);
        verify(bookingRepository).save(bookingEntity);
        verify(mailService).sendBookingCreationEmail(eq(customer), eq(bookingEntity));
    }
}
