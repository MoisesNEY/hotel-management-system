import apiClient from '../api';
import type { AssetCollection } from '../../types/adminTypes';

const API_URL = 'api/asset-collections';

export const AssetCollectionService = {
  // Obtener lista paginada de colecciones
  query: async (params?: any) => {
    return apiClient.get<AssetCollection[]>(API_URL, { params });
  },

  // Obtener una colección por ID
  find: async (id: number) => {
    return apiClient.get<AssetCollection>(`${API_URL}/${id}`);
  },

  // Crear una nueva sección
  create: async (entity: AssetCollection) => {
    return apiClient.post<AssetCollection>(API_URL, entity);
  },

  // Actualizar nombre o descripción de la sección
  update: async (entity: AssetCollection) => {
    return apiClient.put<AssetCollection>(`${API_URL}/${entity.id}`, entity);
  },

  // Borrar una sección entera
  delete: async (id: number) => {
    return apiClient.delete(`${API_URL}/${id}`);
  }
};