package com.university.clinic.entity;

/**
 * Estados posibles de una cita.
 * Equivalente a un Enum en PHP 8.1+ que usarías con $casts en Eloquent.
 *
 * Máquina de estados:
 *   SCHEDULED → CONFIRMED → COMPLETED
 *   SCHEDULED → CONFIRMED → NO_SHOW
 *   SCHEDULED → CANCELLED
 *   CONFIRMED → CANCELLED
 */
public enum AppointmentStatus {
    SCHEDULED,   // Recién creada
    CONFIRMED,   // Confirmada por el paciente/admin
    CANCELLED,   // Cancelada
    COMPLETED,   // Completada (el paciente asistió)
    NO_SHOW      // El paciente no se presentó
}
