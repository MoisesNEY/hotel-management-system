import type { CustomerDTO } from '../../types/adminTypes';
import { apiClient } from '../api';

const API_URL = '/api/customers';

export const getAllCustomers = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,asc'
) => {
  const response = await apiClient.get<CustomerDTO[]>(API_URL, {
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

export const getCustomer = async (id: number) => {
  const response = await apiClient.get<CustomerDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createCustomer = async (customer: CustomerDTO) => {
  const response = await apiClient.post<CustomerDTO>(API_URL, customer);
  return response.data;
};

export const updateCustomer = async (id: number, customer: CustomerDTO) => {
  const response = await apiClient.put<CustomerDTO>(`${API_URL}/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};

export const searchCustomers = async (query: string) => {
    // Implement search endpoint if available or filter client side for now.
    // Assuming backend might support basic search or we just use getAll for form dropdowns.
    // For specific licenseId search we might need a specific endpoint or filter.
    // For now, let's just stick to getAllCustomers or simple params.
    return getAllCustomers(0, 50, 'lastName,asc');
};
