package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Consultorio médico.
 */
@Entity
@Table(name = "offices")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Office extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OfficeStatus status = OfficeStatus.ACTIVE;
}
