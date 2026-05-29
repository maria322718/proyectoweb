package com.university.clinic.service;

import com.university.clinic.dto.CreateAppointmentRequest;
import com.university.clinic.dto.CancelAppointmentRequest;
import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.service.impl.AppointmentServiceImpl;
import com.university.clinic.entity.*;
import com.university.clinic.exception.BusinessException;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.*;
import com.university.clinic.mapper.AppointmentMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del AppointmentService.
 *
 * Usamos Mockito para simular los repositorios (en Laravel sería como
 * mockear los Models/Repositories en tests con Mockery).
 *
 * @ExtendWith(MockitoExtension.class) = activa Mockito (equivalente a setUp con
 * Mockery)
 * 
 * @Mock = crea un mock del repositorio (como Mockery::mock())
 * @InjectMocks = crea el servicio e inyecta los mocks automáticamente
 */
@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private OfficeRepository officeRepository;
    @Mock
    private AppointmentTypeRepository appointmentTypeRepository;
    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;
    @Spy
    private AppointmentMapper appointmentMapper;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    // Entidades de prueba reutilizables
    private Patient activePatient;
    private Doctor activeDoctor;
    private Office activeOffice;
    private AppointmentType activeType;
    private Specialty specialty;

    @BeforeEach
    void setUp() {
        specialty = new Specialty();
        specialty.setId(1L);
        specialty.setName("Medicina General");
        specialty.setActive(true);

        activePatient = new Patient();
        activePatient.setId(1L);
        activePatient.setFirstName("Juan");
        activePatient.setLastName("Pérez");
        activePatient.setStatus(PatientStatus.ACTIVE);

        activeDoctor = new Doctor();
        activeDoctor.setId(1L);
        activeDoctor.setFirstName("María");
        activeDoctor.setLastName("García");
        activeDoctor.setSpecialty(specialty);
        activeDoctor.setActive(true);

        activeOffice = new Office();
        activeOffice.setId(1L);
        activeOffice.setName("Consultorio 101");
        activeOffice.setStatus(OfficeStatus.ACTIVE);

        activeType = new AppointmentType();
        activeType.setId(1L);
        activeType.setName("Consulta General");
        activeType.setDurationMinutes(30);
        activeType.setActive(true);
    }

    // ==================== CREAR CITA ====================

    @Nested
    @DisplayName("Crear cita")
    class CreateAppointment {

        @Test
        @DisplayName("Debe crear cita exitosamente con datos válidos")
        void shouldCreateAppointmentSuccessfully() {
            // Arrange: preparar datos (como en Laravel: $this->actingAs(...))
            LocalDateTime futureDate = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(1L)
                    .doctorId(1L)
                    .officeId(1L)
                    .appointmentTypeId(1L)
                    .startAt(futureDate)
                    .build();

            when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(activeDoctor));
            when(officeRepository.findById(1L)).thenReturn(Optional.of(activeOffice));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(activeType));

            DoctorSchedule schedule = new DoctorSchedule();
            schedule.setStartTime(LocalTime.of(8, 0));
            schedule.setEndTime(LocalTime.of(14, 0));
            when(doctorScheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(anyLong(), any(DayOfWeek.class)))
                    .thenReturn(List.of(schedule));

            when(appointmentRepository.existsDoctorOverlap(anyLong(), any(), any())).thenReturn(false);
            when(appointmentRepository.existsOfficeOverlap(anyLong(), any(), any())).thenReturn(false);
            when(appointmentRepository.existsPatientOverlap(anyLong(), any(), any())).thenReturn(false);

            Appointment savedAppointment = new Appointment();
            savedAppointment.setId(1L);
            savedAppointment.setPatient(activePatient);
            savedAppointment.setDoctor(activeDoctor);
            savedAppointment.setOffice(activeOffice);
            savedAppointment.setAppointmentType(activeType);
            savedAppointment.setStartAt(futureDate);
            savedAppointment.setEndAt(futureDate.plusMinutes(30));
            savedAppointment.setStatus(AppointmentStatus.SCHEDULED);

            when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

            // Act
            AppointmentResponse response = appointmentService.create(request);

            // Assert (como PHPUnit assertEquals/assertNotNull)
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getStatus()).isEqualTo(AppointmentStatus.SCHEDULED);
            assertThat(response.getEndAt()).isEqualTo(futureDate.plusMinutes(30));
            verify(appointmentRepository).save(any(Appointment.class));
        }

        @Test
        @DisplayName("Debe rechazar cita si paciente no existe")
        void shouldRejectIfPatientNotFound() {
            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(999L)
                    .doctorId(1L)
                    .officeId(1L)
                    .appointmentTypeId(1L)
                    .startAt(LocalDateTime.now().plusDays(1))
                    .build();

            when(patientRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> appointmentService.create(request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Paciente");
        }

        @Test
        @DisplayName("Debe rechazar cita si doctor está inactivo")
        void shouldRejectIfDoctorInactive() {
            activeDoctor.setActive(false);

            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(1L)
                    .doctorId(1L)
                    .officeId(1L)
                    .appointmentTypeId(1L)
                    .startAt(LocalDateTime.now().plusDays(1))
                    .build();

            when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(activeDoctor));
            when(officeRepository.findById(1L)).thenReturn(Optional.of(activeOffice));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(activeType));

            assertThatThrownBy(() -> appointmentService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("inactivo");
        }

        @Test
        @DisplayName("Debe rechazar cita fuera del horario del doctor")
        void shouldRejectIfOutsideDoctorSchedule() {
            LocalDateTime futureDate = LocalDateTime.now().plusDays(1).withHour(6).withMinute(0);
            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(1L).doctorId(1L).officeId(1L).appointmentTypeId(1L)
                    .startAt(futureDate).build();

            when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(activeDoctor));
            when(officeRepository.findById(1L)).thenReturn(Optional.of(activeOffice));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(activeType));

            DoctorSchedule schedule = new DoctorSchedule();
            schedule.setStartTime(LocalTime.of(8, 0));
            schedule.setEndTime(LocalTime.of(14, 0));
            when(doctorScheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(anyLong(), any(DayOfWeek.class)))
                    .thenReturn(List.of(schedule));

            assertThatThrownBy(() -> appointmentService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("horario de atenci\u00f3n");
        }

        @Test
        @DisplayName("Debe rechazar cita en el pasado")
        void shouldRejectPastAppointment() {
            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(1L)
                    .doctorId(1L)
                    .officeId(1L)
                    .appointmentTypeId(1L)
                    .startAt(LocalDateTime.now().minusDays(1)) // ayer
                    .build();

            when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(activeDoctor));
            when(officeRepository.findById(1L)).thenReturn(Optional.of(activeOffice));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(activeType));

            // No necesita schedule mock — falla antes por fecha en el pasado
            assertThatThrownBy(() -> appointmentService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("pasado");
        }

        @Test
        @DisplayName("Debe rechazar cita si doctor tiene traslape")
        void shouldRejectDoctorOverlap() {
            LocalDateTime futureDate = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(1L).doctorId(1L).officeId(1L).appointmentTypeId(1L)
                    .startAt(futureDate).build();

            when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(activeDoctor));
            when(officeRepository.findById(1L)).thenReturn(Optional.of(activeOffice));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(activeType));

            DoctorSchedule schedule = new DoctorSchedule();
            schedule.setStartTime(LocalTime.of(8, 0));
            schedule.setEndTime(LocalTime.of(14, 0));
            when(doctorScheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(anyLong(), any(DayOfWeek.class)))
                    .thenReturn(List.of(schedule));

            when(appointmentRepository.existsDoctorOverlap(anyLong(), any(), any())).thenReturn(true);

            assertThatThrownBy(() -> appointmentService.create(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("doctor");
        }

        @Test
        @DisplayName("Debe rechazar cita si consultorio tiene traslape")
        void shouldRejectOfficeOverlap() {
            LocalDateTime futureDate = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(1L).doctorId(1L).officeId(1L).appointmentTypeId(1L)
                    .startAt(futureDate).build();

            when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(activeDoctor));
            when(officeRepository.findById(1L)).thenReturn(Optional.of(activeOffice));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(activeType));

            DoctorSchedule schedule = new DoctorSchedule();
            schedule.setStartTime(LocalTime.of(8, 0));
            schedule.setEndTime(LocalTime.of(14, 0));
            when(doctorScheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(anyLong(), any(DayOfWeek.class)))
                    .thenReturn(List.of(schedule));

            when(appointmentRepository.existsDoctorOverlap(anyLong(), any(), any())).thenReturn(false);
            when(appointmentRepository.existsOfficeOverlap(anyLong(), any(), any())).thenReturn(true);

            assertThatThrownBy(() -> appointmentService.create(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("consultorio");
        }

        @Test
        @DisplayName("Debe rechazar cita si paciente tiene traslape")
        void shouldRejectPatientOverlap() {
            LocalDateTime futureDate = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
            CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                    .patientId(1L).doctorId(1L).officeId(1L).appointmentTypeId(1L)
                    .startAt(futureDate).build();

            when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
            when(doctorRepository.findById(1L)).thenReturn(Optional.of(activeDoctor));
            when(officeRepository.findById(1L)).thenReturn(Optional.of(activeOffice));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(activeType));

            DoctorSchedule schedule = new DoctorSchedule();
            schedule.setStartTime(LocalTime.of(8, 0));
            schedule.setEndTime(LocalTime.of(14, 0));
            when(doctorScheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(anyLong(), any(DayOfWeek.class)))
                    .thenReturn(List.of(schedule));

            when(appointmentRepository.existsDoctorOverlap(anyLong(), any(), any())).thenReturn(false);
            when(appointmentRepository.existsOfficeOverlap(anyLong(), any(), any())).thenReturn(false);
            when(appointmentRepository.existsPatientOverlap(anyLong(), any(), any())).thenReturn(true);

            assertThatThrownBy(() -> appointmentService.create(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("paciente");
        }
    }

    // ==================== MÁQUINA DE ESTADOS ====================

    @Nested
    @DisplayName("Máquina de estados")
    class StateMachine {

        @Test
        @DisplayName("SCHEDULED → CONFIRMED debe funcionar")
        void shouldConfirmScheduled() {
            Appointment apt = buildAppointment(AppointmentStatus.SCHEDULED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));
            when(appointmentRepository.save(any())).thenReturn(apt);

            AppointmentResponse response = appointmentService.confirm(1L);
            assertThat(response.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        }

        @Test
        @DisplayName("CONFIRMED no puede pasar a CONFIRMED de nuevo")
        void shouldNotConfirmAlreadyConfirmed() {
            Appointment apt = buildAppointment(AppointmentStatus.CONFIRMED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));

            assertThatThrownBy(() -> appointmentService.confirm(1L))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("SCHEDULED → CANCELLED debe funcionar")
        void shouldCancelScheduled() {
            Appointment apt = buildAppointment(AppointmentStatus.SCHEDULED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));
            when(appointmentRepository.save(any())).thenReturn(apt);

            AppointmentResponse response = appointmentService.cancel(1L, new CancelAppointmentRequest("test"));
            assertThat(response.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
        }

        @Test
        @DisplayName("CONFIRMED → CANCELLED debe funcionar")
        void shouldCancelConfirmed() {
            Appointment apt = buildAppointment(AppointmentStatus.CONFIRMED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));
            when(appointmentRepository.save(any())).thenReturn(apt);

            AppointmentResponse response = appointmentService.cancel(1L, new CancelAppointmentRequest("test"));
            assertThat(response.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
        }

        @Test
        @DisplayName("COMPLETED no se puede cancelar")
        void shouldNotCancelCompleted() {
            Appointment apt = buildAppointment(AppointmentStatus.COMPLETED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));

            assertThatThrownBy(() -> appointmentService.cancel(1L, new CancelAppointmentRequest("test")))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("CONFIRMED → COMPLETED debe funcionar (si ya pasó la hora)")
        void shouldCompleteConfirmed() {
            Appointment apt = buildAppointment(AppointmentStatus.CONFIRMED);
            apt.setStartAt(LocalDateTime.now().minusHours(1)); // la cita ya empezó
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));
            when(appointmentRepository.save(any())).thenReturn(apt);

            AppointmentResponse response = appointmentService.complete(1L);
            assertThat(response.getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
        }

        @Test
        @DisplayName("No se puede completar antes de la hora de inicio")
        void shouldNotCompleteBeforeStartTime() {
            Appointment apt = buildAppointment(AppointmentStatus.CONFIRMED);
            apt.setStartAt(LocalDateTime.now().plusHours(2)); // la cita es en 2 horas
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));

            assertThatThrownBy(() -> appointmentService.complete(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("hora de inicio");
        }

        @Test
        @DisplayName("CONFIRMED → COMPLETED con observaciones debe adjuntarlas")
        void shouldCompleteWithNotes() {
            Appointment apt = buildAppointment(AppointmentStatus.CONFIRMED);
            apt.setStartAt(LocalDateTime.now().minusHours(1)); // ya empezó
            apt.setNotes("Nota inicial");
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));
            when(appointmentRepository.save(any())).thenReturn(apt);

            com.university.clinic.dto.CompleteAppointmentRequest request = 
                new com.university.clinic.dto.CompleteAppointmentRequest("Sin novedades mayores");

            AppointmentResponse response = appointmentService.complete(1L, request);
            
            assertThat(response.getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
            verify(appointmentRepository).save(argThat(a -> 
                a.getNotes().contains("Nota inicial\nObservaciones finales: Sin novedades mayores")
            ));
        }

        @Test
        @DisplayName("CONFIRMED → NO_SHOW debe funcionar (si ya pasó la hora)")
        void shouldNoShowConfirmed() {
            Appointment apt = buildAppointment(AppointmentStatus.CONFIRMED);
            apt.setStartAt(LocalDateTime.now().minusHours(1));
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));
            when(appointmentRepository.save(any())).thenReturn(apt);

            AppointmentResponse response = appointmentService.noShow(1L);
            assertThat(response.getStatus()).isEqualTo(AppointmentStatus.NO_SHOW);
        }

        @Test
        @DisplayName("SCHEDULED no puede pasar a COMPLETED")
        void shouldNotCompleteScheduled() {
            Appointment apt = buildAppointment(AppointmentStatus.SCHEDULED);
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(apt));

            assertThatThrownBy(() -> appointmentService.complete(1L))
                    .isInstanceOf(BusinessException.class);
        }
    }

    // ==================== HELPERS ====================

    private Appointment buildAppointment(AppointmentStatus status) {
        Appointment apt = new Appointment();
        apt.setId(1L);
        apt.setPatient(activePatient);
        apt.setDoctor(activeDoctor);
        apt.setOffice(activeOffice);
        apt.setAppointmentType(activeType);
        apt.setStartAt(LocalDateTime.now().plusDays(1));
        apt.setEndAt(LocalDateTime.now().plusDays(1).plusMinutes(30));
        apt.setStatus(status);
        return apt;
    }
}
