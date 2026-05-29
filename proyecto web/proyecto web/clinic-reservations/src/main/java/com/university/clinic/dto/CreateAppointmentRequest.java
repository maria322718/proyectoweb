package com.university.clinic.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAppointmentRequest {

    @NotNull(message = "El paciente es obligatorio")
    private Long patientId;

    @NotNull(message = "El doctor es obligatorio")
    private Long doctorId;

    @NotNull(message = "El consultorio es obligatorio")
    private Long officeId;

    @NotNull(message = "El tipo de cita es obligatorio")
    private Long appointmentTypeId;

    @NotNull(message = "La fecha/hora de inicio es obligatoria")
    private LocalDateTime startAt;

    @Size(max = 500, message = "Las notas no deben exceder 500 caracteres")
    private String notes;
}
