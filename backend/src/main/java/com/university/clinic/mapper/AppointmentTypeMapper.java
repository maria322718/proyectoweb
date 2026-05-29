package com.university.clinic.mapper;

import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.entity.AppointmentType;
import org.springframework.stereotype.Component;

@Component
public class AppointmentTypeMapper {
    public AppointmentTypeResponse toResponse(AppointmentType type) {
        if (type == null) return null;
        return AppointmentTypeResponse.builder()
                .id(type.getId())
                .name(type.getName())
                .durationMinutes(type.getDurationMinutes())
                .active(type.getActive())
                .createdAt(type.getCreatedAt())
                .build();
    }
}
