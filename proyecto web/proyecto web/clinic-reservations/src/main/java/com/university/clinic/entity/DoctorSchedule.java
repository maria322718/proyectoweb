package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Horario de atención de un doctor.
 * Ej: Dr. García atiende Lunes de 08:00 a 12:00 y Martes de 14:00 a 18:00.
 *
 * Un doctor puede tener MÚLTIPLES horarios (uno por bloque de día/hora).
 */
@Entity
@Table(name = "doctor_schedules")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /**
     * Día de la semana (MONDAY, TUESDAY, ..., SUNDAY).
     * En Java, DayOfWeek es un enum integrado — como Carbon::MONDAY en PHP.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    /** Hora de inicio del bloque (ej: 08:00) */
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /** Hora de fin del bloque (ej: 12:00) */
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
