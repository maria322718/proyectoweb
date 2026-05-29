package com.university.clinic.exception;

/**
 * Se lanza cuando se viola una regla de negocio.
 * Ej: intentar completar una cita antes de su hora de inicio,
 * transiciones de estado inválidas, entidad inactiva, etc.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
