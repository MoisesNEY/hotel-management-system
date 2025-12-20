package org.hotel.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class StoredFileDTO implements Serializable {

    private String name;
    private String url;
    private Long size;
    private Instant lastModified;
    private String contentType;
    private String key;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public Instant getLastModified() {
        return lastModified;
    }

    public void setLastModified(Instant lastModified) {
        this.lastModified = lastModified;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    @Override
    public String toString() {
        return "StoredFileDTO{" +
            "name='" + name + '\'' +
            ", url='" + url + '\'' +
            ", size=" + size +
            ", lastModified=" + lastModified +
            ", contentType='" + contentType + '\'' +
            ", key='" + key + '\'' +
            '}';
    }
}
