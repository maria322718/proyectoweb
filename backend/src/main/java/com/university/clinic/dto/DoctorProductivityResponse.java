package com.university.clinic.dto;

import lombok.*;

/**
 * Reporte de productividad de un doctor.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProductivityResponse {
    private Long doctorId;
    private String doctorFullName;
    private String specialtyName;
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long noShowAppointments;
    private double completionRate;
}
