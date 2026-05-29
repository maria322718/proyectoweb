package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentTypeResponse {
    private Long id;
    private String name;
    private Integer durationMinutes;
    private Boolean active;
    private LocalDateTime createdAt;
}
