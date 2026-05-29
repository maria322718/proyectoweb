package com.university.clinic.exception;

/**
 * Se lanza cuando hay un conflicto de datos.
 * Ej: traslape de horario, duplicado de email/licencia, etc.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
