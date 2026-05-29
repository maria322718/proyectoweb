package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Especialidad médica (ej: Medicina General, Odontología).
 * Equivalente a un Model simple en Laravel con: name, active.
 */
@Entity
@Table(name = "specialties")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Specialty extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
