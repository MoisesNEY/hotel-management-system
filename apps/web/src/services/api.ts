import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import keycloak from './keycloak';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);
      } catch (error) {
        console.warn('Failed to refresh Keycloak token', error);
      }

      if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional, for global error handling or data extraction)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Add logic here if you want to handle 401s specifically or other errors globally
    // For now we just reject
    return Promise.reject(error);
  }
);

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Extracts pagination information from Axios response headers
 */
export const extractPaginationInfo = (response: AxiosResponse): PaginationInfo | null => {
  const totalElements = response.headers['x-total-count'];
  const totalPages = response.headers['x-total-pages'];
  const currentPage = response.headers['x-current-page'];
  const pageSize = response.headers['x-page-size'];

  if (!totalElements) return null;

  return {
    totalElements: parseInt(String(totalElements), 10),
    totalPages: totalPages ? parseInt(String(totalPages), 10) : 0,
    currentPage: currentPage ? parseInt(String(currentPage), 10) : 0,
    pageSize: pageSize ? parseInt(String(pageSize), 10) : 20
  };
};

export { apiClient };
export default apiClient;


