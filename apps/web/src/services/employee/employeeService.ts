import { apiClient, extractPaginationInfo } from '../api';
import type { AssignRoomRequest, ServiceRequestStatusUpdateRequest } from '../../types/employeeTypes';
import type { 
  BookingDTO, 
  ServiceRequestDTO, 
  RequestStatus 
} from '../../types/sharedTypes';
import { type PaginatedResponse } from '../../types/clientTypes';

const BOOKINGS_PATH = '/api/bookings';
const SERVICE_REQUESTS_PATH = '/api/service-requests';

/**
 * Assign a room to a booking
 */
export const assignRoom = async (
  bookingId: number,
  roomId: number
): Promise<BookingDTO> => {
  const request: AssignRoomRequest = { roomId };
  const response = await apiClient.patch<BookingDTO>(
    `${BOOKINGS_PATH}/${bookingId}/assign-room`, 
    request
  );
  return response.data;
};

/**
 * Perform check-in for a booking
 */
export const checkIn = async (bookingId: number): Promise<BookingDTO> => {
  const response = await apiClient.patch<BookingDTO>(
    `${BOOKINGS_PATH}/${bookingId}/check-in`
  );
  return response.data;
};

/**
 * Perform check-out for a booking
 */
export const checkOut = async (bookingId: number): Promise<BookingDTO> => {
  const response = await apiClient.patch<BookingDTO>(
    `${BOOKINGS_PATH}/${bookingId}/check-out`
  );
  return response.data;
};

/**
 * Update the status of a service request
 */
export const updateServiceRequestStatus = async (
  requestId: number,
  status: RequestStatus
): Promise<ServiceRequestDTO> => {
  const request: ServiceRequestStatusUpdateRequest = { status };
  const response = await apiClient.patch<ServiceRequestDTO>(
    `${SERVICE_REQUESTS_PATH}/${requestId}/status`,
    request
  );
  return response.data;
};

// Also exported utilities to get all bookings/requests for employee dashboard if needed?
// The user didn't explicitly ask for list endpoints for employee, but it's likely needed.
// Based on the resources examined, there are getAllBookings and getAllServiceRequests endpoints.
// I'll add them to be proactive for the dashboard integration mentioned.

export const getAllBookings = async (
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<BookingDTO>> => {
  const response = await apiClient.get<BookingDTO[]>(BOOKINGS_PATH, {
    params: { page, size }
  });
  
  const pagination = extractPaginationInfo(response);
  
  return {
    data: response.data || [],
    totalElements: pagination?.totalElements || 0,
    totalPages: pagination?.totalPages || 0,
    currentPage: pagination?.currentPage || 0,
    pageSize: pagination?.pageSize || size
  };
};

export const getAllServiceRequests = async (
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<ServiceRequestDTO>> => {
  const response = await apiClient.get<ServiceRequestDTO[]>(SERVICE_REQUESTS_PATH, {
    params: { page, size }
  });
  
  const pagination = extractPaginationInfo(response);
  
  return {
    data: response.data || [],
    totalElements: pagination?.totalElements || 0,
    totalPages: pagination?.totalPages || 0,
    currentPage: pagination?.currentPage || 0,
    pageSize: pagination?.pageSize || size
  };
};
