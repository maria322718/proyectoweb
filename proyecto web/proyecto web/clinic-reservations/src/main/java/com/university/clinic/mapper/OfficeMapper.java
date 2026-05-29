package com.university.clinic.mapper;

import com.university.clinic.dto.OfficeResponse;
import com.university.clinic.entity.Office;
import org.springframework.stereotype.Component;

@Component
public class OfficeMapper {
    public OfficeResponse toResponse(Office office) {
        if (office == null) return null;
        return OfficeResponse.builder()
                .id(office.getId())
                .name(office.getName())
                .floor(office.getFloor())
                .status(office.getStatus())
                .createdAt(office.getCreatedAt())
                .build();
    }
}
