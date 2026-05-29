package com.university.clinic.dto;

import com.university.clinic.entity.AppointmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientFullName;
    private Long doctorId;
    private String doctorFullName;
    private Long officeId;
    private String officeName;
    private Long appointmentTypeId;
    private String appointmentTypeName;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
}
