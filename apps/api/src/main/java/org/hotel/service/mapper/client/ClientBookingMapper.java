package org.hotel.service.mapper.client;

import java.math.BigDecimal;
import org.hotel.domain.Booking;
import org.hotel.domain.BookingItem;
import org.hotel.domain.Invoice;
import org.hotel.domain.enumeration.BookingStatus;
import org.hotel.service.dto.client.request.booking.BookingCreateRequest;
import org.hotel.service.dto.client.request.booking.BookingItemRequest; // Asegúrate de crear este DTO
import org.hotel.service.dto.client.response.booking.BookingResponse;
import org.hotel.service.dto.client.response.booking.BookingResponse.BookingItemResponse;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClientBookingMapper {
    @Mapping(source = "bookingItems", target = "items")
    @Mapping(target = "invoiceId", expression = "java(getInvoiceId(booking))")
    @Mapping(target = "invoiceStatus", expression = "java(getInvoiceStatus(booking))")
    BookingResponse toClientResponse(Booking booking);
    @Mapping(source = "roomType.name", target = "roomTypeName")
    @Mapping(source = "roomType.imageUrl", target = "roomTypeImage")
    @Mapping(target = "assignedRoomNumber", expression = "java(getRoomNumberIfCheckedIn(item))")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "occupantName", target = "occupantName")
    BookingItemResponse toItemResponse(BookingItem item);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING_APPROVAL")
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
    @Mapping(target = "roomType.id", source = "roomTypeId") 
    @Mapping(target = "occupantName", source = "occupantName")
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

    default Long getInvoiceId(Booking booking) {
        if (booking.getInvoices() == null || booking.getInvoices().isEmpty()) {
            return null;
        }
        return booking.getInvoices().stream().findFirst().map(Invoice::getId).orElse(null);
    }

    default String getInvoiceStatus(Booking booking) {
        if (booking.getInvoices() == null || booking.getInvoices().isEmpty()) {
            return null;
        }
        return booking.getInvoices().stream().findFirst().map(i -> i.getStatus().name()).orElse(null);
    }

    @AfterMapping
    default void calculateTotalPrice(Booking booking, @MappingTarget BookingResponse response) {
        if (booking.getBookingItems() == null || booking.getBookingItems().isEmpty()) {
            response.setTotalPrice(BigDecimal.ZERO);
            return;
        }
        BigDecimal total = booking.getBookingItems().stream()
            .map(item -> item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalPrice(total);
    }
}
