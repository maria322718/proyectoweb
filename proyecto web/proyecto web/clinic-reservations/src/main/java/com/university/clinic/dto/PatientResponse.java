package com.university.clinic.dto;

import com.university.clinic.entity.PatientStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String universityId;
    private PatientStatus status;
    private LocalDateTime createdAt;
}
