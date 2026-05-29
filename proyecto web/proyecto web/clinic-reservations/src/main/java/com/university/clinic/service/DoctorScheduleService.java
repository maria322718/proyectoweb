package com.university.clinic.service;

import com.university.clinic.dto.CreateDoctorScheduleRequest;
import com.university.clinic.dto.DoctorScheduleResponse;

import java.util.List;

public interface DoctorScheduleService {
    List<DoctorScheduleResponse> findAll();
    List<DoctorScheduleResponse> findByDoctorId(Long doctorId);
    DoctorScheduleResponse findById(Long id);
    DoctorScheduleResponse create(CreateDoctorScheduleRequest request);
    DoctorScheduleResponse update(Long id, CreateDoctorScheduleRequest request);
    void delete(Long id);
}
