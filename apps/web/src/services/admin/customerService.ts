import type { CustomerDTO } from '../../types/adminTypes';
import { apiClient } from '../api';

const API_URL = '/api/customers';

export const getAllCustomers = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,asc',
  search?: string
) => {
  const params: Record<string, any> = { page, size, sort };
  
  // Add search filter for name or email
  if (search && search.trim()) {
    params['firstName.contains'] = search.trim();
  }
  
  const response = await apiClient.get<CustomerDTO[]>(API_URL, { params });
  
  const totalCount = response.headers['x-total-count'];
  return {
    data: response.data,
    total: totalCount ? parseInt(totalCount, 10) : 0,
  };
};

export const getCustomer = async (id: number) => {
  const response = await apiClient.get<CustomerDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createCustomer = async (customer: CustomerDTO) => {
  const response = await apiClient.post<CustomerDTO>(API_URL, customer);
  return response.data;
};

export const createWalkInCustomer = async (customer: CustomerDTO) => {
  const response = await apiClient.post<CustomerDTO>(`${API_URL}/walk-in`, customer);
  return response.data;
};

export const updateCustomer = async (id: number, customer: CustomerDTO) => {
  const response = await apiClient.put<CustomerDTO>(`${API_URL}/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};

export const searchCustomers = async () => {
    return getAllCustomers(0, 50, 'lastName,asc');
};

export const searchByLicenseId = async (licenseId: string) => {
  const response = await apiClient.get<CustomerDTO[]>(API_URL, {
    params: {
      licenseId
    }
  });
  return response.data;
};
