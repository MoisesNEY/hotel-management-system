import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';
import type {
    Customer, Room, Booking, ServiceRequest, HotelService,
    DashboardStats, ChartData, RoomType
} from '../types';

// Create axios instance without Keycloak interceptors
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Dashboard Service
export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        // Mock data for development if backend is not ready
        // return Promise.resolve(MOCK_STATS);
        return (await api.get(API_ENDPOINTS.DASHBOARD)).data;
    },
    getRevenueChartData: async (): Promise<ChartData> => {
        return (await api.get(`${API_ENDPOINTS.REPORTS}/revenue-chart`)).data;
    },
    getOccupancyChartData: async (): Promise<ChartData> => {
        return (await api.get(`${API_ENDPOINTS.REPORTS}/occupancy-chart`)).data;
    }
};

// Customers Service
export const customersService = {
    getAll: async (): Promise<Customer[]> => {
        return (await api.get(API_ENDPOINTS.CUSTOMERS)).data;
    },
    getById: async (id: string): Promise<Customer> => {
        return (await api.get(`${API_ENDPOINTS.CUSTOMERS}/${id}`)).data;
    },
    create: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
        return (await api.post(API_ENDPOINTS.CUSTOMERS, customer)).data;
    },
    update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
        return (await api.put(`${API_ENDPOINTS.CUSTOMERS}/${id}`, customer)).data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
    }
};

// Rooms Service
export const roomsService = {
    getAll: async (): Promise<Room[]> => {
        return (await api.get(API_ENDPOINTS.ROOMS)).data;
    },
    getTypes: async (): Promise<RoomType[]> => {
        return (await api.get(`${API_ENDPOINTS.ROOMS}/types`)).data;
    },
    getById: async (id: string): Promise<Room> => {
        return (await api.get(`${API_ENDPOINTS.ROOMS}/${id}`)).data;
    },
    create: async (room: Omit<Room, 'id'>): Promise<Room> => {
        return (await api.post(API_ENDPOINTS.ROOMS, room)).data;
    },
    update: async (id: string, room: Partial<Room>): Promise<Room> => {
        return (await api.put(`${API_ENDPOINTS.ROOMS}/${id}`, room)).data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_ENDPOINTS.ROOMS}/${id}`);
    }
};

// Bookings Service
export const bookingsService = {
    getAll: async (): Promise<Booking[]> => {
        return (await api.get(API_ENDPOINTS.BOOKINGS)).data;
    },
    getById: async (id: string): Promise<Booking> => {
        return (await api.get(`${API_ENDPOINTS.BOOKINGS}/${id}`)).data;
    },
    create: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
        return (await api.post(API_ENDPOINTS.BOOKINGS, booking)).data;
    },
    update: async (id: string, booking: Partial<Booking>): Promise<Booking> => {
        return (await api.put(`${API_ENDPOINTS.BOOKINGS}/${id}`, booking)).data;
    },
    cancel: async (id: string): Promise<void> => {
        await api.post(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel`);
    }
};

// Services Service (Hotel Services)
export const servicesService = {
    getAllServices: async (): Promise<HotelService[]> => {
        return (await api.get(API_ENDPOINTS.SERVICES)).data;
    },
    getAllRequests: async (): Promise<ServiceRequest[]> => {
        return (await api.get(API_ENDPOINTS.SERVICE_REQUESTS)).data;
    },
    createRequest: async (request: Omit<ServiceRequest, 'id'>): Promise<ServiceRequest> => {
        return (await api.post(API_ENDPOINTS.SERVICE_REQUESTS, request)).data;
    },
    updateRequestStatus: async (id: string, status: string): Promise<ServiceRequest> => {
        return (await api.patch(`${API_ENDPOINTS.SERVICE_REQUESTS}/${id}/status`, { status })).data;
    }
};

export default api;
