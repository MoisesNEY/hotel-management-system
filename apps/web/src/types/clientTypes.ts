// Enums as union types (for erasableSyntaxOnly compatibility)
export type BookingStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

// Pagination Types
export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
    [key: string]: string | number | boolean | undefined;
}

export interface PaginatedResponse<T> {
    data: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// Booking Types
export interface BookingCreateRequest {
    checkInDate: string; // ISO date string (YYYY-MM-DD)
    checkOutDate: string; // ISO date string (YYYY-MM-DD)
    guestCount: number;
    roomTypeId: number;
    notes?: string;
}

export interface BookingResponse {
    id: number;
    checkInDate: string; // ISO date string (YYYY-MM-DD)
    checkOutDate: string; // ISO date string (YYYY-MM-DD)
    guestCount: number;
    totalPrice: number;
    status: BookingStatus;
    roomTypeName: string;
    roomTypeImage?: string;
    assignedRoomNumber?: string;
}

// Customer Details Types
export interface CustomerDetailsCreateRequest {
    gender: Gender;
    phone: string;
    addressLine1: string;
    city: string;
    country: string;
    licenseId: string;
    birthDate: string; // ISO date string (YYYY-MM-DD)
}

export interface CustomerDetailsUpdateRequest {
    gender: Gender;
    phone: string;
    addressLine1: string;
    city: string;
    country: string;
}

export interface CustomerDetailsResponse {
    id: number;
    gender: Gender;
    phone: string;
    addressLine1: string;
    city: string;
    country: string;
    licenseId: string;
    birthDate: string; // ISO date string (YYYY-MM-DD)
    firstName: string;
    lastName: string;
    email: string;
}

// Service Request Types
export interface ServiceRequestCreateRequest {
    details: string;
    serviceId: number;
    bookingId: number;
}

export interface ServiceRequestResponse {
    id: number;
    requestDate: string; // ISO datetime string
    details: string;
    status: RequestStatus;
    serviceId: number;
    serviceName: string;
    serviceCost: number;
    bookingId: number;
}
