package com.university.clinic.service.impl;

import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.dto.CancelAppointmentRequest;
import com.university.clinic.dto.CreateAppointmentRequest;
import com.university.clinic.entity.*;
import java.time.LocalTime;
import com.university.clinic.exception.BusinessException;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.*;
import com.university.clinic.service.AppointmentService;
import com.university.clinic.mapper.AppointmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final OfficeRepository officeRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentMapper appointmentMapper;

    @Override
    public List<AppointmentResponse> findAll() {
        return appointmentRepository.findAll().stream().map(appointmentMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse findById(Long id) {
        return appointmentMapper.toResponse(appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cita", id)));
    }

    @Override
    public List<AppointmentResponse> findByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream().map(appointmentMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> findByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream().map(appointmentMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> findByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status).stream().map(appointmentMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> findByDateRange(LocalDateTime from, LocalDateTime to) {
        return appointmentRepository.findByStartAtBetween(from, to).stream().map(appointmentMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse create(CreateAppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", request.getPatientId()));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", request.getDoctorId()));
        Office office = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultorio", request.getOfficeId()));
        AppointmentType type = appointmentTypeRepository.findById(request.getAppointmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de cita", request.getAppointmentTypeId()));

        if (patient.getStatus() != PatientStatus.ACTIVE) {
            throw new BusinessException("El paciente está inactivo");
        }
        if (!doctor.getActive()) {
            throw new BusinessException("El doctor está inactivo");
        }
        if (office.getStatus() != OfficeStatus.ACTIVE) {
            throw new BusinessException("El consultorio está inactivo");
        }
        if (request.getStartAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("La cita no puede estar en el pasado");
        }

        LocalDateTime startAt = request.getStartAt();
        LocalDateTime endAt = startAt.plusMinutes(type.getDurationMinutes());

        // Validar que la cita caiga dentro del horario activo del doctor
        LocalTime appointmentStartTime = startAt.toLocalTime();
        LocalTime appointmentEndTime = endAt.toLocalTime();
        List<DoctorSchedule> schedules = doctorScheduleRepository
                .findByDoctorIdAndDayOfWeekAndActiveTrue(doctor.getId(), startAt.getDayOfWeek());
        boolean withinSchedule = schedules.stream().anyMatch(s ->
                !appointmentStartTime.isBefore(s.getStartTime()) && !appointmentEndTime.isAfter(s.getEndTime()));
        if (!withinSchedule) {
            throw new BusinessException("La cita no cae dentro del horario de atención del doctor");
        }

        if (appointmentRepository.existsDoctorOverlap(doctor.getId(), startAt, endAt)) {
            throw new ConflictException("El doctor tiene otra cita en este horario");
        }
        if (appointmentRepository.existsOfficeOverlap(office.getId(), startAt, endAt)) {
            throw new ConflictException("El consultorio está ocupado en este horario");
        }
        if (appointmentRepository.existsPatientOverlap(patient.getId(), startAt, endAt)) {
            throw new ConflictException("El paciente tiene otra cita en este horario");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setOffice(office);
        appointment.setAppointmentType(type);
        appointment.setStartAt(startAt);
        appointment.setEndAt(endAt);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setNotes(request.getNotes());

        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse confirm(Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cita", id));
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BusinessException("Solo las citas SCHEDULED se pueden confirmar");
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse cancel(Long id, CancelAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cita", id));
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("No se puede cancelar una cita en estado " + appointment.getStatus());
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "Razón de cancelación: " + request.getReason());
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse complete(Long id) {
        return complete(id, null);
    }

    @Override
    public AppointmentResponse complete(Long id, com.university.clinic.dto.CompleteAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cita", id));
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Solo las citas CONFIRMED se pueden completar");
        }
        if (appointment.getStartAt().isAfter(LocalDateTime.now())) {
            throw new BusinessException("No se puede completar una cita antes de su hora de inicio");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        
        if (request != null && request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "Observaciones finales: " + request.getNotes());
        }
        
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse noShow(Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cita", id));
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Solo las citas CONFIRMED se pueden marcar como NO_SHOW");
        }
        if (appointment.getStartAt().isAfter(LocalDateTime.now())) {
            throw new BusinessException("No se puede marcar NO_SHOW antes de su hora de inicio");
        }
        appointment.setStatus(AppointmentStatus.NO_SHOW);
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }
}
