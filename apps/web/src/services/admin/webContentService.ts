import apiClient from '../api';
import type { WebContent } from '../../types/adminTypes';

const API_URL = 'api/web-contents';

export const WebContentService = {
  // Listar contenidos (Filtrable por collectionId desde el UI)
  query: async (params?: any) => {
    // params puede ser { page: 0, size: 20, 'collectionId.equals': 5 }
    return apiClient.get<WebContent[]>(API_URL, { params });
  },

  find: async (id: number) => {
    return apiClient.get<WebContent>(`${API_URL}/${id}`);
  },

  create: async (entity: WebContent) => {
    return apiClient.post<WebContent>(API_URL, entity);
  },

  update: async (entity: WebContent) => {
    return apiClient.put<WebContent>(`${API_URL}/${entity.id}`, entity);
  },
  
  // Usamos patch para actualizaciones rápidas (ej: cambiar orden arrastrando, o activar/desactivar switch)
  partialUpdate: async (entity: WebContent) => {
    return apiClient.patch<WebContent>(`${API_URL}/${entity.id}`, entity);
  },

  delete: async (id: number) => {
    return apiClient.delete(`${API_URL}/${id}`);
  }
};