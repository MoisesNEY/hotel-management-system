package org.hotel.service.employee;

import org.hotel.domain.Booking;
import org.hotel.domain.Room;
import org.hotel.domain.enumeration.BookingStatus;
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

    public EmployeeBookingService(BookingRepository bookingRepository, RoomRepository roomRepository, BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.bookingMapper = bookingMapper;
    }

    public BookingDTO checkIn(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        if (!BookingStatus.CONFIRMED.equals(booking.getStatus())) {
            throw new BusinessRuleException("La reserva no esta lista para Check-In.");
        }

        if (booking.getAssignedRoom() == null) {
            throw new BusinessRuleException("Debes asignar una habitación para realizar el Check-In.");
        }

        // Cambio de estado
        booking.setStatus(BookingStatus.CHECKED_IN);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public BookingDTO checkOut(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        if (!BookingStatus.CHECKED_IN.equals(booking.getStatus())) {
            throw new BusinessRuleException("Solo se puede hacer Check-Out de una reserva activa.");
        }
        booking.setStatus(BookingStatus.CHECKED_OUT);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public BookingDTO assignRoom(Long bookingId, AssignRoomRequest assignRoomRequest) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva", bookingId));

        Room newRoom = roomRepository.findById(assignRoomRequest.getRoomId())
            .orElseThrow(() -> new BadRequestAlertException("Habitación no encontrada",
                "booking", ID_NOT_FOUND));

        if (!BookingStatus.CONFIRMED.equals(booking.getStatus())) {
            throw new BusinessRuleException("La reserva no esta lista para asignar una habitación");
        }

        booking.setAssignedRoom(newRoom);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }
}
