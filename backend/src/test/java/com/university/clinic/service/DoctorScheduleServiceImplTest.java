package com.university.clinic.service;

import com.university.clinic.dto.CreateDoctorScheduleRequest;
import com.university.clinic.dto.DoctorScheduleResponse;
import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.DoctorSchedule;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.exception.ValidationException;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.mapper.DoctorScheduleMapper;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.DoctorScheduleRepository;
import com.university.clinic.service.impl.DoctorScheduleServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DoctorScheduleServiceImplTest {

    @Mock
    private DoctorScheduleRepository scheduleRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Spy
    private DoctorScheduleMapper scheduleMapper;

    @InjectMocks
    private DoctorScheduleServiceImpl scheduleService;

    @Test
    @DisplayName("Debe crear un horario cuando el doctor existe")
    void shouldCreateScheduleSuccessfully() {
        CreateDoctorScheduleRequest request = new CreateDoctorScheduleRequest();
        request.setDoctorId(1L);
        request.setDayOfWeek(DayOfWeek.MONDAY);
        request.setStartTime(LocalTime.of(8, 0));
        request.setEndTime(LocalTime.of(12, 0));

        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setFirstName("John");

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setId(10L);
        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(DayOfWeek.MONDAY);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.save(any(DoctorSchedule.class))).thenReturn(schedule);

        DoctorScheduleResponse response = scheduleService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        verify(scheduleRepository).save(any(DoctorSchedule.class));
    }

    @Test
    @DisplayName("Debe fallar al crear horario si el doctor no existe")
    void shouldFailWhenDoctorNotFound() {
        CreateDoctorScheduleRequest request = new CreateDoctorScheduleRequest();
        request.setDoctorId(99L);
        request.setStartTime(LocalTime.of(8, 0));
        request.setEndTime(LocalTime.of(12, 0));

        when(doctorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> scheduleService.create(request));
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe fallar al crear horario si inicio >= fin")
    void shouldFailWhenRangeInvalid() {
        CreateDoctorScheduleRequest request = new CreateDoctorScheduleRequest();
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(12, 0));

        assertThrows(ValidationException.class, () -> scheduleService.create(request));
        verify(doctorRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Debe fallar al crear horario si hay solapamiento")
    void shouldFailWhenOverlap() {
        CreateDoctorScheduleRequest request = new CreateDoctorScheduleRequest();
        request.setDoctorId(1L);
        request.setDayOfWeek(DayOfWeek.MONDAY);
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(14, 0));

        Doctor doctor = new Doctor();
        doctor.setId(1L);

        DoctorSchedule existing = new DoctorSchedule();
        existing.setId(5L);
        existing.setDoctor(doctor);
        existing.setDayOfWeek(DayOfWeek.MONDAY);
        existing.setStartTime(LocalTime.of(8, 0));
        existing.setEndTime(LocalTime.of(12, 0));

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(1L, DayOfWeek.MONDAY))
                .thenReturn(java.util.List.of(existing));

        assertThrows(ConflictException.class, () -> scheduleService.create(request));
        verify(scheduleRepository, never()).save(any());
    }
    @Test
    @DisplayName("Debe actualizar horario sin generar conflicto consigo mismo")
    void shouldUpdateWithoutSelfConflict() {
        CreateDoctorScheduleRequest request = new CreateDoctorScheduleRequest();
        request.setDoctorId(1L);
        request.setDayOfWeek(DayOfWeek.MONDAY);
        request.setStartTime(LocalTime.of(8, 0));
        request.setEndTime(LocalTime.of(12, 0));

        Doctor doctor = new Doctor();
        doctor.setId(1L);

        DoctorSchedule existing = new DoctorSchedule();
        existing.setId(5L);
        existing.setDoctor(doctor);
        existing.setDayOfWeek(DayOfWeek.MONDAY);
        existing.setStartTime(LocalTime.of(8, 0));
        existing.setEndTime(LocalTime.of(12, 0));

        when(scheduleRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(1L, DayOfWeek.MONDAY))
                .thenReturn(java.util.List.of(existing)); // Se devuelve a sí mismo
        when(scheduleRepository.save(any(DoctorSchedule.class))).thenReturn(existing);

        DoctorScheduleResponse response = scheduleService.update(5L, request);

        assertThat(response).isNotNull();
        verify(scheduleRepository).save(any(DoctorSchedule.class));
    }
}
