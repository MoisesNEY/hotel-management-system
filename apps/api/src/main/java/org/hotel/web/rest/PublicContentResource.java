package org.hotel.web.rest;

import org.hotel.domain.WebContent;
import org.hotel.repository.WebContentRepository;
import org.hotel.service.dto.WebContentDTO;
import org.hotel.service.mapper.WebContentMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/content")
public class PublicContentResource {

    private final Logger log = LoggerFactory.getLogger(PublicContentResource.class);
    private final WebContentRepository webContentRepository;
    private final WebContentMapper webContentMapper;
    private final org.hotel.repository.AssetCollectionRepository assetCollectionRepository;

    public PublicContentResource(
            WebContentRepository webContentRepository,
            WebContentMapper webContentMapper,
            org.hotel.repository.AssetCollectionRepository assetCollectionRepository) {
        this.webContentRepository = webContentRepository;
        this.webContentMapper = webContentMapper;
        this.assetCollectionRepository = assetCollectionRepository;
    }

    /**
     * GET /{code} : Ideal para CARRUSELES y GALERÍAS.
     * Ej: GET /api/public/content/HOME_GALLERY
     * Retorna: [ {img1}, {img2}, {img3} ]
     */
    @GetMapping("/{code}")
    public ResponseEntity<List<WebContentDTO>> getContentList(@PathVariable String code) {
        log.debug("REST request publico para lista de contenido: {}", code);
        List<WebContent> content = webContentRepository
                .findAllByCollectionCodeAndIsActiveTrueAndCollectionIsActiveTrueOrderBySortOrderAsc(code);
        return ResponseEntity.ok(webContentMapper.toDto(content));
    }

    /**
     * GET /{code}/single : Ideal para HERO, MAPAS, LOGOS.
     * Ej: GET /api/public/content/HOME_HERO/single
     * Retorna: { titulo: "Bienvenido", url: "..." } (Objeto directo, sin array)
     */
    @GetMapping("/{code}/single")
    public ResponseEntity<WebContentDTO> getSingleContent(@PathVariable String code) {
        log.debug("REST request publico para contenido unico: {}", code);
        Optional<WebContent> content = webContentRepository
                .findFirstByCollectionCodeAndIsActiveTrueAndCollectionIsActiveTrueOrderBySortOrderAsc(code);
        return content.map(webContentMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /status/{code} : Verifica si una sección está ACTIVA en el CMS.
     */
    @GetMapping("/status/{code}")
    public ResponseEntity<Boolean> getCollectionStatus(@PathVariable String code) {
        log.debug("REST request para verificar estado de coleccion: {}", code);
        return assetCollectionRepository
                .findByCode(code)
                .map(c -> c.getIsActive() != Boolean.FALSE)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(true)); // Si no existe, asumimos visible por defecto
    }
}
