package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String specialtyName;
    private Long specialtyId;
    private String licenseNumber;
    private Boolean active;
    private LocalDateTime createdAt;
}
