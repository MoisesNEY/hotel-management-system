package org.hotel.service;

import org.hotel.service.dto.StoredFileDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FileStorageService {

    /**
     * CREATE: Sube un archivo a la raíz o carpeta por defecto.
     * @return La URL pública absoluta.
     */
    String save(MultipartFile file);

    /**
     * CREATE (Organizado): Sube un archivo a una "carpeta" específica.
     * Ej: save(file, "habitaciones") -> /habitaciones/uuid-foto.jpg
     */
    String save(MultipartFile file, String folderName);

    /**
     * DELETE: Elimina el archivo físico del bucket usando su URL.
     * Se usa cuando borras un WebContent o cuando actualizas una foto.
     */
    void delete(String imageUrl);

    /**
     * UPDATE (Sustitución): Esta es la magia que pediste.
     * 1. Sube el archivo nuevo 'newFile'.
     * 2. Si 'oldImageUrl' existe, lo borra del bucket.
     * 3. Retorna la URL del nuevo archivo.
     */
    String replace(String oldImageUrl, MultipartFile newFile);

    /**
     * READ: Lista todos los archivos con su metadata (para un administrador de archivos).
     */
    List<StoredFileDTO> listFiles(String folderName);

    /**
     * SEARCH: Busca archivos por nombre dentro de una carpeta.
     */
    List<StoredFileDTO> searchFiles(String folderName, String query);
}
