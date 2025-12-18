package org.hotel.service;

import org.hotel.config.ApplicationProperties;
import org.hotel.service.dto.StoredFileDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class S3FileStorageService implements FileStorageService {

    private final Logger log = LoggerFactory.getLogger(S3FileStorageService.class);

    private final S3Client s3Client;
    private final String bucketName;
    private final String region;
    private final String endpoint;

    public S3FileStorageService(S3Client s3Client, ApplicationProperties applicationProperties) {
        this.s3Client = s3Client;
        ApplicationProperties.S3 s3Properties = applicationProperties.getS3();
        this.bucketName = s3Properties.getBucket();
        this.region = s3Properties.getRegion();
        this.endpoint = s3Properties.getEndpoint();
        
        if (this.bucketName == null || this.bucketName.isEmpty()) {
            log.error("S3 bucket name is not configured!");
        }
    }

    @Override
    public String save(MultipartFile file) {
        return save(file, null);
    }

    @Override
    public String save(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Cannot save an empty or null file");
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        String key = (folderName != null && !folderName.isEmpty()) ? folderName + "/" + fileName : fileName;

        try {
            log.debug("Uploading file {} to bucket {} with key {}", originalFilename, bucketName, key);
            
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            return generateUrl(key);
        } catch (IOException | S3Exception e) {
            log.error("Error uploading file to S3: {}", e.getMessage());
            throw new FileStorageException("Error al subir el archivo a S3: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }
        String key = extractKey(imageUrl);
        log.debug("Deleting file from bucket {} with key {}", bucketName, key);
        
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
                
            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage());
            throw new FileStorageException("Error al eliminar el archivo de S3: " + e.getMessage(), e);
        }
    }

    @Override
    public String replace(String oldImageUrl, MultipartFile newFile) {
        String newUrl = save(newFile);
        if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
            try {
                delete(oldImageUrl);
            } catch (Exception e) {
                log.warn("Could not delete old file {}, but new file was uploaded to {}", oldImageUrl, newUrl);
            }
        }
        return newUrl;
    }

    @Override
    public List<StoredFileDTO> listFiles(String folderName) {
        String prefix = (folderName != null && !folderName.isEmpty()) ? folderName + "/" : "";
        
        try {
            ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(prefix)
                .build();

            ListObjectsV2Response result = s3Client.listObjectsV2(request);
            
            return result.contents().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        } catch (S3Exception e) {
            log.error("Error listing files from S3: {}", e.getMessage());
            throw new FileStorageException("Error al listar archivos de S3: " + e.getMessage(), e);
        }
    }

    @Override
    public List<StoredFileDTO> searchFiles(String folderName, String query) {
        List<StoredFileDTO> allFiles = listFiles(folderName);
        if (query == null || query.isEmpty()) {
            return allFiles;
        }
        String lowercaseQuery = query.toLowerCase();
        return allFiles.stream()
            .filter(file -> file.getName().toLowerCase().contains(lowercaseQuery))
            .collect(Collectors.toList());
    }

    private StoredFileDTO mapToDTO(S3Object s3Object) {
        StoredFileDTO dto = new StoredFileDTO();
        dto.setKey(s3Object.key());
        dto.setName(s3Object.key().contains("/") ? s3Object.key().substring(s3Object.key().lastIndexOf("/") + 1) : s3Object.key());
        dto.setUrl(generateUrl(s3Object.key()));
        dto.setSize(s3Object.size());
        dto.setLastModified(s3Object.lastModified());
        return dto;
    }

    private String generateUrl(String key) {
        if (endpoint != null && !endpoint.isEmpty()) {
            String base = endpoint.endsWith("/") ? endpoint : endpoint + "/";
            return base + bucketName + "/" + key;
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    private String extractKey(String url) {
        if (url == null || url.isEmpty()) return "";
        
        if (url.contains(bucketName)) {
            int bucketIndex = url.indexOf(bucketName);
            String afterBucket = url.substring(bucketIndex + bucketName.length());
            
            if (afterBucket.startsWith("/")) {
                return afterBucket.substring(1);
            } else if (afterBucket.contains("/")) {
                return afterBucket.substring(afterBucket.indexOf("/") + 1);
            }
        }
        
        return url.substring(url.lastIndexOf("/") + 1);
    }
}
