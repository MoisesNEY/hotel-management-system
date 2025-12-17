export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';
export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';


export interface UserDTO {
  id: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
}

export interface CustomerDetailsDTO {
  id: number;
  gender: Gender;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  licenseId: string;
  birthDate: string; // ISO Date String
  user?: UserDTO;
}


export interface RoomTypeDTO {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  maxCapacity: number;
  imageUrl?: string;
  area?: number;
  beds?: number;
}

export interface RoomDTO {
  id: number;
  roomNumber: string;
  status: RoomStatus;
  isDeleted?: boolean;
  roomType: RoomTypeDTO;
}

export interface BookingDTO {
  id: number;
  checkInDate: string; // ISO Date string YYYY-MM-DD
  checkOutDate: string; // ISO Date string YYYY-MM-DD
  guestCount: number;
  status: BookingStatus;
  totalPrice?: number;
  notes?: string;
  roomType: RoomTypeDTO;
  assignedRoom?: RoomDTO;
  customer: UserDTO;
}

export interface HotelServiceDTO {
  id: number;
  name: string;
  description?: string;
  isAvailable: boolean;
  isDeleted?: boolean;
  cost: number;
  imageUrl?: string;
}

export interface ServiceRequestDTO {
  id: number;
  requestDate: string; // ISO Date-Time string
  details?: string;
  status: RequestStatus;
  service: HotelServiceDTO;
  booking: BookingDTO;
}
