package com.university.clinic.repository;

import com.university.clinic.entity.AppointmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentTypeRepository extends JpaRepository<AppointmentType, Long> {

    boolean existsByNameIgnoreCase(String name);
}
