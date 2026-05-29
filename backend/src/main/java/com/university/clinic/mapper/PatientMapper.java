package com.university.clinic.mapper;

import com.university.clinic.dto.PatientResponse;
import com.university.clinic.entity.Patient;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {
    public PatientResponse toResponse(Patient patient) {
        if (patient == null) return null;
        return PatientResponse.builder()
                .id(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .email(patient.getEmail())
                .phone(patient.getPhone())
                .universityId(patient.getUniversityId())
                .status(patient.getStatus())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}
