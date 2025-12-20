package org.hotel.service.mapper.client;

import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.request.booking.BookingItemRequest; // Asegúrate de crear este DTO
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.hotel.service.dto.client.response.booking.BookingItemResponse; // Asegúrate de crear este DTO
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClientBookingMapper {
    @Mapping(source = "bookingItems", target = "items")
    BookingResponse toClientResponse(Booking booking);
    @Mapping(source = "roomType.name", target = "roomTypeName")
    @Mapping(source = "roomType.imageUrl", target = "roomTypeImage")
    @Mapping(target = "assignedRoomNumber", expression = "java(getRoomNumberIfCheckedIn(item))")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "occupantName", target = "occupantName")
    BookingItemResponse toItemResponse(BookingItem item);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "bookingItems", source = "items")
    @Mapping(target = "notes", ignore = true)
    Booking toEntity(BookingCreateRequest request);

    /**
     * Sub-mapeo: Convierte cada ítem del JSON de entrada a la entidad BookingItem.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "booking", ignore = true) // Se asigna en el AfterMapping
    @Mapping(target = "assignedRoom", ignore = true) // Se asigna en recepción
    @Mapping(target = "price", ignore = true) // Se calcula en el Service
    @Mapping(target = "roomType.id", source = "roomTypeId") // ID vital para la reserva
    BookingItem toItemEntity(BookingItemRequest request);
    /**
     * IMPORTANTE: Cuando MapStruct crea una lista de hijos, no les asigna el padre automáticamente.
     * Este método se ejecuta al final para "conectar los cables".
     */
    @AfterMapping
    default void linkBookingItems(@MappingTarget Booking booking) {
        if (booking.getBookingItems() != null) {
            booking.getBookingItems().forEach(item -> item.setBooking(booking));
        }
    }

    /**
     * Lógica de seguridad para ocultar habitación (Adaptada al nuevo modelo).
     * Solo muestra el número si la reserva PADRE está en CHECKED_IN.
     */
    default String getRoomNumberIfCheckedIn(BookingItem item) {
        if (item.getBooking() != null &&
            BookingStatus.CHECKED_IN.equals(item.getBooking().getStatus()) &&
            item.getAssignedRoom() != null) {
            return item.getAssignedRoom().getRoomNumber();
        }
        return null;
    }
}
