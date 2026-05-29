package com.university.clinic.repository;

import com.university.clinic.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de Especialidades.
 * Equivalente a Specialty::query() en Eloquent.
 *
 * JpaRepository<Specialty, Long> = "esta clase maneja la entidad Specialty y su PK es Long".
 * Spring genera automáticamente: findAll(), findById(), save(), deleteById(), etc.
 */
@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {

    boolean existsByNameIgnoreCase(String name);
}
