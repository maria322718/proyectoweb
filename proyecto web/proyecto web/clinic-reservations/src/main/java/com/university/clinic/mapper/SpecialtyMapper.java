package com.university.clinic.mapper;

import com.university.clinic.dto.SpecialtyResponse;
import com.university.clinic.entity.Specialty;
import org.springframework.stereotype.Component;

@Component
public class SpecialtyMapper {
    public SpecialtyResponse toResponse(Specialty specialty) {
        if (specialty == null) return null;
        return SpecialtyResponse.builder()
                .id(specialty.getId())
                .name(specialty.getName())
                .active(specialty.getActive())
                .createdAt(specialty.getCreatedAt())
                .build();
    }
}
