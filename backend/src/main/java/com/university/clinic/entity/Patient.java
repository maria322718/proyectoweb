package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Paciente (estudiante/personal universitario).
 */
@Entity
@Table(name = "patients")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    /** Matrícula o código universitario */
    @Column(name = "university_id", nullable = false, unique = true, length = 50)
    private String universityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PatientStatus status = PatientStatus.ACTIVE;
}
