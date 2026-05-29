package com.university.clinic.service;

import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.dto.CancelAppointmentRequest;
import com.university.clinic.dto.CreateAppointmentRequest;
import com.university.clinic.entity.AppointmentStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {
    List<AppointmentResponse> findAll();
    AppointmentResponse findById(Long id);
    List<AppointmentResponse> findByDoctorId(Long doctorId);
    List<AppointmentResponse> findByPatientId(Long patientId);
    List<AppointmentResponse> findByStatus(AppointmentStatus status);
    List<AppointmentResponse> findByDateRange(LocalDateTime from, LocalDateTime to);
    AppointmentResponse create(CreateAppointmentRequest request);
    AppointmentResponse confirm(Long id);
    AppointmentResponse cancel(Long id, CancelAppointmentRequest request);
    AppointmentResponse complete(Long id);
    AppointmentResponse complete(Long id, com.university.clinic.dto.CompleteAppointmentRequest request);
    AppointmentResponse noShow(Long id);
}
