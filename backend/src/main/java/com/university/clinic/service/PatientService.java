package com.university.clinic.service;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.dto.UpdatePatientRequest;

import java.util.List;

public interface PatientService {
    List<PatientResponse> findAll();
    PatientResponse findById(Long id);
    PatientResponse create(CreatePatientRequest request);
    PatientResponse update(Long id, UpdatePatientRequest request);
}
