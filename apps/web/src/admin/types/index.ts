export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: 'ACTIVE' | 'INACTIVE';
    loyaltyPoints: number;
    lastVisit?: string;
}

export interface Room {
    id: string;
    roomNumber: string;
    type: RoomType;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';
    pricePerNight: number;
    floor: number;
    capacity: number;
    amenities: string[];
}

export interface RoomType {
    id: string;
    name: string;
    description: string;
    basePrice: number;
}

export interface Booking {
    id: string;
    customer: Customer;
    room: Room;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';
    paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
    createdAt: string;
}

export interface HotelService {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
}

export interface ServiceRequest {
    id: string;
    service: HotelService;
    room: Room;
    bookingId: string;
    requestTime: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    totalPrice: number;
    notes?: string;
}

export interface DashboardStats {
    totalBookings: number;
    occupancyRate: number;
    totalRevenue: number;
    activeCustomers: number;
    recentBookings: Booking[];
    recentServiceRequests: ServiceRequest[];
}

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
    fill?: boolean;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}
