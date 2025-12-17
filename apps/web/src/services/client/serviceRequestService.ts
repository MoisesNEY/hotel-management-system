import { apiClient, extractPaginationInfo } from '../api';
import type {
  ServiceRequestCreateRequest,
  ServiceRequestResponse,
  PaginationParams,
  PaginatedResponse
} from '../../types/clientTypes';

const SERVICE_REQUESTS_PATH = '/api/client/service-requests';

/**
 * Create a new service request for the authenticated client
 */
export const createServiceRequest = async (
  request: ServiceRequestCreateRequest
): Promise<ServiceRequestResponse> => {
  const response = await apiClient.post<ServiceRequestResponse>(SERVICE_REQUESTS_PATH, request);
  return response.data;
};

/**
 * Get all service requests for the authenticated client with optional pagination
 */
export const getMyServiceRequests = async (
  params?: PaginationParams
): Promise<PaginatedResponse<ServiceRequestResponse>> => {
  const response = await apiClient.get<ServiceRequestResponse[]>(SERVICE_REQUESTS_PATH, {
    params
  });

  const pagination = extractPaginationInfo(response);

  return {
    data: response.data || [],
    totalElements: pagination?.totalElements || 0,
    totalPages: pagination?.totalPages || 0,
    currentPage: pagination?.currentPage || 0,
    pageSize: pagination?.pageSize || 20
  };
};
