import { apiClient } from '../api';
import type {
  CustomerCreateRequest,
  CustomerUpdateRequest,
  CustomerResponse
} from '../../types/clientTypes';

// Updated endpoint
const CUSTOMER_PATH = '/api/client/customers';

/**
 * Create a customer profile for the authenticated client
 */
export const createProfile = async (
  request: CustomerCreateRequest
): Promise<CustomerResponse> => {
  const response = await apiClient.post<CustomerResponse>(CUSTOMER_PATH, request);
  return response.data;
};

/**
 * Update the customer profile for the authenticated client (partial update)
 */
export const updateProfile = async (
  request: CustomerUpdateRequest
): Promise<CustomerResponse> => {
  const response = await apiClient.patch<CustomerResponse>(CUSTOMER_PATH, request);
  return response.data;
};

/**
 * Get the customer profile for the authenticated client
 */
export const getMyProfile = async (): Promise<CustomerResponse> => {
  const response = await apiClient.get<CustomerResponse>(CUSTOMER_PATH + '/profile');
  return response.data;
};
