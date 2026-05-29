package com.university.clinic.service;

import com.university.clinic.dto.CreateDoctorRequest;
import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.dto.UpdateDoctorRequest;

import java.util.List;

public interface DoctorService {
    List<DoctorResponse> findAll();
    DoctorResponse findById(Long id);
    DoctorResponse create(CreateDoctorRequest request);
    DoctorResponse update(Long id, UpdateDoctorRequest request);
}
