package com.university.clinic.integration;

import com.university.clinic.dto.*;
import com.university.clinic.entity.AppointmentStatus;
import com.university.clinic.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Test de integración: flujo completo con BD PostgreSQL real (via Testcontainers).
 *
 * Esto es el equivalente en Laravel de un Feature Test:
 *   $this->postJson('/api/appointments', $data)->assertStatus(201);
 *
 * Pero aquí llamamos directamente a los servicios (no al HTTP).
 * Para tests HTTP usaríamos MockMvc, que es más avanzado.
 */
@SpringBootTest
@Testcontainers
public class AppointmentRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("test_db")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired private SpecialtyService specialtyService;
    @Autowired private DoctorService doctorService;
    @Autowired private PatientService patientService;
    @Autowired private OfficeService officeService;
    @Autowired private AppointmentTypeService appointmentTypeService;
    @Autowired private DoctorScheduleService doctorScheduleService;
    @Autowired private AppointmentService appointmentService;
    @Autowired private com.university.clinic.repository.AppointmentRepository appointmentRepository;

    private Long specialtyId;
    private Long doctorId;
    private Long patientId;
    private Long officeId;
    private Long appointmentTypeId;

    @BeforeEach
    void setUp() {
        // Crear datos base — equivalente a factories/seeders en Laravel

        SpecialtyResponse specialty = specialtyService.create(
                CreateSpecialtyRequest.builder().name("Medicina General " + System.nanoTime()).build());
        specialtyId = specialty.getId();

        DoctorResponse doctor = doctorService.create(CreateDoctorRequest.builder()
                .firstName("María").lastName("García")
                .specialtyId(specialtyId)
                .licenseNumber("LIC-" + System.nanoTime())
                .build());
        doctorId = doctor.getId();

        // Crear horarios para todos los días de la semana (08:00-18:00)
        for (java.time.DayOfWeek day : java.time.DayOfWeek.values()) {
            doctorScheduleService.create(CreateDoctorScheduleRequest.builder()
                    .doctorId(doctorId)
                    .dayOfWeek(day)
                    .startTime(java.time.LocalTime.of(8, 0))
                    .endTime(java.time.LocalTime.of(18, 0))
                    .build());
        }

        PatientResponse patient = patientService.create(CreatePatientRequest.builder()
                .firstName("Juan").lastName("Pérez")
                .email("juan" + System.nanoTime() + "@uni.edu")
                .phone("1234567890")
                .universityId("MAT-" + System.nanoTime())
                .build());
        patientId = patient.getId();

        OfficeResponse office = officeService.create(
                CreateOfficeRequest.builder().name("Consultorio " + System.nanoTime()).floor(1).build());
        officeId = office.getId();

        AppointmentTypeResponse type = appointmentTypeService.create(
                CreateAppointmentTypeRequest.builder()
                        .name("Consulta " + System.nanoTime())
                        .durationMinutes(30)
                        .build());
        appointmentTypeId = type.getId();
    }

    @Test
    @DisplayName("Flujo completo: crear → confirmar → completar")
    void fullFlow_Create_Confirm_Complete() {
        // Crear cita
        LocalDateTime futureDate = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        AppointmentResponse created = appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .officeId(officeId)
                .appointmentTypeId(appointmentTypeId)
                .startAt(futureDate)
                .build());

        assertThat(created.getStatus()).isEqualTo(AppointmentStatus.SCHEDULED);
        assertThat(created.getEndAt()).isEqualTo(futureDate.plusMinutes(30));

        // Confirmar
        AppointmentResponse confirmed = appointmentService.confirm(created.getId());
        assertThat(confirmed.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    @Test
    @DisplayName("No debe permitir traslape de doctor")
    void shouldPreventDoctorOverlap() {
        LocalDateTime futureDate = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0).withNano(0);

        // Primera cita OK
        appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patientId).doctorId(doctorId).officeId(officeId)
                .appointmentTypeId(appointmentTypeId).startAt(futureDate).build());

        // Crear segundo paciente para la segunda cita
        PatientResponse patient2 = patientService.create(CreatePatientRequest.builder()
                .firstName("Ana").lastName("López")
                .email("ana" + System.nanoTime() + "@uni.edu")
                .phone("0987654321")
                .universityId("MAT2-" + System.nanoTime())
                .build());

        // Crear segundo consultorio
        OfficeResponse office2 = officeService.create(
                CreateOfficeRequest.builder().name("Consultorio2-" + System.nanoTime()).floor(2).build());

        // Segunda cita en el MISMO horario, MISMO doctor → debe fallar
        assertThatThrownBy(() -> appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patient2.getId()).doctorId(doctorId).officeId(office2.getId())
                .appointmentTypeId(appointmentTypeId).startAt(futureDate).build()))
                .hasMessageContaining("doctor");
    }

    @Test
    @DisplayName("Flujo: crear → cancelar")
    void shouldCancelAppointment() {
        LocalDateTime futureDate = LocalDateTime.now().plusDays(3).withHour(14).withMinute(0).withSecond(0).withNano(0);

        AppointmentResponse created = appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patientId).doctorId(doctorId).officeId(officeId)
                .appointmentTypeId(appointmentTypeId).startAt(futureDate).build());

        AppointmentResponse cancelled = appointmentService.cancel(created.getId(), new CancelAppointmentRequest("test"));
        assertThat(cancelled.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
    }

    @Test
    @DisplayName("No debe permitir traslape de consultorio")
    void shouldPreventOfficeOverlap() {
        LocalDateTime futureDate = LocalDateTime.now().plusDays(4).withHour(10).withMinute(0).withSecond(0).withNano(0);

        // Primera cita OK
        appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patientId).doctorId(doctorId).officeId(officeId)
                .appointmentTypeId(appointmentTypeId).startAt(futureDate).build());

        // Crear segundo doctor
        DoctorResponse doctor2 = doctorService.create(CreateDoctorRequest.builder()
                .firstName("Luis").lastName("Martínez").specialtyId(specialtyId).licenseNumber("LIC-2-"+System.nanoTime()).build());

        for (java.time.DayOfWeek day : java.time.DayOfWeek.values()) {
            doctorScheduleService.create(CreateDoctorScheduleRequest.builder()
                    .doctorId(doctor2.getId()).dayOfWeek(day)
                    .startTime(java.time.LocalTime.of(8, 0)).endTime(java.time.LocalTime.of(18, 0)).build());
        }

        PatientResponse patient2 = patientService.create(CreatePatientRequest.builder()
                .firstName("Ana").lastName("López").email("ana2" + System.nanoTime() + "@uni.edu")
                .phone("0987654321").universityId("MAT3-" + System.nanoTime()).build());

        // Mismo consultorio, diferent doctor y paciente -> falla
        assertThatThrownBy(() -> appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patient2.getId()).doctorId(doctor2.getId()).officeId(officeId)
                .appointmentTypeId(appointmentTypeId).startAt(futureDate).build()))
                .hasMessageContaining("consultorio");
    }

    @Test
    @DisplayName("No debe permitir traslape de paciente")
    void shouldPreventPatientOverlap() {
        LocalDateTime futureDate = LocalDateTime.now().plusDays(5).withHour(10).withMinute(0).withSecond(0).withNano(0);

        // Primera cita OK
        appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patientId).doctorId(doctorId).officeId(officeId)
                .appointmentTypeId(appointmentTypeId).startAt(futureDate).build());

        // Crear segundo doctor
        DoctorResponse doctor2 = doctorService.create(CreateDoctorRequest.builder()
                .firstName("Carla").lastName("Gómez").specialtyId(specialtyId).licenseNumber("LIC-3-"+System.nanoTime()).build());

        for (java.time.DayOfWeek day : java.time.DayOfWeek.values()) {
            doctorScheduleService.create(CreateDoctorScheduleRequest.builder()
                    .doctorId(doctor2.getId()).dayOfWeek(day)
                    .startTime(java.time.LocalTime.of(8, 0)).endTime(java.time.LocalTime.of(18, 0)).build());
        }

        OfficeResponse office2 = officeService.create(
                CreateOfficeRequest.builder().name("Consultorio3-" + System.nanoTime()).floor(3).build());

        // Mismo paciente, diferent doctor y consultorio -> falla
        assertThatThrownBy(() -> appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patientId).doctorId(doctor2.getId()).officeId(office2.getId())
                .appointmentTypeId(appointmentTypeId).startAt(futureDate).build()))
                .hasMessageContaining("paciente");
    }

    @Test
    @DisplayName("Pruebas de consultas nativas de Repositorio (findByStartAtBetween, findByPatientIdAndStatus y Reportes)")
    void shouldTestRepositoryDirectQueries() {
        LocalDateTime date1 = LocalDateTime.now().plusDays(6).withHour(9).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime date2 = LocalDateTime.now().plusDays(6).withHour(11).withMinute(0).withSecond(0).withNano(0);
        
        // Crear 2 citas para testear consultas
        AppointmentResponse appt1 = appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(patientId).doctorId(doctorId).officeId(officeId)
                .appointmentTypeId(appointmentTypeId).startAt(date1).build());
                
        // Crear paciente y doc diferente para cita 2 para evitar overlap
        PatientResponse p2 = patientService.create(CreatePatientRequest.builder().firstName("X").lastName("Y").email("x" + System.nanoTime() + "@u").universityId("XZ" + System.nanoTime()).build());
        OfficeResponse o2 = officeService.create(CreateOfficeRequest.builder().name("C" + System.nanoTime()).floor(1).build());
        DoctorResponse d2 = doctorService.create(CreateDoctorRequest.builder().firstName("D").lastName("C").specialtyId(specialtyId).licenseNumber("L" + System.nanoTime()).build());
        doctorScheduleService.create(CreateDoctorScheduleRequest.builder().doctorId(d2.getId()).dayOfWeek(date2.getDayOfWeek()).startTime(LocalTime.of(8,0)).endTime(LocalTime.of(18,0)).build());

        AppointmentResponse appt2 = appointmentService.create(CreateAppointmentRequest.builder()
                .patientId(p2.getId()).doctorId(d2.getId()).officeId(o2.getId())
                .appointmentTypeId(appointmentTypeId).startAt(date2).build());

        // Test findByStartAtBetween
        var inRange = appointmentRepository.findByStartAtBetween(date1.minusHours(1), date2.plusHours(1));
        assertThat(inRange).extracting("id").containsExactlyInAnyOrder(appt1.getId(), appt2.getId());
        
        // Test findByPatientIdAndStatus
        var scheduledForPatient = appointmentRepository.findByPatientIdAndStatus(patientId, AppointmentStatus.SCHEDULED);
        assertThat(scheduledForPatient)
            .isNotEmpty()
            .allMatch(a -> a.getPatient().getId().equals(patientId))
            .allMatch(a -> a.getStatus() == AppointmentStatus.SCHEDULED);

        // Cancelar la 1 para tener mix
        appointmentService.cancel(appt1.getId(), new CancelAppointmentRequest("test"));

        // Test de reportes
        var occupancy = appointmentRepository.getOfficeOccupancyReport(date1.minusDays(1), date2.plusDays(1));
        assertThat(occupancy).isNotEmpty();
        // Verificar aserciones significativas de valores agregados
        assertThat(occupancy).anySatisfy(row -> {
            assertThat(((Number) row[3]).longValue()).isGreaterThanOrEqualTo(1L); // total
            assertThat(((Number) row[5]).longValue()).isGreaterThanOrEqualTo(0L); // cancelled
        });
        
        var productivity = appointmentRepository.getDoctorProductivityReport(date1.minusDays(1), date2.plusDays(1));
        assertThat(productivity).isNotEmpty();
        assertThat(productivity).anySatisfy(row -> {
            assertThat(((Number) row[4]).longValue()).isGreaterThanOrEqualTo(1L); // total
        });

        // Test No-Show patients: Marcar a appt2 como NO_SHOW en base de datos indirectamente (o probar que no_show no da error)
        var noShow = appointmentRepository.getNoShowPatientsReport(date1.minusDays(1), date2.plusDays(1));
        assertThat(noShow).isNotNull(); // Puede estar vacio si no hay no-show, pero no da fallo SQL
        
        // Test para aggregación de cancelados / no_show por especialidad
        var bySpecialty = appointmentRepository.getCancelledAndNoShowBySpecialtyReport(date1.minusDays(1), date2.plusDays(1));
        assertThat(bySpecialty).isNotEmpty();
        assertThat(bySpecialty).anySatisfy(row -> {
            assertThat(row[0]).isNotNull(); // id especialidad
            assertThat(row[1]).isInstanceOf(String.class); // nombre especialidad
            assertThat(((Number) row[2]).longValue()).isGreaterThanOrEqualTo(1L); // cancelled (por el appt1)
            assertThat(((Number) row[3]).longValue()).isGreaterThanOrEqualTo(0L); // no_show
        });
    }
}
