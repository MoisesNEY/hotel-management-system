package org.hotel.service.employee;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.Room;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.domain.enumeration.RoomStatus;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.service.dto.BookingDTO;
import org.hotel.service.dto.employee.request.booking.AssignRoomRequest;
import org.hotel.service.mapper.BookingMapper;
import org.hotel.web.rest.errors.BadRequestAlertException;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.hotel.web.rest.errors.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static org.hotel.web.rest.errors.ErrorConstants.ID_NOT_FOUND;

@Service
@Transactional
public class EmployeeBookingService {

    private final Logger log = LoggerFactory.getLogger(EmployeeBookingService.class);
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final BookingMapper bookingMapper;

    public EmployeeBookingService(BookingRepository bookingRepository, 
                                  RoomRepository roomRepository, 
                                  BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.bookingMapper = bookingMapper;
    }

    /**
     * Realiza el Check-In global de la reserva.
     * Requisito: TODAS las habitaciones solicitadas deben tener una habitación física asignada.
     */
    public BookingDTO checkIn(Long bookingId) {
        // Usamos el findOneWithToOneRelationships para traer los items y las habitaciones asignadas de un tirón
        Booking booking = bookingRepository.findOneWithToOneRelationships(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        if (!BookingStatus.CONFIRMED.equals(booking.getStatus())) {
            throw new BusinessRuleException("La reserva no está en estado CONFIRMED, no se puede hacer Check-In.");
        }

        // Validación Multi-Habitación: Recorremos los items
        boolean allRoomsAssigned = booking.getBookingItems().stream()
            .allMatch(item -> item.getAssignedRoom() != null);

        if (!allRoomsAssigned) {
            throw new BusinessRuleException("Faltan habitaciones por asignar. Asigne todas las habitaciones antes del Check-In.");
        }

        // Cambio de estado
        booking.setStatus(BookingStatus.CHECKED_IN);
        
        // Opcional: Podrías marcar el estado de las habitaciones físicas como OCCUPIED aquí
        booking.getBookingItems().forEach(item -> {
            item.getAssignedRoom().setStatus(RoomStatus.OCCUPIED);
        });

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public BookingDTO checkOut(Long bookingId) {
        Booking booking = bookingRepository.findOneWithToOneRelationships(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        if (!BookingStatus.CHECKED_IN.equals(booking.getStatus())) {
            throw new BusinessRuleException("Solo se puede hacer Check-Out de una reserva que esté actualmente en casa (CHECKED_IN).");
        }
        
        booking.setStatus(BookingStatus.CHECKED_OUT);
        
        // Liberar habitaciones (Pasar a DIRTY para limpieza)
        booking.getBookingItems().forEach(item -> {
            if (item.getAssignedRoom() != null) {
                item.getAssignedRoom().setStatus(RoomStatus.DIRTY);
            }
        });

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    /**
     * Asigna una habitación física a un item específico de la reserva.
     */
    /**
     * Asigna una habitación física a un item específico de la reserva.
     */
    public BookingDTO assignRoom(Long bookingId, AssignRoomRequest request) {
        // 1. Cargar Reserva con sus items
        Booking booking = bookingRepository.findOneWithToOneRelationships(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        if (!BookingStatus.CONFIRMED.equals(booking.getStatus()) && !BookingStatus.CHECKED_IN.equals(booking.getStatus())) {
            throw new BusinessRuleException("La reserva debe estar CONFIRMADA para asignar habitaciones.");
        }

        // 2. Buscar el Item específico dentro de la reserva (Seguridad: aseguramos que el item pertenece a la reserva)
        BookingItem targetItem = booking.getBookingItems().stream()
            .filter(item -> item.getId().equals(request.getBookingItemId()))
            .findFirst()
            .orElseThrow(() -> new BadRequestAlertException("El item de reserva indicado no pertenece a esta reserva", "booking", "itemMismatch"));

        // 3. Cargar la Habitación Física
        Room newRoom = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new BadRequestAlertException("Habitación no encontrada", "booking", ID_NOT_FOUND));

        // 4. VALIDACIÓN DE NEGOCIO: Coherencia de Tipos
        if (!targetItem.getRoomType().getId().equals(newRoom.getRoomType().getId())) {
             throw new BusinessRuleException("La habitación seleccionada (" + newRoom.getRoomType().getName() + 
                 ") no coincide con el tipo reservado (" + targetItem.getRoomType().getName() + ")");
        }

        // 5. VALIDACIÓN: Disponibilidad Física
        if (!RoomStatus.AVAILABLE.equals(newRoom.getStatus()) && !RoomStatus.DIRTY.equals(newRoom.getStatus())) {
             throw new BusinessRuleException("La habitación " + newRoom.getRoomNumber() + " no está disponible (Estado: " + newRoom.getStatus() + ")");
        }

        // 6. Asignar
        targetItem.setAssignedRoom(newRoom);
        
        // Guardamos la reserva completa (cascade update del item)
        return bookingMapper.toDto(bookingRepository.save(booking));
    }
}