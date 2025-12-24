export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
    DASHBOARD: '/dashboard/stats',
    CUSTOMERS: '/customers',
    ROOMS: '/rooms',
    BOOKINGS: '/bookings',
    SERVICES: '/services',
    SERVICE_REQUESTS: '/service-requests',
    REPORTS: '/reports'
};

export const BOOKING_STATUS_COLORS = {
    CONFIRMED: 'success',
    PENDING_APPROVAL: 'warning',
    PENDING_PAYMENT: 'complementary',
    CANCELLED: 'danger',
    CHECKED_IN: 'info',
    CHECKED_OUT: 'primary'
};

export const ROOM_STATUS_COLORS = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    MAINTENANCE: 'warning',
    CLEANING: 'info'
};
