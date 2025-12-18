import { apiClient } from '../api';
import { type RoomDTO } from '../../types/adminTypes';

const API_URL = '/api/rooms';

export const getAllRooms = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,asc'
) => {
  const response = await apiClient.get<RoomDTO[]>(API_URL, {
    params: { page, size, sort },
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

/**
 * Nueva función para la gráfica de habitaciones
 */
export interface RoomsChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export const getRoomsChartData = async (): Promise<RoomsChartData> => {
  try {
    const response = await apiClient.get('/api/rooms?size=1000');
    const rooms = response.data as RoomDTO[];

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
    const availableRooms = totalRooms - occupiedRooms;

    return {
      labels: ['Ocupadas', 'Disponibles'],
      datasets: [
        {
          label: 'Habitaciones',
          data: [occupiedRooms, availableRooms],
          backgroundColor: ['#d4af37', '#51cbce']
        }
      ]
    };
  } catch (error) {
    console.warn('Error fetching rooms chart data', error);
    return {
      labels: ['Ocupadas', 'Disponibles'],
      datasets: [
        {
          label: 'Habitaciones',
          data: [0, 0],
          backgroundColor: ['#d4af37', '#51cbce']
        }
      ]
    };
  }
};
