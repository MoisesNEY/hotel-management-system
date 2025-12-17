import { apiClient } from '../api';
import { type RoomTypeDTO } from '../../types/sharedTypes';

const API_URL = '/api/room-types';

export const getAllRoomTypes = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,asc'
) => {
  const response = await apiClient.get<RoomTypeDTO[]>(API_URL, {
    params: {
      page,
      size,
      sort,
    },
  });
  
  const totalCount = response.headers['x-total-count'];
  return {
    data: response.data,
    total: totalCount ? parseInt(totalCount, 10) : 0,
  };
};

export const getRoomType = async (id: number) => {
  const response = await apiClient.get<RoomTypeDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createRoomType = async (roomType: RoomTypeDTO) => {
  const response = await apiClient.post<RoomTypeDTO>(API_URL, roomType);
  return response.data;
};

export const updateRoomType = async (id: number, roomType: RoomTypeDTO) => {
  const response = await apiClient.put<RoomTypeDTO>(`${API_URL}/${id}`, roomType);
  return response.data;
};

export const deleteRoomType = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};
