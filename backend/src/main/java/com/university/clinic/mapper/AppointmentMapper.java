package com.university.clinic.mapper;

import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.entity.Appointment;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {
    public AppointmentResponse toResponse(Appointment appointment) {
        if (appointment == null) return null;
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getId() : null)
                .patientFullName(appointment.getPatient() != null ? appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .doctorFullName(appointment.getDoctor() != null ? appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName() : null)
                .officeId(appointment.getOffice() != null ? appointment.getOffice().getId() : null)
                .officeName(appointment.getOffice() != null ? appointment.getOffice().getName() : null)
                .appointmentTypeId(appointment.getAppointmentType() != null ? appointment.getAppointmentType().getId() : null)
                .appointmentTypeName(appointment.getAppointmentType() != null ? appointment.getAppointmentType().getName() : null)
                .startAt(appointment.getStartAt())
                .endAt(appointment.getEndAt())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
