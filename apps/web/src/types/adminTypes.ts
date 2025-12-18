import { type UserDTO } from './sharedTypes';

export interface AdminUserDTO extends UserDTO {
  firstName?: string;
  lastName?: string;
  email: string;
  activated: boolean;
  langKey?: string;
  authorities: string[];
  createdBy?: string;
  createdDate?: string; // ISO Date
  lastModifiedBy?: string;
  lastModifiedDate?: string; // ISO Date
}
export const CollectionType = {
  SINGLE_IMAGE: 'SINGLE_IMAGE', // Editor de una sola foto (Hero)
  GALLERY: 'GALLERY',           // Subida múltiple (Carrusel)
  TEXT_LIST: 'TEXT_LIST',       // Lista de items (Features, Contacto)
  MAP_EMBED: 'MAP_EMBED'        // Input para URL de iframe
} as const;

export interface AssetCollection {
  id?: number;
  code?: string;        // Clave única (ej: HOME_HERO)
  name?: string;        // Nombre legible (ej: Portada Principal)
  type?: typeof CollectionType[keyof typeof CollectionType];
  description?: string;
  items?: WebContent[]; // Relación OneToMany
}

export const defaultAssetCollection: Readonly<AssetCollection> = {
  type: CollectionType.SINGLE_IMAGE,
  items: []
};

export interface WebContent {
  id?: number;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  actionUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  collection?: AssetCollection | null; // Relación ManyToOne
}

export const defaultWebContent: Readonly<WebContent> = {
  isActive: true,
  sortOrder: 1,
  collection: null
};
