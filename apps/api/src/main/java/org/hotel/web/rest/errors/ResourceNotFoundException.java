package org.hotel.web.rest.errors;

public class ResourceNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(resourceName + " no encontrado con identificador: " + identifier);
    }
}

