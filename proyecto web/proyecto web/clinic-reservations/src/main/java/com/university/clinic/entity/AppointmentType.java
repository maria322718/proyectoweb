package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Tipo de cita (ej: Consulta General, Revisión, Urgencia).
 * Define la duración estándar de la cita.
 */
@Entity
@Table(name = "appointment_types")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentType extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    /** Duración de la cita en minutos. El servidor usa esto para calcular endAt. */
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
