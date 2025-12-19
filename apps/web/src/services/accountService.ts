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

export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<string>(`${API_URL}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProfilePicture = async () => {
  await apiClient.delete(`${API_URL}/profile-picture`);
};
