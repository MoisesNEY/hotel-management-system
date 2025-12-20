package org.hotel.service;

import org.hotel.domain.RoomType;
import org.hotel.repository.BookingRepository;
import org.hotel.repository.RoomRepository;
import org.hotel.repository.RoomTypeRepository;
import org.hotel.web.rest.errors.BusinessRuleException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Servicio de Dominio para centralizar reglas de negocio de reservas.
 * Evita duplicidad entre BookingService (Admin) y ClientBookingService (Cliente).
 */
@Service
@Transactional(readOnly = true)
public class BookingDomainService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public BookingDomainService(BookingRepository bookingRepository,
                                RoomRepository roomRepository,
                                RoomTypeRepository roomTypeRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    /**
     * Valida reglas de fechas básicas.
     * @return Número de noches.
     */
    public long validateAndCalculateNights(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new BusinessRuleException("Las fechas de entrada y salida son obligatorias.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new BusinessRuleException("La fecha de salida debe ser posterior a la de entrada.");
        }
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights < 1) {
             throw new BusinessRuleException("La estancia mínima es de 1 noche.");
        }
        return nights;
    }

    /**
     * Valida disponibilidad para un tipo de habitación específico.
     * Lanza excepción si no hay cupo.
     */
    public void validateRoomAvailability(Long roomTypeId, Long quantityNeeded, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId) {
        long totalPhysicalRooms = roomRepository.countByRoomTypeId(roomTypeId);

        long occupiedRooms;
        if (excludeBookingId == null) {
            occupiedRooms = bookingRepository.countOverlappingBookings(roomTypeId, checkIn, checkOut);
        } else {
            occupiedRooms = bookingRepository.countOverlappingBookingsExcludingSelf(roomTypeId, checkIn, checkOut, excludeBookingId);
        }

        long availableRooms = totalPhysicalRooms - occupiedRooms;

        if (quantityNeeded > availableRooms) {
            String typeName = roomTypeRepository.findById(roomTypeId).map(RoomType::getName).orElse("Desconocido");
             throw new BusinessRuleException("No hay disponibilidad suficiente para: " + typeName +
                ". Solicitadas: " + quantityNeeded + ", Disponibles: " + availableRooms);
        }
    }

    /**
     * Calcula el precio total de un item basado en el tipo de habitación y noches.
     * Retorna el precio calculado.
     */
    public BigDecimal calculateItemPrice(RoomType roomType, long nights) {
        if (roomType.getBasePrice() == null) {
            throw new BusinessRuleException("El tipo de habitación " + roomType.getName() + " no tiene precio base configurado.");
        }
        return roomType.getBasePrice().multiply(BigDecimal.valueOf(nights));
    }
}
