package com.university.clinic.service.impl;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.dto.UpdatePatientRequest;
import com.university.clinic.entity.Patient;
import com.university.clinic.entity.PatientStatus;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.PatientRepository;
import com.university.clinic.service.PatientService;
import com.university.clinic.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Override
    public List<PatientResponse> findAll() {
        return patientRepository.findAll().stream().map(patientMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public PatientResponse findById(Long id) {
        return patientMapper.toResponse(patientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Paciente", id)));
    }

    @Override
    public PatientResponse create(CreatePatientRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este correo electrónico");
        }
        if (patientRepository.existsByUniversityId(request.getUniversityId())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este número de control");
        }
        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setUniversityId(request.getUniversityId());
        patient.setStatus(PatientStatus.ACTIVE);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Override
    public PatientResponse update(Long id, UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Paciente", id));
        if (request.getFirstName() != null) patient.setFirstName(request.getFirstName());
        if (request.getLastName() != null) patient.setLastName(request.getLastName());
        if (request.getEmail() != null && !request.getEmail().equals(patient.getEmail())) {
            if (patientRepository.existsByEmail(request.getEmail())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este correo electrónico");
            }
            patient.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) patient.setPhone(request.getPhone());
        if (request.getUniversityId() != null && !request.getUniversityId().equals(patient.getUniversityId())) {
            if (patientRepository.existsByUniversityId(request.getUniversityId())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este número de control");
            }
            patient.setUniversityId(request.getUniversityId());
        }
        return patientMapper.toResponse(patientRepository.save(patient));
    }
}
