package com.university.clinic.dto;

import com.university.clinic.entity.OfficeStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficeResponse {
    private Long id;
    private String name;
    private Integer floor;
    private OfficeStatus status;
    private LocalDateTime createdAt;
}
