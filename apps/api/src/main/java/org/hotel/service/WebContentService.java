package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.WebContent;
import org.hotel.repository.WebContentRepository;
import org.hotel.service.dto.WebContentDTO;
import org.hotel.service.mapper.WebContentMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.WebContent}.
 */
@Service
@Transactional
public class WebContentService {

    private static final Logger LOG = LoggerFactory.getLogger(WebContentService.class);

    private final WebContentRepository webContentRepository;

    private final WebContentMapper webContentMapper;

    public WebContentService(WebContentRepository webContentRepository, WebContentMapper webContentMapper) {
        this.webContentRepository = webContentRepository;
        this.webContentMapper = webContentMapper;
    }

    /**
     * Save a webContent.
     *
     * @param webContentDTO the entity to save.
     * @return the persisted entity.
     */
    public WebContentDTO save(WebContentDTO webContentDTO) {
        LOG.debug("Request to save WebContent : {}", webContentDTO);
        WebContent webContent = webContentMapper.toEntity(webContentDTO);
        webContent = webContentRepository.save(webContent);
        return webContentMapper.toDto(webContent);
    }

    /**
     * Update a webContent.
     *
     * @param webContentDTO the entity to save.
     * @return the persisted entity.
     */
    public WebContentDTO update(WebContentDTO webContentDTO) {
        LOG.debug("Request to update WebContent : {}", webContentDTO);
        WebContent webContent = webContentMapper.toEntity(webContentDTO);
        webContent = webContentRepository.save(webContent);
        return webContentMapper.toDto(webContent);
    }

    /**
     * Partially update a webContent.
     *
     * @param webContentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<WebContentDTO> partialUpdate(WebContentDTO webContentDTO) {
        LOG.debug("Request to partially update WebContent : {}", webContentDTO);

        return webContentRepository
            .findById(webContentDTO.getId())
            .map(existingWebContent -> {
                webContentMapper.partialUpdate(existingWebContent, webContentDTO);

                return existingWebContent;
            })
            .map(webContentRepository::save)
            .map(webContentMapper::toDto);
    }

    /**
     * Get all the webContents with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<WebContentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return webContentRepository.findAllWithEagerRelationships(pageable).map(webContentMapper::toDto);
    }

    /**
     * Get one webContent by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<WebContentDTO> findOne(Long id) {
        LOG.debug("Request to get WebContent : {}", id);
        return webContentRepository.findOneWithEagerRelationships(id).map(webContentMapper::toDto);
    }

    /**
     * Delete the webContent by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete WebContent : {}", id);
        webContentRepository.deleteById(id);
    }
}
