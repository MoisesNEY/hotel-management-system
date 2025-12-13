package org.hotel.service.client;

import org.hotel.domain.Booking;
import org.hotel.domain.HotelService;
import org.hotel.domain.ServiceRequest;
import org.hotel.domain.enumeration.RequestStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.HotelServiceRepository;
import org.hotel.repository.ServiceRequestRepository;
import org.hotel.security.SecurityUtils;
import org.hotel.service.dto.client.request.servicerequest.ServiceRequestCreateRequest;
import org.hotel.service.dto.client.response.servicerequest.ServiceRequestResponse;
import org.hotel.service.mapper.client.ClientServiceRequestMapper; // <--- OJO: El mapper de cliente
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.hotel.web.rest.errors.ErrorConstants.ID_NOT_FOUND;

@Service
@Transactional
public class ClientServiceRequestService {

    private final Logger log = LoggerFactory.getLogger(ClientServiceRequestService.class);

    private final ServiceRequestRepository serviceRequestRepository;
    private final ClientServiceRequestMapper clientServiceRequestMapper;

    // Repositorios para validar y relacionar
    private final BookingRepository bookingRepository;
    private final HotelServiceRepository hotelServiceRepository;

    public ClientServiceRequestService(
        ServiceRequestRepository serviceRequestRepository,
        ClientServiceRequestMapper clientServiceRequestMapper,
        BookingRepository bookingRepository,
        HotelServiceRepository hotelServiceRepository
    ) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.clientServiceRequestMapper = clientServiceRequestMapper;
        this.bookingRepository = bookingRepository;
        this.hotelServiceRepository = hotelServiceRepository;
    }

    /**
     * Crea una solicitud de servicio verificando que la reserva pertenezca al usuario.
     */
    public ServiceRequestResponse create(ServiceRequestCreateRequest request) {
        log.debug("Request to create ServiceRequest : {}", request);
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        // VALIDACIÓN DE SEGURIDAD
        // Buscamos la reserva PERO solo si pertenece a este usuario.
        Booking booking = bookingRepository.findByIdAndCustomer_Login(request.getBookingId(), userLogin)
            .orElseThrow(() -> new AccessDeniedException("No tienes permiso para solicitar servicios en esta reserva o no existe."));

        // Buscar el servicio solicitado
        HotelService service = hotelServiceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new BadRequestAlertException(
                "Servicio no encontrado",
                "serviceRequest",
                ID_NOT_FOUND
            ));
        ServiceRequest entity = clientServiceRequestMapper.toEntity(request);

        // Asignar datos del Servidor
        entity.setBooking(booking);
        entity.setService(service);
        entity.setRequestDate(Instant.now()); // Hora del servidor
        entity.setStatus(RequestStatus.OPEN); // Estado inicial forzado

        entity = serviceRequestRepository.save(entity);
        return clientServiceRequestMapper.toClientResponse(entity);
    }

    /**
     * Obtiene el historial de solicitudes del usuario actual.
     */
    @Transactional(readOnly = true)
    public Page<ServiceRequestResponse> findMyServiceRequests(Pageable pageable) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        // Metodo para filtar por login
        return serviceRequestRepository.findByBooking_Customer_Login(userLogin, pageable)
            .map(clientServiceRequestMapper::toClientResponse);
    }
}
