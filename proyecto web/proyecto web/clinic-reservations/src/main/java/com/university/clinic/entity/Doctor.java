package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Doctor.
 * Relación: Un doctor pertenece a una especialidad (belongsTo en Laravel).
 */
@Entity
@Table(name = "doctors")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    /**
     * @ManyToOne = belongsTo() en Eloquent.
     * @JoinColumn = la columna FK en ESTA tabla que apunta a specialties.id
     * FetchType.LAZY = no carga la especialidad hasta que la necesites (mejor rendimiento)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(name = "license_number", nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
