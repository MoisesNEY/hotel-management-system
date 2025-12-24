import apiClient from '../api';
import type { WebContent } from '../../types/webContentTypes';

const API_URL = 'api/public/content';

/**
 * Servicio para consumir el CMS público del hotel.
 * Usa los códigos definidos en el Backend (HOME_HERO, HOME_GALLERY, etc.)
 */
export const PublicContentService = {

  /**
   * Obtiene una lista de contenidos (Para Carruseles, Features, Listas)
   * Ej: getList('HOME_GALLERY')
   */
  getList: async (code: string) => {
    const response = await apiClient.get<WebContent[]>(`${API_URL}/${code}`);
    return response.data;
  },

  /**
   * Obtiene un único contenido (Para Hero, Mapa, Configuración)
   * Ej: getSingle('HOME_HERO')
   */
  getSingle: async (code: string) => {
    const response = await apiClient.get<WebContent>(`${API_URL}/${code}/single`);
    return response.data;
  },

  getHero: () => PublicContentService.getSingle('HOME_HERO'),

  getFeatures: () => PublicContentService.getList('HOME_FEATURES'),

  getGallery: () => PublicContentService.getList('HOME_GALLERY'),

  getContactInfo: () => PublicContentService.getList('CONTACT_INFO'),

  getLocationMap: () => PublicContentService.getSingle('MAIN_LOCATION'),

  /**
   * Verifica si una sección está activa/visible en el CMS.
   */
  checkVisibility: async (code: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>(`${API_URL}/status/${code}`);
      return response.data;
    } catch (error) {
      console.warn(`Could not check visibility for [${code}], defaulting to true`);
      return true;
    }
  }
};