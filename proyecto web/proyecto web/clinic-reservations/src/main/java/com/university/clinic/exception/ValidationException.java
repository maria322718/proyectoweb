package com.university.clinic.exception;

/**
 * Se lanza cuando hay un error de validación personalizado
 * (no cubierto por las anotaciones de Bean Validation).
 * Ej: hora de inicio posterior a hora de fin, fecha inválida, etc.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
