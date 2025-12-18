import { apiClient } from '../api';
import { type RoomDTO } from '../../types/adminTypes';

const API_URL = '/api/rooms';

export const getAllRooms = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,asc'
) => {
  const response = await apiClient.get<RoomDTO[]>(API_URL, {
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

export const getRoom = async (id: number) => {
  const response = await apiClient.get<RoomDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createRoom = async (room: RoomDTO) => {
  const response = await apiClient.post<RoomDTO>(API_URL, room);
  return response.data;
};

export const updateRoom = async (id: number, room: RoomDTO) => {
  const response = await apiClient.put<RoomDTO>(`${API_URL}/${id}`, room);
  return response.data;
};

export const deleteRoom = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};
