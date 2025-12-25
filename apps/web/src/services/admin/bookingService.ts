import { apiClient } from '../api';
import { type BookingDTO } from '../../types/adminTypes';
import { type AssignRoomRequest } from '../../types/employeeTypes';

const API_URL = '/api/bookings';

export const getAllBookings = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,desc',
  status?: string,
  search?: string
) => {
  const params: Record<string, any> = { page, size, sort };
  
  // Add status filter if provided and not 'ALL'
  if (status && status !== 'ALL') {
    params['status.equals'] = status;
  }
  
  // Add search filter for customer name
  if (search && search.trim()) {
    params['customer.firstName.contains'] = search.trim();
  }
  
  const response = await apiClient.get<BookingDTO[]>(API_URL, { params });
  
  const totalCount = response.headers['x-total-count'];
  return {
    data: response.data,
    total: totalCount ? parseInt(totalCount, 10) : 0,
  };
};

export const getBooking = async (id: number) => {
  const response = await apiClient.get<BookingDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createBooking = async (booking: BookingDTO) => {
  const response = await apiClient.post<BookingDTO>(API_URL, booking);
  return response.data;
};

export const updateBooking = async (id: number, booking: BookingDTO) => {
  const response = await apiClient.put<BookingDTO>(`${API_URL}/${id}`, booking);
  return response.data;
};

export const deleteBooking = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};

export const assignRoom = async (id: number, request: AssignRoomRequest) => {
  const response = await apiClient.patch<BookingDTO>(`${API_URL}/${id}/assign-room`, request);
  return response.data;
};

export const approveBooking = async (id: number) => {
  const response = await apiClient.patch<BookingDTO>(`${API_URL}/${id}/approve`, {});
  return response.data;
};

export const createWalkInBooking = async (booking: BookingDTO) => {
  const response = await apiClient.post<BookingDTO>(`${API_URL}/walk-in`, booking);
  return response.data;
};

import { type RoomTypeAvailabilityDTO } from '../../types/adminTypes';

export const checkAvailability = async (checkIn: string, checkOut: string) => {
    const response = await apiClient.get<RoomTypeAvailabilityDTO[]>('/api/client/bookings/availability', {
        params: {
            checkIn,
            checkOut
        }
    });
    return response.data;
};
