package com.university.clinic.exception;

/**
 * Se lanza cuando no se encuentra un recurso por su ID.
 * Equivalente a ModelNotFoundException en Laravel.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " no encontrado con id: " + id);
    }
}
