package com.university.clinic.dto;

import lombok.*;

import java.util.Map;

/**
 * DTO para reportes operativos básicos.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {

    /** Total de citas en el rango */
    private long totalAppointments;

    /** Desglose por estado: {"SCHEDULED": 5, "CONFIRMED": 3, ...} */
    private Map<String, Long> countByStatus;

    /** Desglose por doctor: {"Dr. García": 4, "Dra. López": 6, ...} */
    private Map<String, Long> countByDoctor;
}
