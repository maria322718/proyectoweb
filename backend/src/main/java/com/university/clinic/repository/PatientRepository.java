package com.university.clinic.repository;

import com.university.clinic.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByEmail(String email);

    boolean existsByUniversityId(String universityId);
}
