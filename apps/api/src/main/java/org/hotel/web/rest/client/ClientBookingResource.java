package org.hotel.web.rest.client;

import jakarta.validation.Valid;
import org.hotel.service.client.ClientBookingService;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/client/bookings")
public class ClientBookingResource {
    private final ClientBookingService clientBookingService;

    public ClientBookingResource(ClientBookingService clientBookingService) {
        this.clientBookingService = clientBookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createMyBooking(@Valid @RequestBody BookingCreateRequest request) {
        var response = clientBookingService.createClientBooking(request);
        return ResponseEntity.created(URI.create("/api/client/bookings/" + response.getId())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getMyBookings(@ParameterObject Pageable pageable) {
        var pageResponse = clientBookingService.findMyBookings(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), pageResponse);
        return ResponseEntity.ok().headers(headers).body(pageResponse.getContent());
    }
}
