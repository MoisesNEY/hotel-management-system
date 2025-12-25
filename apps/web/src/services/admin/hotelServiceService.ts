import { apiClient } from '../api';
import { type HotelServiceDTO } from '../../types/adminTypes';

const API_URL = '/api/hotel-services';

export const getAllHotelServices = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,asc',
  status?: string,
  search?: string
) => {
  const params: Record<string, any> = { page, size, sort };
  
  // Add status filter if provided and not 'ALL'
  if (status && status !== 'ALL') {
    params['status.equals'] = status;
  }
  
  // Add search filter for service name
  if (search && search.trim()) {
    params['name.contains'] = search.trim();
  }
  
  const response = await apiClient.get<HotelServiceDTO[]>(API_URL, { params });
  
  const totalCount = response.headers['x-total-count'];
  return {
    data: response.data,
    total: totalCount ? parseInt(totalCount, 10) : 0,
  };
};

export const getHotelService = async (id: number) => {
  const response = await apiClient.get<HotelServiceDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createHotelService = async (hotelService: HotelServiceDTO) => {
  const response = await apiClient.post<HotelServiceDTO>(API_URL, hotelService);
  return response.data;
};

export const updateHotelService = async (id: number, hotelService: HotelServiceDTO) => {
  const response = await apiClient.put<HotelServiceDTO>(`${API_URL}/${id}`, hotelService);
  return response.data;
};

export const deleteHotelService = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};
