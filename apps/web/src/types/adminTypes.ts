export const CollectionType = {
  SINGLE_IMAGE: 'SINGLE_IMAGE', // Editor de una sola foto (Hero)
  GALLERY: 'GALLERY',           // Subida múltiple (Carrusel)
  TEXT_LIST: 'TEXT_LIST',       // Lista de items (Features, Contacto)
  MAP_EMBED: 'MAP_EMBED'        // Input para URL de iframe
} as const;

export interface AssetCollection {
  id?: number;
  code?: string;        // Clave única (ej: HOME_HERO)
  name?: string;        // Nombre legible (ej: Portada Principal)
  type?: typeof CollectionType[keyof typeof CollectionType];
  description?: string;
  items?: WebContent[]; // Relación OneToMany
}

export const defaultAssetCollection: Readonly<AssetCollection> = {
  type: CollectionType.SINGLE_IMAGE,
  items: []
};

export interface WebContent {
  id?: number;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  actionUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  collection?: AssetCollection | null; // Relación ManyToOne
}

export const defaultWebContent: Readonly<WebContent> = {
  isActive: true,
  sortOrder: 1,
  collection: null
};
export type BookingStatus = 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING' | 'DIRTY';
export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type ServiceStatus = 'DOWN' | 'CLOSED' | 'FULL_CAPACITY' | 'OPERATIONAL';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';


export interface UserDTO {
  id: string;
  login?: string;
}

export interface AdminUserDTO extends UserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  activated?: boolean;
  langKey?: string;
  authorities?: string[];
  createdBy?: string;
  createdDate?: string; // ISO Date
  lastModifiedBy?: string;
  lastModifiedDate?: string; // ISO Date
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
  user?: AdminUserDTO;
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

export interface BookingItemDTO {
  id: number;
  price: number;
  occupantName?: string;
  roomType: RoomTypeDTO;
  assignedRoom?: RoomDTO;
}

export interface BookingDTO {
  id: number;
  code: string;
  checkInDate: string; // ISO Date string YYYY-MM-DD
  checkOutDate: string; // ISO Date string YYYY-MM-DD
  guestCount: number;
  status: BookingStatus;
  totalPrice?: number;
  notes?: string;
  items: BookingItemDTO[];
  customer: AdminUserDTO;
  invoiceId?: number;
}

export interface HotelServiceDTO {
  id?: number;
  name: string;
  description?: string;
  cost: number;
  imageUrl?: string;
  isDeleted?: boolean;
  startHour?: string;
  endHour?: string;
  status: ServiceStatus;
}

export interface ServiceRequestDTO {
  id: number;
  requestDate: string; // ISO Date-Time string
  details?: string;
  status: RequestStatus;
  service: HotelServiceDTO;
  booking: BookingDTO;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface InvoiceItemDTO {
  id: number;
  description: string;
  amount: number;
  tax?: number;
  date?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface InvoiceDTO {
  id: number;
  code: string;
  issuedDate: string; // ISO Date-Time
  dueDate?: string;   // ISO Date-Time
  totalAmount: number;
  taxAmount?: number;
  currency?: string;
  status: InvoiceStatus;
  items: InvoiceItemDTO[];
  bookingId?: number;
  booking?: BookingDTO;
}

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'PAYPAL' | 'TRANSFER';

export interface PaymentDTO {
  id: number;
  date: string; // ISO Date-Time
  amount: number;
  method: PaymentMethod;
  referenceId?: string; // For external refs (e.g. PayPal Order ID or Bank Ref)
  invoice: { id: number; code?: string };
}
