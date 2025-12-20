import { apiClient } from '../api';
import type { StoredFile } from '../../types/fileTypes';

/**
 * Service for file storage operations
 */
export const fileService = {
  /**
   * Upload a file
   */
  uploadFile: async (file: File, folder?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<string>('/api/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  /**
   * Get all files in a folder
   */
  listFiles: async (folder?: string): Promise<StoredFile[]> => {
    const response = await apiClient.get<StoredFile[]>('/api/files', {
      params: { folder }
    });

    return response.data;
  },

  /**
   * Search files in a folder
   */
  searchFiles: async (query: string, folder?: string): Promise<StoredFile[]> => {
    const response = await apiClient.get<StoredFile[]>('/api/files/search', {
      params: { query, folder }
    });

    return response.data;
  },

  /**
   * Delete a file
   */
  deleteFile: async (url: string): Promise<void> => {
    await apiClient.delete('/api/files', {
      params: { url }
    });
  },

  /**
   * Replace a file
   */
  replaceFile: async (oldUrl: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('oldUrl', oldUrl);
    formData.append('file', file);

    const response = await apiClient.put<string>('/api/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
};

export default fileService;
