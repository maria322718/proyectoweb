package com.university.clinic.service.impl;

import com.university.clinic.dto.CreateDoctorRequest;
import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.dto.UpdateDoctorRequest;
import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.Specialty;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.DoctorService;
import com.university.clinic.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorMapper doctorMapper;

    @Override
    public List<DoctorResponse> findAll() {
        return doctorRepository.findAll().stream().map(doctorMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public DoctorResponse findById(Long id) {
        return doctorMapper.toResponse(doctorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor", id)));
    }

    @Override
    public DoctorResponse create(CreateDoctorRequest request) {
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un doctor con esta cédula");
        }
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad", request.getSpecialtyId()));
        Doctor doctor = new Doctor();
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setSpecialty(specialty);
        doctor.setActive(true);
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    public DoctorResponse update(Long id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
        if (request.getFirstName() != null) doctor.setFirstName(request.getFirstName());
        if (request.getLastName() != null) doctor.setLastName(request.getLastName());
        if (request.getLicenseNumber() != null && !request.getLicenseNumber().equals(doctor.getLicenseNumber())) {
            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un doctor con esta cédula");
            }
            doctor.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getSpecialtyId() != null) {
            Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Especialidad", request.getSpecialtyId()));
            doctor.setSpecialty(specialty);
        }
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }
}
