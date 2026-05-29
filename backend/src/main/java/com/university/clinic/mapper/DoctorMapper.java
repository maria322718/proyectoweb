package com.university.clinic.mapper;

import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.entity.Doctor;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {
    public DoctorResponse toResponse(Doctor doctor) {
        if (doctor == null) return null;
        return DoctorResponse.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .specialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null)
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .licenseNumber(doctor.getLicenseNumber())
                .active(doctor.getActive())
                .createdAt(doctor.getCreatedAt())
                .build();
    }
}
