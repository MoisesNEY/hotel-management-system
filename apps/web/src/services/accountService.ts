import { apiClient } from './api';
import { type AdminUserDTO } from '../types/adminTypes';

const API_URL = '/api/account';

export const getAccount = async () => {
  const response = await apiClient.get<AdminUserDTO>(API_URL);
  return response.data;
};

export const updateAccount = async (user: AdminUserDTO) => {
  const response = await apiClient.put<AdminUserDTO>(API_URL, user);
  return response.data;
};
