package org.hotel.web.rest.client;

import jakarta.validation.Valid;
import org.hotel.service.client.ClientCustomerService;
import org.hotel.service.dto.client.request.customer.CustomerCreateRequest;
import org.hotel.service.dto.client.request.customer.CustomerUpdateRequest;
import org.hotel.service.dto.client.response.customer.CustomerResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;

@RestController
@RequestMapping("/api/client/customers") // Renamed endpoint
public class ClientCustomerResource {

    private final ClientCustomerService clientCustomerService;

    public ClientCustomerResource(ClientCustomerService clientCustomerService) {
        this.clientCustomerService = clientCustomerService;
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createMyProfile(@Valid @RequestBody CustomerCreateRequest request) {
        var response = clientCustomerService.createProfile(request);
        return ResponseEntity.created(URI.create("/api/client/customers/" + response.getId())).body(response);
    }

    @PatchMapping
    public ResponseEntity<CustomerResponse> updatePartiallyMyProfile(@Valid @RequestBody CustomerUpdateRequest request) {
        var response = clientCustomerService.updateProfile(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<CustomerResponse> getMyProfile() {
        return clientCustomerService.findMyProfile()
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }
}
