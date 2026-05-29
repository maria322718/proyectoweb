package com.university.clinic.service;

import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.dto.CreateAppointmentTypeRequest;

import java.util.List;

public interface AppointmentTypeService {
    List<AppointmentTypeResponse> findAll();
    AppointmentTypeResponse findById(Long id);
    AppointmentTypeResponse create(CreateAppointmentTypeRequest request);
    AppointmentTypeResponse update(Long id, CreateAppointmentTypeRequest request);
}
