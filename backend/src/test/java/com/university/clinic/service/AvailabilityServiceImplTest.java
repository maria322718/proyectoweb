package com.university.clinic.service;

import com.university.clinic.dto.AvailabilitySlotResponse;
import com.university.clinic.entity.*;
import com.university.clinic.service.impl.AvailabilityServiceImpl;
import com.university.clinic.repository.AppointmentRepository;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceImplTest {

    @Mock private DoctorRepository doctorRepository;
    @Mock private DoctorScheduleRepository scheduleRepository;
    @Mock private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AvailabilityServiceImpl availabilityService;

    @Test
    @DisplayName("Debe devolver slots completos si no hay citas")
    void shouldReturnFullSlotsWhenNoAppointments() {
        // Doctor con horario de 08:00 a 12:00 un lunes
        LocalDate monday = LocalDate.of(2026, 4, 6); // un lunes

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setStartTime(LocalTime.of(8, 0));
        schedule.setEndTime(LocalTime.of(12, 0));

        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(1L, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule));
        when(appointmentRepository.findActiveDoctorAppointments(eq(1L), any(), any()))
                .thenReturn(List.of()); // sin citas

        List<AvailabilitySlotResponse> slots = availabilityService.getAvailability(1L, monday, 30);

        // 4 horas / 30 min = 8 slots
        assertThat(slots).hasSize(8);
        assertThat(slots.get(0).getStartAt()).isEqualTo(monday.atTime(8, 0));
        assertThat(slots.get(7).getEndAt()).isEqualTo(monday.atTime(12, 0));
    }

    @Test
    @DisplayName("Debe excluir slots ocupados por citas existentes")
    void shouldExcludeOccupiedSlots() {
        LocalDate monday = LocalDate.of(2026, 4, 6);

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setStartTime(LocalTime.of(8, 0));
        schedule.setEndTime(LocalTime.of(10, 0));

        // Cita existente de 08:30 a 09:00
        Patient patient = new Patient();
        patient.setId(1L);
        patient.setFirstName("Test");
        patient.setLastName("Patient");

        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setFirstName("Test");
        doctor.setLastName("Doctor");
        Specialty sp = new Specialty();
        sp.setId(1L);
        sp.setName("General");
        doctor.setSpecialty(sp);

        Office office = new Office();
        office.setId(1L);
        office.setName("101");

        AppointmentType type = new AppointmentType();
        type.setId(1L);
        type.setName("Consulta");

        Appointment existingApt = new Appointment();
        existingApt.setPatient(patient);
        existingApt.setDoctor(doctor);
        existingApt.setOffice(office);
        existingApt.setAppointmentType(type);
        existingApt.setStartAt(monday.atTime(8, 30));
        existingApt.setEndAt(monday.atTime(9, 0));
        existingApt.setStatus(AppointmentStatus.CONFIRMED);

        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(1L, DayOfWeek.MONDAY))
                .thenReturn(List.of(schedule));
        when(appointmentRepository.findActiveDoctorAppointments(eq(1L), any(), any()))
                .thenReturn(List.of(existingApt));

        List<AvailabilitySlotResponse> slots = availabilityService.getAvailability(1L, monday, 30);

        // Bloque de 08:00-10:00 con cita de 08:30-09:00
        // Slot libre: 09:00-09:30, 09:30-10:00 (2 slots de 30 min)
        // El slot 08:00-08:30 cabe pero no toca la cita, así que está libre también
        // Pero dado el gap 08:00-08:30 (solo 30 min), sí cabe un slot
        // Gaps: 08:00-08:30 (1 slot), 09:00-10:00 (2 slots) = 3 slots
        assertThat(slots).hasSize(3);
    }

    @Test
    @DisplayName("Debe devolver lista vacía si el doctor no atiende ese día")
    void shouldReturnEmptyIfNoDoctorSchedule() {
        LocalDate tuesday = LocalDate.of(2026, 4, 7);

        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(1L, DayOfWeek.TUESDAY))
                .thenReturn(List.of()); // no atiende martes

        List<AvailabilitySlotResponse> slots = availabilityService.getAvailability(1L, tuesday, 30);

        assertThat(slots).isEmpty();
    }
}
