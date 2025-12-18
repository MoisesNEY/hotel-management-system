package org.hotel.service.mapper;

import static org.hotel.domain.WebContentAsserts.*;
import static org.hotel.domain.WebContentTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class WebContentMapperTest {

    private WebContentMapper webContentMapper;

    @BeforeEach
    void setUp() {
        webContentMapper = new WebContentMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getWebContentSample1();
        var actual = webContentMapper.toEntity(webContentMapper.toDto(expected));
        assertWebContentAllPropertiesEquals(expected, actual);
    }
}
