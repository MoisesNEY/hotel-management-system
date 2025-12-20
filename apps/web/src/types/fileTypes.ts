export interface StoredFile {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  contentType?: string;
  key: string;
}
