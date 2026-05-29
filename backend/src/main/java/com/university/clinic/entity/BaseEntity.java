package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Clase base para todas las entidades.
 * Equivalente a un Trait con $timestamps en Laravel.
 *
 * @MappedSuperclass = "esta clase NO es una tabla, pero sus hijos heredan estos campos".
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // autoincrement, como en migrations de Laravel
    private Long id;

    @CreationTimestamp // se llena automáticamente al insertar (como created_at en Laravel)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // se actualiza automáticamente al modificar (como updated_at en Laravel)
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
