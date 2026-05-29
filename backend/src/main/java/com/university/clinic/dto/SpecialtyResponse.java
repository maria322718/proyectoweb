package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

/** DTO de salida para especialidades */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialtyResponse {
    private Long id;
    private String name;
    private Boolean active;
    private LocalDateTime createdAt;
}
