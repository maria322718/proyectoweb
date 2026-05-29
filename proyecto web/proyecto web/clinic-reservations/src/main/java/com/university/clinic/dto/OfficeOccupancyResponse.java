package com.university.clinic.dto;

import lombok.*;

/**
 * Reporte de ocupación de un consultorio.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficeOccupancyResponse {
    private Long officeId;
    private String officeName;
    private Integer floor;
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private double occupancyPercentage;
}
