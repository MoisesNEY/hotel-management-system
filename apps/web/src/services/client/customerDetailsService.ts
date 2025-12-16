import { apiClient } from '../api';
import type {
  CustomerDetailsCreateRequest,
  CustomerDetailsUpdateRequest,
  CustomerDetailsResponse
} from '../../types/clientTypes';

const CUSTOMER_DETAILS_PATH = '/api/client/customer-details';

/**
 * Create a customer profile for the authenticated client
 */
export const createProfile = async (
  request: CustomerDetailsCreateRequest
): Promise<CustomerDetailsResponse> => {
  const response = await apiClient.post<CustomerDetailsResponse>(CUSTOMER_DETAILS_PATH, request);
  return response.data;
};

/**
 * Update the customer profile for the authenticated client (partial update)
 */
export const updateProfile = async (
  request: CustomerDetailsUpdateRequest
): Promise<CustomerDetailsResponse> => {
  const response = await apiClient.patch<CustomerDetailsResponse>(CUSTOMER_DETAILS_PATH, request);
  return response.data;
};

/**
 * Get the customer profile for the authenticated client
 */
export const getMyProfile = async (): Promise<CustomerDetailsResponse> => {
  const response = await apiClient.get<CustomerDetailsResponse>(CUSTOMER_DETAILS_PATH);
  return response.data;
};
