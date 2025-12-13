package org.hotel.web.rest.client;

import jakarta.validation.Valid;
import org.hotel.service.client.ClientServiceRequestService;
import org.hotel.service.dto.client.request.servicerequest.ServiceRequestCreateRequest;
import org.hotel.service.dto.client.response.servicerequest.ServiceRequestResponse;
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
@RequestMapping("/api/client/service-requests")
public class ClientServiceRequestResource {
    private final ClientServiceRequestService clientServiceRequestService;

    public ClientServiceRequestResource(ClientServiceRequestService clientServiceRequestService) {
        this.clientServiceRequestService = clientServiceRequestService;
    }

    @PostMapping
    public ResponseEntity<ServiceRequestResponse> createMyServiceRequest(@Valid @RequestBody ServiceRequestCreateRequest request) {
        var response = clientServiceRequestService.create(request);
        return ResponseEntity.created(URI.create("/api/client/service-requests/" + response.getId())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestResponse>> getMyServiceRequests(@ParameterObject Pageable pageable) {
        var pageResponse = clientServiceRequestService.findMyServiceRequests(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), pageResponse);
        return ResponseEntity.ok().headers(headers).body(pageResponse.getContent());
    }
}
