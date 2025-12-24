import { apiClient } from '../api';
import { type AdminUserDTO, type CreateUserDTO } from '../../types/adminTypes';

const API_URL = '/api/admin/users';

export const getAllUsers = async (
  page: number = 0,
  size: number = 10,
  sort: string = 'id,asc'
) => {
  const response = await apiClient.get<AdminUserDTO[]>(API_URL, {
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

export const getUser = async (login: string) => {
  const response = await apiClient.get<AdminUserDTO>(`${API_URL}/${login}`);
  return response.data;
};

export const createUser = async (user: CreateUserDTO) => {
  const response = await apiClient.post<AdminUserDTO>(API_URL, user);
  return response.data;
};

export const updateUser = async (user: AdminUserDTO) => {
  const response = await apiClient.put<AdminUserDTO>(API_URL, user);
  return response.data;
};

export const deleteUser = async (login: string) => {
  await apiClient.delete(`${API_URL}/${login}`);
};
