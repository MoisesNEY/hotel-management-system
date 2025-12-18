package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.AssetCollection;
import org.hotel.repository.AssetCollectionRepository;
import org.hotel.service.dto.AssetCollectionDTO;
import org.hotel.service.mapper.AssetCollectionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.AssetCollection}.
 */
@Service
@Transactional
public class AssetCollectionService {

    private static final Logger LOG = LoggerFactory.getLogger(AssetCollectionService.class);

    private final AssetCollectionRepository assetCollectionRepository;

    private final AssetCollectionMapper assetCollectionMapper;

    public AssetCollectionService(AssetCollectionRepository assetCollectionRepository, AssetCollectionMapper assetCollectionMapper) {
        this.assetCollectionRepository = assetCollectionRepository;
        this.assetCollectionMapper = assetCollectionMapper;
    }

    /**
     * Save a assetCollection.
     *
     * @param assetCollectionDTO the entity to save.
     * @return the persisted entity.
     */
    public AssetCollectionDTO save(AssetCollectionDTO assetCollectionDTO) {
        LOG.debug("Request to save AssetCollection : {}", assetCollectionDTO);
        AssetCollection assetCollection = assetCollectionMapper.toEntity(assetCollectionDTO);
        assetCollection = assetCollectionRepository.save(assetCollection);
        return assetCollectionMapper.toDto(assetCollection);
    }

    /**
     * Update a assetCollection.
     *
     * @param assetCollectionDTO the entity to save.
     * @return the persisted entity.
     */
    public AssetCollectionDTO update(AssetCollectionDTO assetCollectionDTO) {
        LOG.debug("Request to update AssetCollection : {}", assetCollectionDTO);
        AssetCollection assetCollection = assetCollectionMapper.toEntity(assetCollectionDTO);
        assetCollection = assetCollectionRepository.save(assetCollection);
        return assetCollectionMapper.toDto(assetCollection);
    }

    /**
     * Partially update a assetCollection.
     *
     * @param assetCollectionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AssetCollectionDTO> partialUpdate(AssetCollectionDTO assetCollectionDTO) {
        LOG.debug("Request to partially update AssetCollection : {}", assetCollectionDTO);

        return assetCollectionRepository
            .findById(assetCollectionDTO.getId())
            .map(existingAssetCollection -> {
                assetCollectionMapper.partialUpdate(existingAssetCollection, assetCollectionDTO);

                return existingAssetCollection;
            })
            .map(assetCollectionRepository::save)
            .map(assetCollectionMapper::toDto);
    }

    /**
     * Get one assetCollection by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AssetCollectionDTO> findOne(Long id) {
        LOG.debug("Request to get AssetCollection : {}", id);
        return assetCollectionRepository.findById(id).map(assetCollectionMapper::toDto);
    }

    /**
     * Delete the assetCollection by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete AssetCollection : {}", id);
        assetCollectionRepository.deleteById(id);
    }
}
