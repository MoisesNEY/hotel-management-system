// Re-export all types from services/api for convenience
export type {
    Customer,
    Room,
    RoomType,
    Booking,
    HotelService,
    ServiceRequest,
    DashboardStats,
    ChartData,
    ChartDataset
} from '../services/api';

// Re-export shared types
export type {
    RoomStatus,
    BookingStatus,
    RequestStatus,
    Gender,
    UserDTO,
    CustomerDetailsDTO,
    RoomTypeDTO,
    RoomDTO,
    BookingDTO,
    HotelServiceDTO,
    ServiceRequestDTO
} from '../../types/sharedTypes';
