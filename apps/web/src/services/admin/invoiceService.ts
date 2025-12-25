import api, { extractPaginationInfo } from '../api';
import type { PaginatedResponse } from '../../types/clientTypes';
import type { InvoiceDTO } from '../../types/adminTypes';

const BASE_URL = '/api/invoices';

export const getAllInvoices = async (
    page = 0, 
    size = 10, 
    sort = 'id,desc',
    status?: string,
    search?: string
) => {
    const params: Record<string, any> = { page, size, sort };
    
    if (status && status !== 'ALL') {
        params['status.equals'] = status;
    }
    if (search && search.trim()) {
        params['code.contains'] = search.trim();
    }
    
    const response = await api.get(BASE_URL, { params });
    
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

export const cancelInvoice = async (id: number) => {
    await api.post(`${BASE_URL}/${id}/cancel`);
};

export const getInvoicesByBooking = async (bookingId: number) => {
    // Using JHipster filtering
    const response = await api.get<InvoiceDTO[]>(BASE_URL, {
        params: { 'bookingId.equals': bookingId }
    });
    return response.data;
};

export const addServiceCharge = async (bookingId: number, item: any) => {
    const response = await api.post<InvoiceDTO>(`${BASE_URL}/charge`, item, {
        params: { bookingId }
    });
    return response.data;
};
