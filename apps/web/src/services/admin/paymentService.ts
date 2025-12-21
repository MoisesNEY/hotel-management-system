import api, { extractPaginationInfo } from '../api';
import type { PaginatedResponse } from '../../types/clientTypes';
import type { PaymentDTO } from '../../types/adminTypes';

const BASE_URL = '/api/payments';

export const getAllPayments = async (page = 0, size = 10, sort = 'id,desc') => {
    const response = await api.get(BASE_URL, {
        params: { page, size, sort }
    });
    
    // Backend returns List<PaymentDTO> in body, pagination in headers
    const data = response.data;
    const pagination = extractPaginationInfo(response);
    
    return {
        data: Array.isArray(data) ? data : [],
        totalElements: pagination?.totalElements || 0,
        totalPages: pagination?.totalPages || 0,
        currentPage: pagination?.currentPage || 0,
        pageSize: pagination?.pageSize || 10
    } as PaginatedResponse<PaymentDTO>;
};

export const getPaymentById = async (id: number) => {
    const response = await api.get<PaymentDTO>(`${BASE_URL}/${id}`);
    return response.data;
};

export const createPayment = async (payment: Partial<PaymentDTO>) => {
    const response = await api.post<PaymentDTO>(BASE_URL, payment);
    return response.data;
};

export const updatePayment = async (id: number, payment: Partial<PaymentDTO>) => {
    const response = await api.put<PaymentDTO>(`${BASE_URL}/${id}`, payment);
    return response.data;
};

export const deletePayment = async (id: number) => {
    await api.delete(`${BASE_URL}/${id}`);
};
