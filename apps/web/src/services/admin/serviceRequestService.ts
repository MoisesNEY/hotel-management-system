import { apiClient } from '../api';
import { type ServiceRequestDTO } from '../../types/adminTypes';

const API_URL = '/api/service-requests';

export const getAllServiceRequests = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,desc'
) => {
  const response = await apiClient.get<ServiceRequestDTO[]>(API_URL, {
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

export const getServiceRequest = async (id: number) => {
  const response = await apiClient.get<ServiceRequestDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createServiceRequest = async (serviceRequest: ServiceRequestDTO) => {
  const response = await apiClient.post<ServiceRequestDTO>(API_URL, serviceRequest);
  return response.data;
};

export const updateServiceRequest = async (id: number, serviceRequest: ServiceRequestDTO) => {
  const response = await apiClient.put<ServiceRequestDTO>(`${API_URL}/${id}`, serviceRequest);
  return response.data;
};

export const deleteServiceRequest = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};
