import { apiClient } from '../api';
import { type CustomerDetailsDTO } from '../../types/sharedTypes';

const API_URL = '/api/customer-details';

export const getAllCustomerDetails = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,asc'
) => {
  const response = await apiClient.get<CustomerDetailsDTO[]>(API_URL, {
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

export const getCustomerDetails = async (id: number) => {
  const response = await apiClient.get<CustomerDetailsDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createCustomerDetails = async (customerDetails: CustomerDetailsDTO) => {
  const response = await apiClient.post<CustomerDetailsDTO>(API_URL, customerDetails);
  return response.data;
};

export const updateCustomerDetails = async (id: number, customerDetails: CustomerDetailsDTO) => {
  const response = await apiClient.put<CustomerDetailsDTO>(`${API_URL}/${id}`, customerDetails);
  return response.data;
};

export const deleteCustomerDetails = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};
