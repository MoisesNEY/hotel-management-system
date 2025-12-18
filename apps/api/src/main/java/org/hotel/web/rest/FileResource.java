package org.hotel.web.rest;

import org.hotel.security.AuthoritiesConstants;
import org.hotel.service.FileStorageService;
import org.hotel.service.dto.StoredFileDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller for managing file storage.
 */
@RestController
@RequestMapping("/api/files")
public class FileResource {

    private static final Logger LOG = LoggerFactory.getLogger(FileResource.class);

    private final FileStorageService fileStorageService;

    public FileResource(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * {@code POST  /api/files} : Upload a file.
     *
     * @param file the file to upload.
     * @param folder the folder to upload the file to.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the URL of the uploaded file.
     */
    @PostMapping("")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\") or hasAuthority(\"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<String> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "folder", required = false) String folder
    ) {
        LOG.debug("REST request to upload file : {} to folder : {}", file.getOriginalFilename(), folder);
        String url = fileStorageService.save(file, folder);
        return ResponseEntity.ok().body(url);
    }

    /**
     * {@code GET  /api/files} : Get all files in a folder.
     *
     * @param folder the folder to list files from.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of files in body.
     */
    @GetMapping("")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\") or hasAuthority(\"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<List<StoredFileDTO>> getAllFiles(@RequestParam(value = "folder", required = false) String folder) {
        LOG.debug("REST request to get all files in folder : {}", folder);
        List<StoredFileDTO> files = fileStorageService.listFiles(folder);
        return ResponseEntity.ok().body(files);
    }

    /**
     * {@code GET  /api/files/search} : Search files in a folder.
     *
     * @param folder the folder to search in.
     * @param query the search query.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of matching files in body.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\") or hasAuthority(\"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<List<StoredFileDTO>> searchFiles(
        @RequestParam(value = "folder", required = false) String folder,
        @RequestParam("query") String query
    ) {
        LOG.debug("REST request to search files in folder : {} with query : {}", folder, query);
        List<StoredFileDTO> files = fileStorageService.searchFiles(folder, query);
        return ResponseEntity.ok().body(files);
    }

    /**
     * {@code DELETE  /api/files} : Delete a file.
     *
     * @param url the URL of the file to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\") or hasAuthority(\"" + AuthoritiesConstants.EMPLOYEE + "\")")
    public ResponseEntity<Void> deleteFile(@RequestParam("url") String url) {
        LOG.debug("REST request to delete file with url : {}", url);
        fileStorageService.delete(url);
        return ResponseEntity.noContent().build();
    }
}
