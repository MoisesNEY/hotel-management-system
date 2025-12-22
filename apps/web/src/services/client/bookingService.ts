import { apiClient, extractPaginationInfo } from '../api';
import type {
  BookingCreateRequest,
  BookingResponse,
  PaginationParams,
  PaginatedResponse,
  RoomTypeAvailability
} from '../../types/clientTypes';

const BOOKINGS_PATH = '/api/client/bookings';

/**
 * Create a new booking for the authenticated client
 */
export const createBooking = async (
  request: BookingCreateRequest
): Promise<BookingResponse> => {
  const response = await apiClient.post<BookingResponse>(BOOKINGS_PATH, request);
  return response.data;
};

/**
 * Get all bookings for the authenticated client with optional pagination
 */
export const getMyBookings = async (
  params?: PaginationParams
): Promise<PaginatedResponse<BookingResponse>> => {
  const response = await apiClient.get<BookingResponse[]>(BOOKINGS_PATH, {
    params
  });

  const pagination = extractPaginationInfo(response);

  return {
    data: response.data || [],
    totalElements: pagination?.totalElements || 0,
    totalPages: pagination?.totalPages || 0,
    currentPage: pagination?.currentPage || 0,
    pageSize: pagination?.pageSize || 20
  };
};

/**
 * Get room type availability for a specific date range
 */
export const getAvailability = async (
  checkIn: string,
  checkOut: string
): Promise<RoomTypeAvailability[]> => {
  const response = await apiClient.get<RoomTypeAvailability[]>(`${BOOKINGS_PATH}/availability`, {
    params: { checkIn, checkOut }
  });
  return response.data;
};

/**
 * Get a specific booking by ID
 */
export const getBooking = async (id: number): Promise<BookingResponse> => {
  const response = await apiClient.get<BookingResponse>(`${BOOKINGS_PATH}/${id}`);
  return response.data;
};
