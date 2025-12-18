// serviceRequestService.ts
import { apiClient } from '../api';
import { type ServiceRequestDTO } from '../../types/adminTypes';

const API_URL = '/api/service-requests';

// --------------------------
// Funciones CRUD básicas
// --------------------------
export const getAllServiceRequests = async (
  page: number = 0,
  size: number = 20,
  sort: string = 'id,desc'
) => {
  const response = await apiClient.get<ServiceRequestDTO[]>(API_URL, {
    params: { page, size, sort },
  });
  
  const totalCount = response.headers['x-total-count'];
  return {
    data: response.data,
    total: totalCount ? parseInt(totalCount, 10) : 0,
  };
};

export const getServiceRequest = async (id: number) => {
  const response = await apiClient.get<ServiceRequestDTO>(`${API_URL}/${id}`);
  return response.data;
};

export const createServiceRequest = async (serviceRequest: ServiceRequestDTO) => {
  const response = await apiClient.post<ServiceRequestDTO>(API_URL, serviceRequest);
  return response.data;
};

export const updateServiceRequest = async (id: number, serviceRequest: ServiceRequestDTO) => {
  const response = await apiClient.put<ServiceRequestDTO>(`${API_URL}/${id}`, serviceRequest);
  return response.data;
};

export const deleteServiceRequest = async (id: number) => {
  await apiClient.delete(`${API_URL}/${id}`);
};

// --------------------------
// Función para la gráfica de barras de servicios
// --------------------------
export interface ServicesChartData {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

export const getServicesChartData = async (): Promise<ServicesChartData> => {
  try {
    const response = await apiClient.get(`${API_URL}?size=1000`);
    const services = response.data as ServiceRequestDTO[];

    const total = services.length;
    const open = services.filter(s => s.status === 'OPEN').length;
    const inProgress = services.filter(s => s.status === 'IN_PROGRESS').length;
    const completed = services.filter(s => s.status === 'COMPLETED').length;
    const rejected = services.filter(s => s.status === 'REJECTED').length;

    return { total, open, inProgress, completed, rejected };
  } catch (error) {
    console.warn('Error fetching services chart data', error);
    return { total: 0, open: 0, inProgress: 0, completed: 0, rejected: 0 };
  }
};
