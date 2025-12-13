package org.hotel.service.mapper.client;
import org.hotel.domain.Booking;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.hotel.domain.enumeration.BookingStatus;

@Mapper(componentModel = "spring")
public interface ClientBookingMapper {

    @Mapping(source = "roomType.name", target = "roomTypeName")
    @Mapping(source = "roomType.imageUrl", target = "roomTypeImage")
    @Mapping(target = "assignedRoomNumber", expression = "java(getRoomNumberIfCheckedIn(booking))")
    BookingResponse toClientResponse(Booking booking);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING") // Estado inicial de cualquier nueva reserva
    @Mapping(target = "customer", ignore = true) // Lo asignamos en el Service con SecurityUtils
    @Mapping(target = "assignedRoom", ignore = true) // Se asigna después
    @Mapping(target = "totalPrice", ignore = true) // Se calcula en el Service
    @Mapping(target = "roomType.id", source = "roomTypeId")
    Booking toEntity(BookingCreateRequest request);

    // Lógica auxiliar para ocultar habitación
    default String getRoomNumberIfCheckedIn(Booking booking) {
        if (BookingStatus.CHECKED_IN.equals(booking.getStatus()) && booking.getAssignedRoom() != null) {
            return booking.getAssignedRoom().getRoomNumber();
        }
        return null;
    }
}
