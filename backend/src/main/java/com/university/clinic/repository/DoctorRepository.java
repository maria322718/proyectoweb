package com.university.clinic.repository;

import com.university.clinic.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByLicenseNumber(String licenseNumber);

    List<Doctor> findBySpecialtyId(Long specialtyId);

    List<Doctor> findBySpecialtyIdAndActiveTrue(Long specialtyId);

    List<Doctor> findByActiveTrue();
}
