import api, { extractPaginationInfo } from '../api';
import type { PaginatedResponse } from '../../types/clientTypes';
import type { InvoiceDTO } from '../../types/adminTypes';

const BASE_URL = '/api/invoices';

export const getAllInvoices = async (page = 0, size = 10, sort = 'id,desc') => {
    const response = await api.get(BASE_URL, {
        params: { page, size, sort }
    });
    
    // Backend returns List<InvoiceDTO> in body, pagination in headers
    const data = response.data;
    const pagination = extractPaginationInfo(response);
    
    return {
        data: Array.isArray(data) ? data : [], // Ensure it is an array
        totalElements: pagination?.totalElements || 0,
        totalPages: pagination?.totalPages || 0,
        currentPage: pagination?.currentPage || 0,
        pageSize: pagination?.pageSize || 10
    } as PaginatedResponse<InvoiceDTO>;
};

export const getInvoiceById = async (id: number) => {
    const response = await api.get<InvoiceDTO>(`${BASE_URL}/${id}`);
    return response.data;
};

export const createInvoice = async (invoice: Partial<InvoiceDTO>) => {
    const response = await api.post<InvoiceDTO>(BASE_URL, invoice);
    return response.data;
};

export const updateInvoice = async (id: number, invoice: Partial<InvoiceDTO>) => {
    const response = await api.put<InvoiceDTO>(`${BASE_URL}/${id}`, invoice);
    return response.data;
};

export const deleteInvoice = async (id: number) => {
    await api.delete(`${BASE_URL}/${id}`);
};
