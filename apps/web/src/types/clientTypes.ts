// Enums as union types (for erasableSyntaxOnly compatibility)
export type BookingStatus =
    | 'PENDING'
    | 'PENDING_APPROVAL'
    | 'PENDING_PAYMENT'
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
export interface BookingItemRequest {
    roomTypeId: number;
    occupantName?: string;
}

export interface BookingCreateRequest {
    checkInDate: string; // ISO date string (YYYY-MM-DD)
    checkOutDate: string; // ISO date string (YYYY-MM-DD)
    guestCount: number;
    items: BookingItemRequest[];
    notes?: string;
}

export interface BookingItemResponse {
    id: number;
    price: number;
    roomTypeName: string;
    roomTypeImage?: string;
    assignedRoomNumber?: string;
    occupantName: string;
}

export interface BookingResponse {
    id: number;
    code: string;
    checkInDate: string; // ISO date string (YYYY-MM-DD)
    checkOutDate: string; // ISO date string (YYYY-MM-DD)
    guestCount: number;
    totalPrice: number;
    status: BookingStatus;
    items: BookingItemResponse[];
    invoiceId?: number;
    invoiceStatus?: InvoiceStatus;
}

export interface RoomTypeAvailability {
    id: number;
    name: string;
    availableQuantity: number;
    basePrice: number;
    maxCapacity: number;
}

// Financial Types
export type InvoiceStatus = 'PENDING' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface InvoiceResponse {
    id: number;
    code: string;
    issuedDate: string;
    status: InvoiceStatus;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    bookingId: number;
}

export interface PaymentResponse {
    id: number;
    date: string;
    amount: number;
    method: string;
    referenceId?: string;
    paypalOrderId?: string;
    invoiceId: number;
}

export interface PaymentInitRequest {
    invoiceId: number;
}

export interface PaymentCaptureRequest {
    paypalOrderId: string;
    invoiceId: number;
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
