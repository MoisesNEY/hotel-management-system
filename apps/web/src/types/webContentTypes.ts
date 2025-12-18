export interface WebContent {
  id?: number;
  title?: string;       // Usado para títulos de Hero, nombres de Features, etc.
  subtitle?: string;    // Usado para descripciones o valores (teléfonos)
  imageUrl?: string;    // URL de la foto (si tiene)
  actionUrl?: string;   // Link, tel:, mailto: o src del iframe
  sortOrder?: number;   // Para ordenar carruseles
}
// Valores por defecto para evitar undefined crash
export const defaultValue: Readonly<WebContent> = {};