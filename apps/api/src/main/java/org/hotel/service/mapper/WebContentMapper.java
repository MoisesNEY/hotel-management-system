package org.hotel.service.mapper;

import org.hotel.domain.AssetCollection;
import org.hotel.domain.WebContent;
import org.hotel.service.dto.AssetCollectionDTO;
import org.hotel.service.dto.WebContentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link WebContent} and its DTO {@link WebContentDTO}.
 */
@Mapper(componentModel = "spring")
public interface WebContentMapper extends EntityMapper<WebContentDTO, WebContent> {
    @Mapping(target = "collection", source = "collection", qualifiedByName = "assetCollectionName")
    WebContentDTO toDto(WebContent s);

    @Named("assetCollectionName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    AssetCollectionDTO toDtoAssetCollectionName(AssetCollection assetCollection);
}
