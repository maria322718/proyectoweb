package com.university.clinic.service.impl;

import com.university.clinic.dto.CreateDoctorScheduleRequest;
import com.university.clinic.dto.DoctorScheduleResponse;
import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.DoctorSchedule;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.exception.ValidationException;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.DoctorScheduleRepository;
import com.university.clinic.service.DoctorScheduleService;
import com.university.clinic.mapper.DoctorScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleMapper scheduleMapper;

    @Override
    public List<DoctorScheduleResponse> findAll() {
        return scheduleRepository.findAll().stream().map(scheduleMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<DoctorScheduleResponse> findByDoctorId(Long doctorId) {
        return scheduleRepository.findByDoctorIdAndActiveTrue(doctorId).stream().map(scheduleMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public DoctorScheduleResponse findById(Long id) {
        return scheduleMapper.toResponse(scheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Horario", id)));
    }

    @Override
    public DoctorScheduleResponse create(CreateDoctorScheduleRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ValidationException("La hora de inicio debe ser anterior a la hora de fin");
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", request.getDoctorId()));

        List<DoctorSchedule> existingSchedules = scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(request.getDoctorId(), request.getDayOfWeek());
        for (DoctorSchedule existing : existingSchedules) {
            if (request.getStartTime().isBefore(existing.getEndTime()) && request.getEndTime().isAfter(existing.getStartTime())) {
                throw new ConflictException("El horario se solapa con otro existente para este doctor en el mismo día");
            }
        }

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setActive(true);
        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    public DoctorScheduleResponse update(Long id, CreateDoctorScheduleRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ValidationException("La hora de inicio debe ser anterior a la hora de fin");
        }

        DoctorSchedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Horario", id));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", request.getDoctorId()));

        List<DoctorSchedule> existingSchedules = scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(request.getDoctorId(), request.getDayOfWeek());
        for (DoctorSchedule existing : existingSchedules) {
            if (existing.getId().equals(id)) continue;
            if (request.getStartTime().isBefore(existing.getEndTime()) && request.getEndTime().isAfter(existing.getStartTime())) {
                throw new ConflictException("El horario se solapa con otro existente para este doctor en el mismo día");
            }
        }

        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    public void delete(Long id) {
        DoctorSchedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Horario", id));
        schedule.setActive(false);
        scheduleRepository.save(schedule);
    }
}
