package org.hotel.domain.enumeration;

/**
 * The BookingStatus enumeration.
 */
public enum BookingStatus {
    PENDING, // Deprecated, replaced by PENDING_APPROVAL
    PENDING_APPROVAL, // New initial state
    PENDING_PAYMENT, // Approved, awaiting payment
    CONFIRMED,
    CHECKED_IN,
    CHECKED_OUT,
    CANCELLED,
}
