package org.hotel.service.mapper;

import org.hotel.domain.AssetCollection;
import org.hotel.service.dto.AssetCollectionDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link AssetCollection} and its DTO {@link AssetCollectionDTO}.
 */
@Mapper(componentModel = "spring")
public interface AssetCollectionMapper extends EntityMapper<AssetCollectionDTO, AssetCollection> {}
