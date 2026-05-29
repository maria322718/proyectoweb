package com.university.clinic.dto;

import lombok.*;

/**
 * Reporte de pacientes que no asistieron a sus citas.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoShowPatientResponse {
    private Long patientId;
    private String patientFullName;
    private String email;
    private String universityId;
    private long noShowCount;
}
