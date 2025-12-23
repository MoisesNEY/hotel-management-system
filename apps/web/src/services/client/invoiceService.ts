import { apiClient, extractPaginationInfo } from '../api';
import type { PaginationParams, PaginatedResponse } from '../../types/clientTypes';
import type { InvoiceDTO } from '../../types/adminTypes';

const INVOICES_PATH = '/api/client/invoices';

/**
 * Get all invoices for the authenticated client
 */
export const getMyInvoices = async (
  params?: PaginationParams
): Promise<PaginatedResponse<InvoiceDTO>> => {
  const response = await apiClient.get<InvoiceDTO[]>(INVOICES_PATH, {
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

/**
 * Get a specific invoice for the client
 */
export const getMyInvoice = async (id: number): Promise<InvoiceDTO> => {
  const response = await apiClient.get<InvoiceDTO>(`${INVOICES_PATH}/${id}`);
  return response.data;
};
