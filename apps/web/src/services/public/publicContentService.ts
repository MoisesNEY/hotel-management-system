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
  
  getLocationMap: () => PublicContentService.getSingle('MAIN_LOCATION')
};