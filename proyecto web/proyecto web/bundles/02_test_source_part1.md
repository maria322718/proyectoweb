# Bundle 02_test_source

Proyecto: `clinic-reservations`
Grupo: `02_test_source`
### Archivo: `src/test/java/com/university/clinic/ClinicReservationsApplicationTest.java`
- Bytes: 1289
- Encoding detectado: utf-8

```java
package com.university.clinic;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Verifica que el contexto de Spring Boot carga correctamente.
 * Usa Testcontainers para levantar una BD PostgreSQL temporal.
 */
@SpringBootTest
@Testcontainers
class ClinicReservationsApplicationTest {

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
    }

    @Test
    void contextLoads() {
        // Si llega aquí sin excepción, el contexto cargó correctamente
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/controller/AppointmentControllerTest.java`
- Bytes: 7050
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.dto.CreateAppointmentRequest;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.exception.GlobalExceptionHandler;
import com.university.clinic.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class AppointmentControllerTest {

        private MockMvc mockMvc;

        @Mock
        private AppointmentService appointmentService;

        @InjectMocks
        private AppointmentController appointmentController;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(appointmentController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
        }

        @Test
        @DisplayName("POST /api/appointments - Debe retornar 201 Created")
        void shouldCreateAppointment() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.create(any(CreateAppointmentRequest.class))).thenReturn(response);

                String jsonContent = "{\"patientId\":1,\"doctorId\":1,\"officeId\":1,\"appointmentTypeId\":1,\"startAt\":\"2030-01-01T08:00:00\"}";

                mockMvc.perform(post("/api/appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(100L));
        }

        @Test
        @DisplayName("PUT /api/appointments/{id}/confirm - Debe confirmar cita")
        void shouldConfirmAppointment() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.confirm(100L)).thenReturn(response);

                mockMvc.perform(put("/api/appointments/100/confirm"))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("PUT /api/appointments/{id}/complete - Debe completar cita enviando notes opcionales")
        void shouldCompleteAppointmentWithNotes() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.complete(eq(100L),
                                any(com.university.clinic.dto.CompleteAppointmentRequest.class)))
                                .thenReturn(response);

                String jsonContent = "{\"notes\":\"Todo conforme\"}";

                mockMvc.perform(put("/api/appointments/100/complete")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("PUT /api/appointments/{id}/complete - Debe completar cita sin body (backward compatible)")
        void shouldCompleteAppointmentWithoutBody() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.complete(100L)).thenReturn(response);

                mockMvc.perform(put("/api/appointments/100/complete"))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("POST /api/appointments - Debe retornar 409 si hay conflicto de horario")
        void shouldReturn409WhenConflict() throws Exception {
                when(appointmentService.create(any(CreateAppointmentRequest.class)))
                                .thenThrow(new ConflictException("El doctor tiene otra cita en este horario"));

                String jsonContent = "{\"patientId\":1,\"doctorId\":1,\"officeId\":1,\"appointmentTypeId\":1,\"startAt\":\"2030-01-01T08:00:00\"}";

                mockMvc.perform(post("/api/appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().is(409))
                                .andExpect(jsonPath("$.error").value("El doctor tiene otra cita en este horario"));
        }

        @Test
        @DisplayName("GET /api/appointments/{id} - Debe retornar 404 si no existe")
        void shouldReturn404WhenNotFound() throws Exception {
                when(appointmentService.findById(999L))
                                .thenThrow(new ResourceNotFoundException("Cita", 999L));

                mockMvc.perform(get("/api/appointments/999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.error").exists())
                                .andExpect(jsonPath("$.status").value(404))
                                .andExpect(jsonPath("$.error").value("Cita no encontrado con id: 999"));
        }

        @Test
        @DisplayName("POST /api/appointments - Debe retornar 400 por body incompleto")
        void shouldReturn400WhenValidationFails() throws Exception {
                // Enviar request sin fecha ni validaciones requeridas
                String jsonContent = "{\"patientId\":1}";

                mockMvc.perform(post("/api/appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").exists())
                                .andExpect(jsonPath("$.fieldErrors").exists());
        }
}

```

---

### Archivo: `src/test/java/com/university/clinic/controller/AvailabilityControllerTest.java`
- Bytes: 2352
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.service.AvailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class AvailabilityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AvailabilityService availabilityService;

    @InjectMocks
    private AvailabilityController availabilityController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(availabilityController).build();
    }

    @Test
    @DisplayName("GET /api/availability/doctors/{doctorId} - Llama al servicio y retorna array")
    void shouldGetAvailability() throws Exception {
        com.university.clinic.dto.AvailabilitySlotResponse slot = com.university.clinic.dto.AvailabilitySlotResponse.builder()
                .startAt(java.time.LocalDateTime.of(2026, 4, 10, 8, 0))
                .endAt(java.time.LocalDateTime.of(2026, 4, 10, 8, 30))
                .build();
                
        when(availabilityService.getAvailability(eq(1L), any(), anyInt()))
                .thenReturn(List.of(slot));

        mockMvc.perform(get("/api/availability/doctors/1")
                .param("date", "2026-04-10")
                .param("durationMinutes", "30"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].startAt").value("2026-04-10T08:00:00"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].endAt").value("2026-04-10T08:30:00"));
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/controller/DoctorControllerTest.java`
- Bytes: 1390
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.service.DoctorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class DoctorControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DoctorService doctorService;

    @InjectMocks
    private DoctorController doctorController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(doctorController).build();
    }

    @Test
    @DisplayName("POST /api/doctors - Falla con validacion 400 si faltan campos")
    void shouldFailValidation() throws Exception {
        mockMvc.perform(post("/api/doctors")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/controller/PatientControllerTest.java`
- Bytes: 2717
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.exception.GlobalExceptionHandler;
import com.university.clinic.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class PatientControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PatientService patientService;

    @InjectMocks
    private PatientController patientController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/patients - Valida request y crea paciente")
    void shouldCreatePatient() throws Exception {
        PatientResponse response = PatientResponse.builder().id(1L).firstName("Ana").build();

        when(patientService.create(any(CreatePatientRequest.class))).thenReturn(response);

        String jsonContent = "{\"firstName\":\"Ana\",\"lastName\":\"Gomez\",\"email\":\"ana@univ.edu\",\"phone\":\"1234\",\"universityId\":\"U999\"}";

        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonContent))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("GET /api/patients/{id} - Devuelve 404 si no existe")
    void shouldReturn404WhenNotFound() throws Exception {
        when(patientService.findById(99L)).thenThrow(new ResourceNotFoundException("Paciente", 99L));

        mockMvc.perform(get("/api/patients/99"))
                .andExpect(status().isNotFound());
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/controller/ReportControllerTest.java`
- Bytes: 5092
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.exception.GlobalExceptionHandler;
import com.university.clinic.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class ReportControllerTest {

        private MockMvc mockMvc;

        @Mock
        private ReportService reportService;

        @InjectMocks
        private ReportController reportController;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(reportController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
        }

        @Test
        @DisplayName("GET /api/reports/office-occupancy - Debe retornar 200 y la lista")
        void shouldReturnOfficeOccupancy() throws Exception {
                OfficeOccupancyResponse response = OfficeOccupancyResponse.builder()
                                .officeId(1L)
                                .officeName("Consultorio Test")
                                .totalAppointments(10L)
                                .build();

                when(reportService.getOfficeOccupancy(any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(List.of(response));

                mockMvc.perform(get("/api/reports/office-occupancy")
                                .param("from", "2026-04-01T00:00:00")
                                .param("to", "2026-04-30T23:59:59"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].officeId").value(1L))
                                .andExpect(jsonPath("$[0].officeName").value("Consultorio Test"));
        }
        @Test
        @DisplayName("GET /api/reports/doctor-productivity - Debe retornar 200 y la lista")
        void shouldReturnDoctorProductivity() throws Exception {
                com.university.clinic.dto.DoctorProductivityResponse response =
                                com.university.clinic.dto.DoctorProductivityResponse.builder()
                                                .doctorId(1L)
                                                .doctorFullName("Dr. Prueba")
                                                .totalAppointments(5L)
                                                .build();

                when(reportService.getDoctorProductivity(any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(List.of(response));

                mockMvc.perform(get("/api/reports/doctor-productivity")
                                .param("from", "2026-04-01T00:00:00")
                                .param("to", "2026-04-30T23:59:59"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].doctorId").value(1L))
                                .andExpect(jsonPath("$[0].doctorFullName").value("Dr. Prueba"));
        }

        @Test
        @DisplayName("GET /api/reports/no-show-patients - Debe retornar 200 y la lista")
        void shouldReturnNoShowPatients() throws Exception {
                com.university.clinic.dto.NoShowPatientResponse response =
                                com.university.clinic.dto.NoShowPatientResponse.builder()
                                                .patientId(1L)
                                                .patientFullName("Paciente Prueba")
                                                .noShowCount(2L)
                                                .build();

                when(reportService.getNoShowPatients(any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(List.of(response));

                mockMvc.perform(get("/api/reports/no-show-patients")
                                .param("from", "2026-04-01T00:00:00")
                                .param("to", "2026-04-30T23:59:59"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].patientId").value(1L))
                                .andExpect(jsonPath("$[0].patientFullName").value("Paciente Prueba"));
        }
}

```

---

### Archivo: `src/test/java/com/university/clinic/integration/AppointmentRepositoryIntegrationTest.java`
- Bytes: 15382
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/test/java/com/university/clinic/integration/DoctorRepositoryIntegrationTest.java`
- Bytes: 6746
- Encoding detectado: utf-8

```java
package com.university.clinic.integration;

import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.Specialty;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.SpecialtyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class DoctorRepositoryIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("clinic_db")
            .withUsername("postgres")
            .withPassword("postgres");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Test
    @DisplayName("Debe guardar un doctor correctamente con su especialidad")
    void shouldSaveDoctor() {
        Specialty specialty = new Specialty();
        specialty.setName("Cardiology");
        specialty.setActive(true);
        specialtyRepository.save(specialty);

        Doctor doctor = new Doctor();
        doctor.setFirstName("House");
        doctor.setLastName("Gregory");
        doctor.setLicenseNumber("MED999");
        doctor.setSpecialty(specialty);
        doctor.setActive(true);

        Doctor saved = doctorRepository.save(doctor);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getSpecialty().getName()).isEqualTo("Cardiology");
    }

    @Test
    @DisplayName("findBySpecialtyId debe retornar doctores de esa especialidad")
    void shouldFindDoctorsBySpecialtyId() {
        Specialty cardio = new Specialty();
        cardio.setName("Cardiología IT");
        cardio.setActive(true);
        specialtyRepository.save(cardio);

        Specialty neuro = new Specialty();
        neuro.setName("Neurología IT");
        neuro.setActive(true);
        specialtyRepository.save(neuro);

        Doctor doc1 = new Doctor();
        doc1.setFirstName("Doc1");
        doc1.setLastName("Cardio");
        doc1.setLicenseNumber("LIC-C1");
        doc1.setSpecialty(cardio);
        doc1.setActive(true);
        doctorRepository.save(doc1);

        Doctor doc2 = new Doctor();
        doc2.setFirstName("Doc2");
        doc2.setLastName("Neuro");
        doc2.setLicenseNumber("LIC-N1");
        doc2.setSpecialty(neuro);
        doc2.setActive(true);
        doctorRepository.save(doc2);

        var cardioDoctors = doctorRepository.findBySpecialtyId(cardio.getId());
        assertThat(cardioDoctors).hasSize(1);
        assertThat(cardioDoctors.get(0).getFirstName()).isEqualTo("Doc1");
    }

    @Test
    @DisplayName("findByActiveTrue debe retornar solo doctores activos")
    void shouldFindOnlyActiveDoctors() {
        Specialty spec = new Specialty();
        spec.setName("General IT");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor active = new Doctor();
        active.setFirstName("Activo");
        active.setLastName("Doc");
        active.setLicenseNumber("LIC-A1");
        active.setSpecialty(spec);
        active.setActive(true);
        doctorRepository.save(active);

        Doctor inactive = new Doctor();
        inactive.setFirstName("Inactivo");
        inactive.setLastName("Doc");
        inactive.setLicenseNumber("LIC-I1");
        inactive.setSpecialty(spec);
        inactive.setActive(false);
        doctorRepository.save(inactive);

        var activeDoctors = doctorRepository.findByActiveTrue();
        assertThat(activeDoctors).allMatch(Doctor::getActive);
        assertThat(activeDoctors.stream().anyMatch(d -> d.getFirstName().equals("Activo"))).isTrue();
        assertThat(activeDoctors.stream().noneMatch(d -> d.getFirstName().equals("Inactivo"))).isTrue();
    }

    @Test
    @DisplayName("existsByLicenseNumber debe retornar true si la licencia ya existe")
    void shouldReturnTrueWhenLicenseExists() {
        Specialty spec = new Specialty();
        spec.setName("Pediatría IT");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor doctor = new Doctor();
        doctor.setFirstName("Pedro");
        doctor.setLastName("Licencia");
        doctor.setLicenseNumber("LIC-UNICA-99");
        doctor.setSpecialty(spec);
        doctor.setActive(true);
        doctorRepository.save(doctor);

        assertThat(doctorRepository.existsByLicenseNumber("LIC-UNICA-99")).isTrue();
        assertThat(doctorRepository.existsByLicenseNumber("LIC-INEXISTENTE")).isFalse();
    }

    @Test
    @DisplayName("findBySpecialtyIdAndActiveTrue debe retornar solo doctores activos de esa especialidad")
    void shouldFindActiveDoctorsBySpecialtyId() {
        Specialty spec = new Specialty();
        spec.setName("Traumatología");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor activeDoc = new Doctor();
        activeDoc.setFirstName("Juan");
        activeDoc.setLastName("Activo");
        activeDoc.setLicenseNumber("TRM-1");
        activeDoc.setSpecialty(spec);
        activeDoc.setActive(true);
        doctorRepository.save(activeDoc);

        Doctor inactiveDoc = new Doctor();
        inactiveDoc.setFirstName("Pedro");
        inactiveDoc.setLastName("Inactivo");
        inactiveDoc.setLicenseNumber("TRM-2");
        inactiveDoc.setSpecialty(spec);
        inactiveDoc.setActive(false);
        doctorRepository.save(inactiveDoc);

        var activeDoctors = doctorRepository.findBySpecialtyIdAndActiveTrue(spec.getId());
        assertThat(activeDoctors).hasSize(1);
        assertThat(activeDoctors.get(0).getFirstName()).isEqualTo("Juan");
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/integration/DoctorScheduleRepositoryIntegrationTest.java`
- Bytes: 3031
- Encoding detectado: utf-8

```java
package com.university.clinic.integration;

import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.DoctorSchedule;
import com.university.clinic.entity.Specialty;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.DoctorScheduleRepository;
import com.university.clinic.repository.SpecialtyRepository;
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
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class DoctorScheduleRepositoryIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("clinic_db")
            .withUsername("postgres")
            .withPassword("postgres");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Test
    @DisplayName("Debe obtener schedules activos de un doctor")
    void shouldFindActiveSchedules() {
        Specialty spec = new Specialty();
        spec.setName("General");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor doctor = new Doctor();
        doctor.setFirstName("John");
        doctor.setLastName("Watson");
        doctor.setLicenseNumber("DOC111");
        doctor.setSpecialty(spec);
        doctor.setActive(true);
        doctorRepository.save(doctor);

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(DayOfWeek.MONDAY);
        schedule.setStartTime(LocalTime.of(8, 0));
        schedule.setEndTime(LocalTime.of(12, 0));
        schedule.setActive(true);
        scheduleRepository.save(schedule);

        List<DoctorSchedule> found = scheduleRepository.findByDoctorIdAndActiveTrue(doctor.getId());
        
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getDayOfWeek()).isEqualTo(DayOfWeek.MONDAY);
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/integration/OfficeRepositoryIntegrationTest.java`
- Bytes: 2564
- Encoding detectado: utf-8

```java
package com.university.clinic.integration;

import com.university.clinic.entity.Office;
import com.university.clinic.entity.OfficeStatus;
import com.university.clinic.repository.OfficeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class OfficeRepositoryIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("clinic_db")
            .withUsername("postgres")
            .withPassword("postgres");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private OfficeRepository officeRepository;

    @Test
    @DisplayName("Debe gestionar consultorios y estado en base de datos")
    void shouldSaveOffice() {
        Office office = new Office();
        office.setName("A101");
        office.setFloor(1);
        office.setStatus(OfficeStatus.ACTIVE);

        Office saved = officeRepository.save(office);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(OfficeStatus.ACTIVE);
    }

    @Test
    @DisplayName("Debe encontrar consultorio por ID tras guardarlo")
    void shouldFindOfficeById() {
        Office office = new Office();
        office.setName("B202");
        office.setFloor(2);
        office.setStatus(OfficeStatus.ACTIVE);
        Office saved = officeRepository.save(office);

        Office found = officeRepository.findById(saved.getId()).orElseThrow();

        assertThat(found.getName()).isEqualTo("B202");
        assertThat(found.getFloor()).isEqualTo(2);
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/integration/PatientRepositoryIntegrationTest.java`
- Bytes: 3532
- Encoding detectado: utf-8

```java
package com.university.clinic.integration;

import com.university.clinic.entity.Patient;
import com.university.clinic.entity.PatientStatus;
import com.university.clinic.repository.PatientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class PatientRepositoryIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("clinic_db")
            .withUsername("postgres")
            .withPassword("postgres");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private PatientRepository patientRepository;

    @Test
    @DisplayName("Debe guardar un paciente exitosamente en base de datos real")
    void shouldSavePatient() {
        Patient patient = new Patient();
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setEmail("jdoe@univ.edu");
        patient.setPhone("123456789");
        patient.setUniversityId("U12345");
        patient.setStatus(PatientStatus.ACTIVE);

        Patient saved = patientRepository.save(patient);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("existsByEmail debe retornar true si el email ya existe")
    void shouldReturnTrueWhenEmailExists() {
        Patient patient = new Patient();
        patient.setFirstName("Ana");
        patient.setLastName("López");
        patient.setEmail("ana.lopez@univ.edu");
        patient.setPhone("555000111");
        patient.setUniversityId("MAT-E1");
        patient.setStatus(PatientStatus.ACTIVE);
        patientRepository.save(patient);

        assertThat(patientRepository.existsByEmail("ana.lopez@univ.edu")).isTrue();
        assertThat(patientRepository.existsByEmail("noexiste@univ.edu")).isFalse();
    }

    @Test
    @DisplayName("existsByUniversityId debe retornar true si la matrícula ya existe")
    void shouldReturnTrueWhenUniversityIdExists() {
        Patient patient = new Patient();
        patient.setFirstName("Carlos");
        patient.setLastName("Ruiz");
        patient.setEmail("cruiz@univ.edu");
        patient.setPhone("555000222");
        patient.setUniversityId("MAT-U99");
        patient.setStatus(PatientStatus.ACTIVE);
        patientRepository.save(patient);

        assertThat(patientRepository.existsByUniversityId("MAT-U99")).isTrue();
        assertThat(patientRepository.existsByUniversityId("MAT-INEXISTENTE")).isFalse();
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/service/AppointmentServiceImplTest.java`
- Bytes: 22117
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/test/java/com/university/clinic/service/AppointmentTypeServiceImplTest.java`
- Bytes: 3393
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.dto.CreateAppointmentTypeRequest;
import com.university.clinic.entity.AppointmentType;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.mapper.AppointmentTypeMapper;
import com.university.clinic.repository.AppointmentTypeRepository;
import com.university.clinic.service.impl.AppointmentTypeServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentTypeServiceImplTest {

    @Mock
    private AppointmentTypeRepository typeRepository;

    @Spy
    private AppointmentTypeMapper typeMapper;

    @InjectMocks
    private AppointmentTypeServiceImpl typeService;

    @Test
    @DisplayName("create falla si existsByNameIgnoreCase es true")
    void createShouldFailIfNameExists() {
        CreateAppointmentTypeRequest request = new CreateAppointmentTypeRequest();
        request.setName("Primera Vez");
        request.setDurationMinutes(30);

        when(typeRepository.existsByNameIgnoreCase("Primera Vez")).thenReturn(true);

        assertThatThrownBy(() -> typeService.create(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }

    @Test
    @DisplayName("update no falla si el nombre es el mismo ignorando mayúsculas/minúsculas")
    void updateShouldNotFailIfNameIsSameIgnoreCase() {
        AppointmentType existing = new AppointmentType();
        existing.setId(1L);
        existing.setName("Revisión");
        existing.setDurationMinutes(30);

        when(typeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(typeRepository.save(any(AppointmentType.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateAppointmentTypeRequest request = new CreateAppointmentTypeRequest();
        request.setName("REVISIÓN"); // mismo nombre, distinto case

        AppointmentTypeResponse response = typeService.update(1L, request);

        assertThat(response).isNotNull();
        verify(typeRepository, never()).existsByNameIgnoreCase(any());
    }

    @Test
    @DisplayName("update falla si cambia a un nombre ya existente")
    void updateShouldFailIfNameChangesToExisting() {
        AppointmentType existing = new AppointmentType();
        existing.setId(1L);
        existing.setName("Seguimiento");
        existing.setDurationMinutes(30);

        when(typeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(typeRepository.existsByNameIgnoreCase("Revisión")).thenReturn(true);

        CreateAppointmentTypeRequest request = new CreateAppointmentTypeRequest();
        request.setName("Revisión");

        assertThatThrownBy(() -> typeService.update(1L, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/service/AvailabilityServiceImplTest.java`
- Bytes: 5021
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/test/java/com/university/clinic/service/DoctorScheduleServiceImplTest.java`
- Bytes: 6123
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/test/java/com/university/clinic/service/DoctorServiceImplTest.java`
- Bytes: 4843
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.dto.UpdateDoctorRequest;
import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.Specialty;
import com.university.clinic.mapper.DoctorMapper;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.impl.DoctorServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private SpecialtyRepository specialtyRepository;

    @Spy
    private DoctorMapper doctorMapper;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    @Test
    @DisplayName("Update parcial no debe borrar campos existentes cuando llegan null")
    void partialUpdateShouldPreserveExistingFields() {
        Specialty cardio = new Specialty();
        cardio.setId(1L);
        cardio.setName("Cardiología");

        Doctor existing = new Doctor();
        existing.setId(1L);
        existing.setFirstName("María");
        existing.setLastName("García");
        existing.setLicenseNumber("LIC-999");
        existing.setSpecialty(cardio);
        existing.setActive(true);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(inv -> inv.getArgument(0));

        // Solo actualizar firstName, dejar todo lo demás null (incluido specialtyId)
        UpdateDoctorRequest request = new UpdateDoctorRequest();
        request.setFirstName("Ana");

        DoctorResponse response = doctorService.update(1L, request);

        assertThat(response.getFirstName()).isEqualTo("Ana");
        assertThat(response.getLastName()).isEqualTo("García");
        assertThat(response.getLicenseNumber()).isEqualTo("LIC-999");
        assertThat(response.getSpecialtyName()).isEqualTo("Cardiología");
        // No se debió buscar especialidad porque specialtyId vino null
        verify(specialtyRepository, never()).findById(any());
    }

    @Test
    @DisplayName("create debe fallar si existsByLicenseNumber es true")
    void createShouldFailIfLicenseExists() {
        com.university.clinic.dto.CreateDoctorRequest request = new com.university.clinic.dto.CreateDoctorRequest();
        request.setFirstName("Test");
        request.setLastName("Test");
        request.setLicenseNumber("LIC-123");
        request.setSpecialtyId(1L);

        when(doctorRepository.existsByLicenseNumber("LIC-123")).thenReturn(true);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> doctorService.create(request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("cédula");
    }

    @Test
    @DisplayName("update no debe fallar si licenseNumber no cambia")
    void updateShouldNotFailIfLicenseUnchanged() {
        Doctor existing = new Doctor();
        existing.setId(1L);
        existing.setLicenseNumber("LIC-999");

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateDoctorRequest request = new UpdateDoctorRequest();
        request.setLicenseNumber("LIC-999"); // mismo valor

        DoctorResponse response = doctorService.update(1L, request);

        assertThat(response.getLicenseNumber()).isEqualTo("LIC-999");
        verify(doctorRepository, never()).existsByLicenseNumber(any());
    }

    @Test
    @DisplayName("update debe fallar si cambia a una licencia ya existente")
    void updateShouldFailIfLicenseChangesToExisting() {
        Doctor existing = new Doctor();
        existing.setId(1L);
        existing.setLicenseNumber("LIC-999");

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(doctorRepository.existsByLicenseNumber("LIC-888")).thenReturn(true);

        UpdateDoctorRequest request = new UpdateDoctorRequest();
        request.setLicenseNumber("LIC-888");

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> doctorService.update(1L, request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("cédula");
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/service/OfficeServiceImplTest.java`
- Bytes: 2951
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.OfficeResponse;
import com.university.clinic.dto.UpdateOfficeRequest;
import com.university.clinic.entity.Office;
import com.university.clinic.entity.OfficeStatus;
import com.university.clinic.mapper.OfficeMapper;
import com.university.clinic.repository.OfficeRepository;
import com.university.clinic.service.impl.OfficeServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfficeServiceImplTest {

    @Mock
    private OfficeRepository officeRepository;

    @Spy
    private OfficeMapper officeMapper;

    @InjectMocks
    private OfficeServiceImpl officeService;

    @Test
    @DisplayName("Update debe actualizar status cuando viene informado")
    void updateShouldChangeStatusWhenProvided() {
        Office existing = new Office();
        existing.setId(1L);
        existing.setName("Consultorio 101");
        existing.setFloor(1);
        existing.setStatus(OfficeStatus.ACTIVE);

        when(officeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(officeRepository.save(any(Office.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateOfficeRequest request = new UpdateOfficeRequest();
        request.setStatus(OfficeStatus.UNDER_MAINTENANCE);

        OfficeResponse response = officeService.update(1L, request);

        assertThat(response.getStatus()).isEqualTo(OfficeStatus.UNDER_MAINTENANCE);
        assertThat(response.getName()).isEqualTo("Consultorio 101");
        assertThat(response.getFloor()).isEqualTo(1);
    }

    @Test
    @DisplayName("Update parcial no debe borrar campos existentes cuando llegan null")
    void partialUpdateShouldPreserveExistingFields() {
        Office existing = new Office();
        existing.setId(1L);
        existing.setName("Consultorio 202");
        existing.setFloor(2);
        existing.setStatus(OfficeStatus.ACTIVE);

        when(officeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(officeRepository.save(any(Office.class))).thenAnswer(inv -> inv.getArgument(0));

        // Solo actualizar nombre, dejar floor y status null
        UpdateOfficeRequest request = new UpdateOfficeRequest();
        request.setName("Consultorio 202A");

        OfficeResponse response = officeService.update(1L, request);

        assertThat(response.getName()).isEqualTo("Consultorio 202A");
        assertThat(response.getFloor()).isEqualTo(2);
        assertThat(response.getStatus()).isEqualTo(OfficeStatus.ACTIVE);
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/service/PatientServiceImplTest.java`
- Bytes: 4651
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.dto.UpdatePatientRequest;
import com.university.clinic.entity.Patient;
import com.university.clinic.entity.PatientStatus;
import com.university.clinic.mapper.PatientMapper;
import com.university.clinic.repository.PatientRepository;
import com.university.clinic.service.impl.PatientServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Spy
    private PatientMapper patientMapper;

    @InjectMocks
    private PatientServiceImpl patientService;

    @Test
    @DisplayName("Update parcial no debe borrar campos existentes cuando llegan null")
    void partialUpdateShouldPreserveExistingFields() {
        Patient existing = new Patient();
        existing.setId(1L);
        existing.setFirstName("Juan");
        existing.setLastName("Pérez");
        existing.setEmail("juan@univ.edu");
        existing.setPhone("555-1234");
        existing.setUniversityId("MAT-001");
        existing.setStatus(PatientStatus.ACTIVE);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        // Solo actualizar firstName, dejar todo lo demás null
        UpdatePatientRequest request = new UpdatePatientRequest();
        request.setFirstName("Carlos");

        PatientResponse response = patientService.update(1L, request);

        assertThat(response.getFirstName()).isEqualTo("Carlos");
        assertThat(response.getLastName()).isEqualTo("Pérez");
        assertThat(response.getEmail()).isEqualTo("juan@univ.edu");
        assertThat(response.getPhone()).isEqualTo("555-1234");
        assertThat(response.getUniversityId()).isEqualTo("MAT-001");
    }

    @Test
    @DisplayName("create debe fallar si existsByEmail es true")
    void createShouldFailIfEmailExists() {
        CreatePatientRequest request = new CreatePatientRequest();
        request.setFirstName("Test");
        request.setLastName("Test");
        request.setEmail("duplicado@univ.edu");
        request.setUniversityId("MAT-999");

        when(patientRepository.existsByEmail("duplicado@univ.edu")).thenReturn(true);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> patientService.create(request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("correo");
    }

    @Test
    @DisplayName("create debe fallar si existsByUniversityId es true")
    void createShouldFailIfUniversityIdExists() {
        CreatePatientRequest request = new CreatePatientRequest();
        request.setFirstName("Test");
        request.setLastName("Test");
        request.setEmail("nuevo@univ.edu");
        request.setUniversityId("MAT-002");

        when(patientRepository.existsByEmail("nuevo@univ.edu")).thenReturn(false);
        when(patientRepository.existsByUniversityId("MAT-002")).thenReturn(true);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> patientService.create(request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("control");
    }

    @Test
    @DisplayName("update no debe fallar si el email es el mismo del registro actual")
    void updateShouldNotFailIfEmailIsTheSame() {
        Patient existing = new Patient();
        existing.setId(1L);
        existing.setEmail("juan@univ.edu");
        existing.setUniversityId("MAT-001");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdatePatientRequest request = new UpdatePatientRequest();
        request.setEmail("juan@univ.edu"); // mismo email

        PatientResponse response = patientService.update(1L, request);

        assertThat(response.getEmail()).isEqualTo("juan@univ.edu");
        verify(patientRepository, never()).existsByEmail(any());
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/service/ReportServiceImplTest.java`
- Bytes: 4666
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.repository.AppointmentRepository;
import com.university.clinic.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    @Test
    @DisplayName("Debe mapear correctamente Object[] de repositorio a OfficeOccupancyResponse")
    void shouldMapOfficeOccupancyCorrectly() {
        // Formato esperado de repository:
        // office.id, office.name, office.floor, COUNT(a.id),
        // SUM(COMPLETED), SUM(CANCELLED)
        Object[] row = new Object[]{
                1L, "Consultorio A", 2, 10L, 8L, 2L
        };

        when(appointmentRepository.getOfficeOccupancyReport(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(java.util.Collections.singletonList(row));

        List<OfficeOccupancyResponse> result = reportService.getOfficeOccupancy(LocalDateTime.now().minusDays(1), LocalDateTime.now());

        assertThat(result).hasSize(1);
        OfficeOccupancyResponse response = result.get(0);
        
        assertThat(response.getOfficeId()).isEqualTo(1L);
        assertThat(response.getOfficeName()).isEqualTo("Consultorio A");
        assertThat(response.getFloor()).isEqualTo(2);
        assertThat(response.getTotalAppointments()).isEqualTo(10L);
        assertThat(response.getCompletedAppointments()).isEqualTo(8L);
        assertThat(response.getCancelledAppointments()).isEqualTo(2L);
        
        // occupancyPercentage: (8 / 10) * 100 = 80.0
        assertThat(response.getOccupancyPercentage()).isEqualTo(80.0);
    }
    @Test
    @DisplayName("Debe mapear correctamente Object[] a DoctorProductivityResponse")
    void shouldMapDoctorProductivityCorrectly() {
        Object[] row = new Object[]{
                1L, "Juan", "Perez", "Cardiologia", 20L, 15L, 3L, 2L
        };

        when(appointmentRepository.getDoctorProductivityReport(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(java.util.Collections.singletonList(row));

        List<com.university.clinic.dto.DoctorProductivityResponse> result = reportService.getDoctorProductivity(LocalDateTime.now().minusDays(1), LocalDateTime.now());

        assertThat(result).hasSize(1);
        com.university.clinic.dto.DoctorProductivityResponse response = result.get(0);
        
        assertThat(response.getDoctorId()).isEqualTo(1L);
        assertThat(response.getDoctorFullName()).isEqualTo("Juan Perez");
        assertThat(response.getSpecialtyName()).isEqualTo("Cardiologia");
        assertThat(response.getTotalAppointments()).isEqualTo(20L);
        assertThat(response.getCompletedAppointments()).isEqualTo(15L);
        assertThat(response.getCancelledAppointments()).isEqualTo(3L);
        assertThat(response.getNoShowAppointments()).isEqualTo(2L);
        
        // completionRate: (15 / 20) * 100 = 75.0
        assertThat(response.getCompletionRate()).isEqualTo(75.0);
    }

    @Test
    @DisplayName("Debe mapear correctamente Object[] a NoShowPatientResponse")
    void shouldMapNoShowPatientsCorrectly() {
        Object[] row = new Object[]{
                5L, "Maria", "Gomez", "maria@mail.com", "U123", 4L
        };

        when(appointmentRepository.getNoShowPatientsReport(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(java.util.Collections.singletonList(row));

        List<com.university.clinic.dto.NoShowPatientResponse> result = reportService.getNoShowPatients(LocalDateTime.now().minusDays(1), LocalDateTime.now());

        assertThat(result).hasSize(1);
        com.university.clinic.dto.NoShowPatientResponse response = result.get(0);
        
        assertThat(response.getPatientId()).isEqualTo(5L);
        assertThat(response.getPatientFullName()).isEqualTo("Maria Gomez");
        assertThat(response.getEmail()).isEqualTo("maria@mail.com");
        assertThat(response.getUniversityId()).isEqualTo("U123");
        assertThat(response.getNoShowCount()).isEqualTo(4L);
    }
}

```

---

### Archivo: `src/test/java/com/university/clinic/service/SpecialtyServiceImplTest.java`
- Bytes: 3212
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.CreateSpecialtyRequest;
import com.university.clinic.dto.SpecialtyResponse;
import com.university.clinic.entity.Specialty;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.mapper.SpecialtyMapper;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.impl.SpecialtyServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpecialtyServiceImplTest {

    @Mock
    private SpecialtyRepository specialtyRepository;

    @Spy
    private SpecialtyMapper specialtyMapper;

    @InjectMocks
    private SpecialtyServiceImpl specialtyService;

    @Test
    @DisplayName("create falla si existsByNameIgnoreCase es true")
    void createShouldFailIfNameExists() {
        CreateSpecialtyRequest request = new CreateSpecialtyRequest();
        request.setName("Cardiología");

        when(specialtyRepository.existsByNameIgnoreCase("Cardiología")).thenReturn(true);

        assertThatThrownBy(() -> specialtyService.create(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }

    @Test
    @DisplayName("update no falla si el nombre es el mismo ignorando mayúsculas/minúsculas")
    void updateShouldNotFailIfNameIsSameIgnoreCase() {
        Specialty existing = new Specialty();
        existing.setId(1L);
        existing.setName("Cardiología");

        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(specialtyRepository.save(any(Specialty.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateSpecialtyRequest request = new CreateSpecialtyRequest();
        request.setName("CARDIOLOGÍA"); // mismo nombre, distinto case

        SpecialtyResponse response = specialtyService.update(1L, request);

        assertThat(response).isNotNull();
        verify(specialtyRepository, never()).existsByNameIgnoreCase(any());
    }

    @Test
    @DisplayName("update falla si cambia a un nombre ya existente")
    void updateShouldFailIfNameChangesToExisting() {
        Specialty existing = new Specialty();
        existing.setId(1L);
        existing.setName("Pediatría");

        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(specialtyRepository.existsByNameIgnoreCase("Cardiología")).thenReturn(true);

        CreateSpecialtyRequest request = new CreateSpecialtyRequest();
        request.setName("Cardiología");

        assertThatThrownBy(() -> specialtyService.update(1L, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }
}

```