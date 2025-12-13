package org.hotel.web.rest.client;

import jakarta.validation.Valid;
import org.hotel.service.client.ClientCustomerDetailsService;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsCreateRequest;
import org.hotel.service.dto.client.request.customerdetails.CustomerDetailsUpdateRequest;
import org.hotel.service.dto.client.response.customerdetails.CustomerDetailsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;

@RestController
@RequestMapping("/api/client/customer-details")
public class ClientCustomerDetailsResource {
    private final ClientCustomerDetailsService clientCustomerDetailsService;
    public ClientCustomerDetailsResource(ClientCustomerDetailsService clientCustomerDetailsService) {
        this.clientCustomerDetailsService = clientCustomerDetailsService;
    }
    @PostMapping
    public ResponseEntity<CustomerDetailsResponse> createMyProfile(@Valid @RequestBody CustomerDetailsCreateRequest request) {
        var response = clientCustomerDetailsService.createProfile(request);
        return ResponseEntity.created(URI.create("/api/client/customer-details/" + response.getId())).body(response);
    }
    @PatchMapping
    public ResponseEntity<CustomerDetailsResponse> updatePartiallyMyProfile(@Valid @RequestBody CustomerDetailsUpdateRequest request) {
        var response = clientCustomerDetailsService.updateProfile(request);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/profile")
    public ResponseEntity<CustomerDetailsResponse> getMyProfile() {
        return clientCustomerDetailsService.findMyProfile()
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

}
