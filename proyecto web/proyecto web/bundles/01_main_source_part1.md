# Bundle 01_main_source

Proyecto: `clinic-reservations`
Grupo: `01_main_source`
### Archivo: `src/main/java/com/university/clinic/ClinicReservationsApplication.java`
- Bytes: 691
- Encoding detectado: utf-8

```java
package com.university.clinic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicación.
 * Equivalente a "public/index.php" + "bootstrap/app.php" en Laravel.
 *
 * @SpringBootApplication combina:
 *  - @Configuration  (como config/app.php)
 *  - @EnableAutoConfiguration (auto-configura JPA, Web, etc.)
 *  - @ComponentScan (busca @Controller, @Service, @Repository en este paquete)
 */
@SpringBootApplication
public class ClinicReservationsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicReservationsApplication.class, args);
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/AppointmentController.java`
- Bytes: 4657
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreateAppointmentRequest;
import com.university.clinic.dto.CancelAppointmentRequest;
import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.entity.AppointmentStatus;
import com.university.clinic.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller de Citas — el más complejo.
 *
 * Incluye:
 * - CRUD básico
 * - Endpoints de transición de estado (confirm, cancel, complete, no-show)
 * - Filtros por doctor, paciente, estado y rango de fechas
 *
 * Los endpoints PUT para cambiar estado siguen el patrón:
 * PUT /api/appointments/{id}/confirm
 * PUT /api/appointments/{id}/cancel
 * etc.
 *
 * Usamos PUT para las transiciones de estado.
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ==================== CONSULTAS ====================

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> findAll() {
        return ResponseEntity.ok(appointmentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    /** GET /api/appointments?doctorId=1 */
    @GetMapping(params = "doctorId")
    public ResponseEntity<List<AppointmentResponse>> findByDoctorId(@RequestParam Long doctorId) {
        return ResponseEntity.ok(appointmentService.findByDoctorId(doctorId));
    }

    /** GET /api/appointments?patientId=1 */
    @GetMapping(params = "patientId")
    public ResponseEntity<List<AppointmentResponse>> findByPatientId(@RequestParam Long patientId) {
        return ResponseEntity.ok(appointmentService.findByPatientId(patientId));
    }

    /** GET /api/appointments?status=SCHEDULED */
    @GetMapping(params = "status")
    public ResponseEntity<List<AppointmentResponse>> findByStatus(@RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.findByStatus(status));
    }

    /** GET /api/appointments?from=2026-04-01T00:00:00&to=2026-04-30T23:59:59 */
    @GetMapping(params = { "from", "to" })
    public ResponseEntity<List<AppointmentResponse>> findByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(appointmentService.findByDateRange(from, to));
    }

    // ==================== CREAR ====================

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody CreateAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.create(request));
    }

    // ==================== TRANSICIONES DE ESTADO ====================

    /** PUT /api/appointments/{id}/confirm → SCHEDULED → CONFIRMED */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<AppointmentResponse> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.confirm(id));
    }

    /** PUT /api/appointments/{id}/cancel → SCHEDULED|CONFIRMED → CANCELLED */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancel(@PathVariable Long id,
            @Valid @RequestBody CancelAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.cancel(id, request));
    }

    /** PUT /api/appointments/{id}/complete → CONFIRMED → COMPLETED */
    @PutMapping("/{id}/complete")
    public ResponseEntity<AppointmentResponse> complete(
            @PathVariable Long id,
            @RequestBody(required = false) com.university.clinic.dto.CompleteAppointmentRequest request) {
        if (request == null) {
            return ResponseEntity.ok(appointmentService.complete(id));
        }
        return ResponseEntity.ok(appointmentService.complete(id, request));
    }

    /** PUT /api/appointments/{id}/no-show → CONFIRMED → NO_SHOW */
    @PutMapping("/{id}/no-show")
    public ResponseEntity<AppointmentResponse> noShow(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.noShow(id));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/AppointmentTypeController.java`
- Bytes: 1559
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreateAppointmentTypeRequest;
import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.service.AppointmentTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment-types")
@RequiredArgsConstructor
public class AppointmentTypeController {

    private final AppointmentTypeService appointmentTypeService;

    @GetMapping
    public ResponseEntity<List<AppointmentTypeResponse>> findAll() {
        return ResponseEntity.ok(appointmentTypeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentTypeResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentTypeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AppointmentTypeResponse> create(@Valid @RequestBody CreateAppointmentTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentTypeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentTypeResponse> update(@PathVariable Long id,
                                                           @Valid @RequestBody CreateAppointmentTypeRequest request) {
        return ResponseEntity.ok(appointmentTypeService.update(id, request));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/AvailabilityController.java`
- Bytes: 1250
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.AvailabilitySlotResponse;
import com.university.clinic.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller de Disponibilidad.
 *
 * Endpoint: GET /api/availability?doctorId=1&date=2026-04-15&durationMinutes=30
 *
 * En Laravel sería algo como:
 *   Route::get('availability', [AvailabilityController::class, 'index']);
 */
@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<List<AvailabilitySlotResponse>> getAvailability(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "30") int durationMinutes) {

        return ResponseEntity.ok(availabilityService.getAvailability(doctorId, date, durationMinutes));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/DoctorController.java`
- Bytes: 1450
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreateDoctorRequest;
import com.university.clinic.dto.UpdateDoctorRequest;
import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> findAll() {
        return ResponseEntity.ok(doctorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DoctorResponse> create(@Valid @RequestBody CreateDoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateDoctorRequest request) {
        return ResponseEntity.ok(doctorService.update(id, request));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/DoctorScheduleController.java`
- Bytes: 1217
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreateDoctorScheduleRequest;
import com.university.clinic.dto.DoctorScheduleResponse;
import com.university.clinic.service.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors/{doctorId}/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<DoctorScheduleResponse>> findByDoctorId(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.findByDoctorId(doctorId));
    }

    @PostMapping
    public ResponseEntity<DoctorScheduleResponse> create(@PathVariable Long doctorId,
                                                         @Valid @RequestBody CreateDoctorScheduleRequest request) {
        request.setDoctorId(doctorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.create(request));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/OfficeController.java`
- Bytes: 1450
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreateOfficeRequest;
import com.university.clinic.dto.UpdateOfficeRequest;
import com.university.clinic.dto.OfficeResponse;
import com.university.clinic.service.OfficeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offices")
@RequiredArgsConstructor
public class OfficeController {

    private final OfficeService officeService;

    @GetMapping
    public ResponseEntity<List<OfficeResponse>> findAll() {
        return ResponseEntity.ok(officeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficeResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(officeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<OfficeResponse> create(@Valid @RequestBody CreateOfficeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(officeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfficeResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateOfficeRequest request) {
        return ResponseEntity.ok(officeService.update(id, request));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/PatientController.java`
- Bytes: 1469
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.UpdatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientResponse>> findAll() {
        return ResponseEntity.ok(patientService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PatientResponse> create(@Valid @RequestBody CreatePatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdatePatientRequest request) {
        return ResponseEntity.ok(patientService.update(id, request));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/ReportController.java`
- Bytes: 2141
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.DoctorProductivityResponse;
import com.university.clinic.dto.NoShowPatientResponse;
import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.dto.ReportResponse;
import com.university.clinic.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller de Reportes.
 *
 * GET /api/reports?from=2026-04-01T00:00:00&to=2026-04-30T23:59:59
 *
 * Devuelve un resumen con:
 * - Total de citas en el rango
 * - Desglose por estado
 * - Desglose por doctor
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/office-occupancy")
    public ResponseEntity<List<OfficeOccupancyResponse>> getOfficeOccupancy(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(reportService.getOfficeOccupancy(from, to));
    }

    @GetMapping("/doctor-productivity")
    public ResponseEntity<List<DoctorProductivityResponse>> getDoctorProductivity(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(reportService.getDoctorProductivity(from, to));
    }

    @GetMapping("/no-show-patients")
    public ResponseEntity<List<NoShowPatientResponse>> getNoShowPatients(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(reportService.getNoShowPatients(from, to));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/controller/SpecialtyController.java`
- Bytes: 2234
- Encoding detectado: utf-8

```java
package com.university.clinic.controller;

import com.university.clinic.dto.CreateSpecialtyRequest;
import com.university.clinic.dto.SpecialtyResponse;
import com.university.clinic.service.SpecialtyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de Especialidades.
 *
 * Equivalente a un Resource Controller en Laravel:
 *   Route::apiResource('specialties', SpecialtyController::class);
 *
 * @RestController = @Controller + @ResponseBody (siempre devuelve JSON, nunca vistas).
 * @RequestMapping = prefijo de ruta, como Route::prefix('api/specialties').
 */
@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    /** GET /api/specialties — equivalente a index() en Laravel */
    @GetMapping
    public ResponseEntity<List<SpecialtyResponse>> findAll() {
        return ResponseEntity.ok(specialtyService.findAll());
    }

    /** GET /api/specialties/{id} — equivalente a show($id) */
    @GetMapping("/{id}")
    public ResponseEntity<SpecialtyResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(specialtyService.findById(id));
    }

    /**
     * POST /api/specialties — equivalente a store(Request $request)
     * @Valid = ejecuta las validaciones del DTO (como FormRequest)
     * @RequestBody = "parsea el JSON del body y conviértelo a este objeto"
     */
    @PostMapping
    public ResponseEntity<SpecialtyResponse> create(@Valid @RequestBody CreateSpecialtyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(specialtyService.create(request));
    }

    /** PUT /api/specialties/{id} — equivalente a update(Request $request, $id) */
    @PutMapping("/{id}")
    public ResponseEntity<SpecialtyResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody CreateSpecialtyRequest request) {
        return ResponseEntity.ok(specialtyService.update(id, request));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/AppointmentResponse.java`
- Bytes: 693
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import com.university.clinic.entity.AppointmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientFullName;
    private Long doctorId;
    private String doctorFullName;
    private Long officeId;
    private String officeName;
    private Long appointmentTypeId;
    private String appointmentTypeName;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/AppointmentTypeResponse.java`
- Bytes: 340
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentTypeResponse {
    private Long id;
    private String name;
    private Integer durationMinutes;
    private Boolean active;
    private LocalDateTime createdAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/AvailabilitySlotResponse.java`
- Bytes: 331
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Representa un slot de tiempo disponible para agendar cita.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlotResponse {
    private LocalDateTime startAt;
    private LocalDateTime endAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CancelAppointmentRequest.java`
- Bytes: 509
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO para cancelar una cita. Permite especificar un motivo de cancelación.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelAppointmentRequest {

    @NotBlank(message = "El motivo de cancelación es obligatorio")
    @Size(max = 500, message = "El motivo no debe exceder 500 caracteres")
    private String reason;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CompleteAppointmentRequest.java`
- Bytes: 271
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteAppointmentRequest {
    private String notes;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CreateAppointmentRequest.java`
- Bytes: 827
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAppointmentRequest {

    @NotNull(message = "El paciente es obligatorio")
    private Long patientId;

    @NotNull(message = "El doctor es obligatorio")
    private Long doctorId;

    @NotNull(message = "El consultorio es obligatorio")
    private Long officeId;

    @NotNull(message = "El tipo de cita es obligatorio")
    private Long appointmentTypeId;

    @NotNull(message = "La fecha/hora de inicio es obligatoria")
    private LocalDateTime startAt;

    @Size(max = 500, message = "Las notas no deben exceder 500 caracteres")
    private String notes;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CreateAppointmentTypeRequest.java`
- Bytes: 603
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAppointmentTypeRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String name;

    @NotNull(message = "La duración es obligatoria")
    @Min(value = 1, message = "La duración mínima es 1 minuto")
    private Integer durationMinutes;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CreateDoctorRequest.java`
- Bytes: 711
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDoctorRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    private String lastName;

    @NotNull(message = "La especialidad es obligatoria")
    private Long specialtyId;

    @NotBlank(message = "El número de licencia es obligatorio")
    @Size(max = 50)
    private String licenseNumber;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CreateDoctorScheduleRequest.java`
- Bytes: 623
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDoctorScheduleRequest {

    @NotNull(message = "El doctor es obligatorio")
    private Long doctorId;

    @NotNull(message = "El día de la semana es obligatorio")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime endTime;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CreateOfficeRequest.java`
- Bytes: 469
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOfficeRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50)
    private String name;

    @NotNull(message = "El piso es obligatorio")
    private Integer floor;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CreatePatientRequest.java`
- Bytes: 822
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePatientRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String phone;

    @NotBlank(message = "La matrícula universitaria es obligatoria")
    @Size(max = 50)
    private String universityId;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/CreateSpecialtyRequest.java`
- Bytes: 403
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSpecialtyRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no debe exceder 100 caracteres")
    private String name;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/DoctorProductivityResponse.java`
- Bytes: 496
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

/**
 * Reporte de productividad de un doctor.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProductivityResponse {
    private Long doctorId;
    private String doctorFullName;
    private String specialtyName;
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long noShowAppointments;
    private double completionRate;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/DoctorResponse.java`
- Bytes: 426
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String specialtyName;
    private Long specialtyId;
    private String licenseNumber;
    private Boolean active;
    private LocalDateTime createdAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/DoctorScheduleResponse.java`
- Bytes: 492
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorScheduleResponse {
    private Long id;
    private Long doctorId;
    private String doctorFullName;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean active;
    private LocalDateTime createdAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/NoShowPatientResponse.java`
- Bytes: 373
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

/**
 * Reporte de pacientes que no asistieron a sus citas.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoShowPatientResponse {
    private Long patientId;
    private String patientFullName;
    private String email;
    private String universityId;
    private long noShowCount;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/OfficeOccupancyResponse.java`
- Bytes: 452
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

/**
 * Reporte de ocupación de un consultorio.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficeOccupancyResponse {
    private Long officeId;
    private String officeName;
    private Integer floor;
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private double occupancyPercentage;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/OfficeResponse.java`
- Bytes: 376
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import com.university.clinic.entity.OfficeStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficeResponse {
    private Long id;
    private String name;
    private Integer floor;
    private OfficeStatus status;
    private LocalDateTime createdAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/PatientResponse.java`
- Bytes: 471
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import com.university.clinic.entity.PatientStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String universityId;
    private PatientStatus status;
    private LocalDateTime createdAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/ReportResponse.java`
- Bytes: 534
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

import java.util.Map;

/**
 * DTO para reportes operativos básicos.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {

    /** Total de citas en el rango */
    private long totalAppointments;

    /** Desglose por estado: {"SCHEDULED": 5, "CONFIRMED": 3, ...} */
    private Map<String, Long> countByStatus;

    /** Desglose por doctor: {"Dr. García": 4, "Dra. López": 6, ...} */
    private Map<String, Long> countByDoctor;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/SpecialtyResponse.java`
- Bytes: 338
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

/** DTO de salida para especialidades */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialtyResponse {
    private Long id;
    private String name;
    private Boolean active;
    private LocalDateTime createdAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/UpdateDoctorRequest.java`
- Bytes: 388
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDoctorRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    private Long specialtyId;

    @Size(max = 50)
    private String licenseNumber;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/UpdateOfficeRequest.java`
- Bytes: 357
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import com.university.clinic.entity.OfficeStatus;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOfficeRequest {

    @Size(max = 50)
    private String name;

    private Integer floor;

    private OfficeStatus status;
}

```

---

### Archivo: `src/main/java/com/university/clinic/dto/UpdatePatientRequest.java`
- Bytes: 547
- Encoding detectado: utf-8

```java
package com.university.clinic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePatientRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Email(message = "El email debe ser válido")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String phone;

    @Size(max = 50)
    private String universityId;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/Appointment.java`
- Bytes: 1460
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * La cita médica — la entidad central del sistema.
 *
 * Reglas clave:
 * - startAt lo define el cliente
 * - endAt lo calcula el servidor: startAt + appointmentType.durationMinutes
 * - status inicia en SCHEDULED
 */
@Entity
@Table(name = "appointments")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_type_id", nullable = false)
    private AppointmentType appointmentType;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    /** Calculado por el servidor: startAt + durationMinutes */
    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(length = 500)
    private String notes;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/AppointmentStatus.java`
- Bytes: 577
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

/**
 * Estados posibles de una cita.
 * Equivalente a un Enum en PHP 8.1+ que usarías con $casts en Eloquent.
 *
 * Máquina de estados:
 *   SCHEDULED → CONFIRMED → COMPLETED
 *   SCHEDULED → CONFIRMED → NO_SHOW
 *   SCHEDULED → CANCELLED
 *   CONFIRMED → CANCELLED
 */
public enum AppointmentStatus {
    SCHEDULED,   // Recién creada
    CONFIRMED,   // Confirmada por el paciente/admin
    CANCELLED,   // Cancelada
    COMPLETED,   // Completada (el paciente asistió)
    NO_SHOW      // El paciente no se presentó
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/AppointmentType.java`
- Bytes: 713
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Tipo de cita (ej: Consulta General, Revisión, Urgencia).
 * Define la duración estándar de la cita.
 */
@Entity
@Table(name = "appointment_types")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentType extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    /** Duración de la cita en minutos. El servidor usa esto para calcular endAt. */
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/BaseEntity.java`
- Bytes: 1017
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Clase base para todas las entidades.
 * Equivalente a un Trait con $timestamps en Laravel.
 *
 * @MappedSuperclass = "esta clase NO es una tabla, pero sus hijos heredan estos campos".
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // autoincrement, como en migrations de Laravel
    private Long id;

    @CreationTimestamp // se llena automáticamente al insertar (como created_at en Laravel)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // se actualiza automáticamente al modificar (como updated_at en Laravel)
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/Doctor.java`
- Bytes: 1078
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Doctor.
 * Relación: Un doctor pertenece a una especialidad (belongsTo en Laravel).
 */
@Entity
@Table(name = "doctors")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    /**
     * @ManyToOne = belongsTo() en Eloquent.
     * @JoinColumn = la columna FK en ESTA tabla que apunta a specialties.id
     * FetchType.LAZY = no carga la especialidad hasta que la necesites (mejor rendimiento)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(name = "license_number", nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/DoctorSchedule.java`
- Bytes: 1243
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Horario de atención de un doctor.
 * Ej: Dr. García atiende Lunes de 08:00 a 12:00 y Martes de 14:00 a 18:00.
 *
 * Un doctor puede tener MÚLTIPLES horarios (uno por bloque de día/hora).
 */
@Entity
@Table(name = "doctor_schedules")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /**
     * Día de la semana (MONDAY, TUESDAY, ..., SUNDAY).
     * En Java, DayOfWeek es un enum integrado — como Carbon::MONDAY en PHP.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    /** Hora de inicio del bloque (ej: 08:00) */
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /** Hora de fin del bloque (ej: 12:00) */
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/Office.java`
- Bytes: 539
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Consultorio médico.
 */
@Entity
@Table(name = "offices")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Office extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OfficeStatus status = OfficeStatus.ACTIVE;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/OfficeStatus.java`
- Bytes: 163
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

/**
 * Estados posibles de un consultorio.
 */
public enum OfficeStatus {
    ACTIVE,
    INACTIVE,
    UNDER_MAINTENANCE
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/Patient.java`
- Bytes: 931
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Paciente (estudiante/personal universitario).
 */
@Entity
@Table(name = "patients")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    /** Matrícula o código universitario */
    @Column(name = "university_id", nullable = false, unique = true, length = 50)
    private String universityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PatientStatus status = PatientStatus.ACTIVE;
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/PatientStatus.java`
- Bytes: 138
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

/**
 * Estados posibles de un paciente.
 */
public enum PatientStatus {
    ACTIVE,
    INACTIVE
}

```

---

### Archivo: `src/main/java/com/university/clinic/entity/Specialty.java`
- Bytes: 539
- Encoding detectado: utf-8

```java
package com.university.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Especialidad médica (ej: Medicina General, Odontología).
 * Equivalente a un Model simple en Laravel con: name, active.
 */
@Entity
@Table(name = "specialties")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Specialty extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}

```

---

### Archivo: `src/main/java/com/university/clinic/exception/BusinessException.java`
- Bytes: 362
- Encoding detectado: utf-8

```java
package com.university.clinic.exception;

/**
 * Se lanza cuando se viola una regla de negocio.
 * Ej: intentar completar una cita antes de su hora de inicio,
 * transiciones de estado inválidas, entidad inactiva, etc.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/exception/ConflictException.java`
- Bytes: 296
- Encoding detectado: utf-8

```java
package com.university.clinic.exception;

/**
 * Se lanza cuando hay un conflicto de datos.
 * Ej: traslape de horario, duplicado de email/licencia, etc.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/exception/GlobalExceptionHandler.java`
- Bytes: 3212
- Encoding detectado: utf-8

```java
package com.university.clinic.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejo global de excepciones.
 * Equivalente a app/Exceptions/Handler.php en Laravel.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Recurso no encontrado → 404 */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /** Regla de negocio violada → 422 Unprocessable Entity */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException ex) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    /** Conflicto de datos (traslapes, duplicados) → 409 Conflict */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    /** Validación personalizada → 400 Bad Request */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(ValidationException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /**
     * Errores de validación del DTO (@Valid falló) → 400 Bad Request
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleBeanValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Error de validación");
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** Cualquier otra excepción no controlada → 500 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/exception/ResourceNotFoundException.java`
- Bytes: 365
- Encoding detectado: utf-8

```java
package com.university.clinic.exception;

/**
 * Se lanza cuando no se encuentra un recurso por su ID.
 * Equivalente a ModelNotFoundException en Laravel.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " no encontrado con id: " + id);
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/exception/ValidationException.java`
- Bytes: 379
- Encoding detectado: utf-8

```java
package com.university.clinic.exception;

/**
 * Se lanza cuando hay un error de validación personalizado
 * (no cubierto por las anotaciones de Bean Validation).
 * Ej: hora de inicio posterior a hora de fin, fecha inválida, etc.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/mapper/AppointmentMapper.java`
- Bytes: 1707
- Encoding detectado: utf-8

```java
package com.university.clinic.mapper;

import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.entity.Appointment;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {
    public AppointmentResponse toResponse(Appointment appointment) {
        if (appointment == null) return null;
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getId() : null)
                .patientFullName(appointment.getPatient() != null ? appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .doctorFullName(appointment.getDoctor() != null ? appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName() : null)
                .officeId(appointment.getOffice() != null ? appointment.getOffice().getId() : null)
                .officeName(appointment.getOffice() != null ? appointment.getOffice().getName() : null)
                .appointmentTypeId(appointment.getAppointmentType() != null ? appointment.getAppointmentType().getId() : null)
                .appointmentTypeName(appointment.getAppointmentType() != null ? appointment.getAppointmentType().getName() : null)
                .startAt(appointment.getStartAt())
                .endAt(appointment.getEndAt())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/mapper/AppointmentTypeMapper.java`
- Bytes: 662
- Encoding detectado: utf-8

```java
package com.university.clinic.mapper;

import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.entity.AppointmentType;
import org.springframework.stereotype.Component;

@Component
public class AppointmentTypeMapper {
    public AppointmentTypeResponse toResponse(AppointmentType type) {
        if (type == null) return null;
        return AppointmentTypeResponse.builder()
                .id(type.getId())
                .name(type.getName())
                .durationMinutes(type.getDurationMinutes())
                .active(type.getActive())
                .createdAt(type.getCreatedAt())
                .build();
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/mapper/DoctorMapper.java`
- Bytes: 878
- Encoding detectado: utf-8

```java
package com.university.clinic.mapper;

import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.entity.Doctor;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {
    public DoctorResponse toResponse(Doctor doctor) {
        if (doctor == null) return null;
        return DoctorResponse.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .specialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null)
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .licenseNumber(doctor.getLicenseNumber())
                .active(doctor.getActive())
                .createdAt(doctor.getCreatedAt())
                .build();
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/mapper/DoctorScheduleMapper.java`
- Bytes: 974
- Encoding detectado: utf-8

```java
package com.university.clinic.mapper;

import com.university.clinic.dto.DoctorScheduleResponse;
import com.university.clinic.entity.DoctorSchedule;
import org.springframework.stereotype.Component;

@Component
public class DoctorScheduleMapper {
    public DoctorScheduleResponse toResponse(DoctorSchedule schedule) {
        if (schedule == null) return null;
        return DoctorScheduleResponse.builder()
                .id(schedule.getId())
                .doctorId(schedule.getDoctor() != null ? schedule.getDoctor().getId() : null)
                .doctorFullName(schedule.getDoctor() != null ? schedule.getDoctor().getFirstName() + " " + schedule.getDoctor().getLastName() : null)
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .active(schedule.getActive())
                .createdAt(schedule.getCreatedAt())
                .build();
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/mapper/OfficeMapper.java`
- Bytes: 602
- Encoding detectado: utf-8

```java
package com.university.clinic.mapper;

import com.university.clinic.dto.OfficeResponse;
import com.university.clinic.entity.Office;
import org.springframework.stereotype.Component;

@Component
public class OfficeMapper {
    public OfficeResponse toResponse(Office office) {
        if (office == null) return null;
        return OfficeResponse.builder()
                .id(office.getId())
                .name(office.getName())
                .floor(office.getFloor())
                .status(office.getStatus())
                .createdAt(office.getCreatedAt())
                .build();
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/mapper/PatientMapper.java`
- Bytes: 774
- Encoding detectado: utf-8

```java
package com.university.clinic.mapper;

import com.university.clinic.dto.PatientResponse;
import com.university.clinic.entity.Patient;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {
    public PatientResponse toResponse(Patient patient) {
        if (patient == null) return null;
        return PatientResponse.builder()
                .id(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .email(patient.getEmail())
                .phone(patient.getPhone())
                .universityId(patient.getUniversityId())
                .status(patient.getStatus())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/mapper/SpecialtyMapper.java`
- Bytes: 596
- Encoding detectado: utf-8

```java
package com.university.clinic.mapper;

import com.university.clinic.dto.SpecialtyResponse;
import com.university.clinic.entity.Specialty;
import org.springframework.stereotype.Component;

@Component
public class SpecialtyMapper {
    public SpecialtyResponse toResponse(Specialty specialty) {
        if (specialty == null) return null;
        return SpecialtyResponse.builder()
                .id(specialty.getId())
                .name(specialty.getName())
                .active(specialty.getActive())
                .createdAt(specialty.getCreatedAt())
                .build();
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/repository/AppointmentRepository.java`
- Bytes: 7825
- Encoding detectado: utf-8

```java
package com.university.clinic.repository;

import com.university.clinic.entity.Appointment;
import com.university.clinic.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Verifica si hay traslape de horario para un DOCTOR.
     * Equivalente en Laravel:
     *   Appointment::where('doctor_id', $doctorId)
     *       ->whereIn('status', ['SCHEDULED', 'CONFIRMED'])
     *       ->where('start_at', '<', $endAt)
     *       ->where('end_at', '>', $startAt)
     *       ->exists();
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
    """)
    boolean existsDoctorOverlap(@Param("doctorId") Long doctorId,
                                @Param("startAt") LocalDateTime startAt,
                                @Param("endAt") LocalDateTime endAt);

    /** Verifica traslape de horario para un CONSULTORIO */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.office.id = :officeId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
    """)
    boolean existsOfficeOverlap(@Param("officeId") Long officeId,
                                @Param("startAt") LocalDateTime startAt,
                                @Param("endAt") LocalDateTime endAt);

    /** Verifica traslape de horario para un PACIENTE */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.patient.id = :patientId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
    """)
    boolean existsPatientOverlap(@Param("patientId") Long patientId,
                                 @Param("startAt") LocalDateTime startAt,
                                 @Param("endAt") LocalDateTime endAt);

    /** Citas de un doctor en un rango de tiempo (para calcular disponibilidad) */
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
        ORDER BY a.startAt
    """)
    List<Appointment> findActiveDoctorAppointments(@Param("doctorId") Long doctorId,
                                                   @Param("startAt") LocalDateTime startAt,
                                                   @Param("endAt") LocalDateTime endAt);

    /** Filtro: citas por doctor */
    List<Appointment> findByDoctorId(Long doctorId);

    /** Filtro: citas por paciente */
    List<Appointment> findByPatientId(Long patientId);

    /** Filtro: citas por estado */
    List<Appointment> findByStatus(AppointmentStatus status);

    /** Filtro: citas en un rango de fechas */
    List<Appointment> findByStartAtBetween(LocalDateTime from, LocalDateTime to);

    /** Filtro: citas de un paciente por estado */
    List<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status);

    // ============================================
    // AGGREGATION QUERIES PARA REPORTES
    // ============================================

    @Query("SELECT a.office.id, a.office.name, a.office.floor, COUNT(a.id), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.COMPLETED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.CANCELLED THEN 1 ELSE 0 END) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to " +
           "GROUP BY a.office.id, a.office.name, a.office.floor")
    List<Object[]> getOfficeOccupancyReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.doctor.id, a.doctor.firstName, a.doctor.lastName, " +
           "COALESCE(a.doctor.specialty.name, ''), COUNT(a.id), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.COMPLETED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.CANCELLED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.NO_SHOW THEN 1 ELSE 0 END) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to " +
           "GROUP BY a.doctor.id, a.doctor.firstName, a.doctor.lastName, a.doctor.specialty.name")
    List<Object[]> getDoctorProductivityReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.patient.id, a.patient.firstName, a.patient.lastName, a.patient.email, a.patient.universityId, COUNT(a.id) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to AND a.status = com.university.clinic.entity.AppointmentStatus.NO_SHOW " +
           "GROUP BY a.patient.id, a.patient.firstName, a.patient.lastName, a.patient.email, a.patient.universityId")
    List<Object[]> getNoShowPatientsReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.doctor.specialty.id, COALESCE(a.doctor.specialty.name, 'Sin especialidad'), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.CANCELLED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.NO_SHOW THEN 1 ELSE 0 END) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to " +
           "GROUP BY a.doctor.specialty.id, a.doctor.specialty.name")
    List<Object[]> getCancelledAndNoShowBySpecialtyReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ============================================
    // AGGREGATION QUERIES PARA GENERATE_REPORT GENERAL
    // ============================================

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.startAt BETWEEN :from AND :to")
    long countAppointmentsByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.status, COUNT(a.id) FROM Appointment a WHERE a.startAt BETWEEN :from AND :to GROUP BY a.status")
    List<Object[]> countAppointmentsByStatusGrouped(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.doctor.firstName, a.doctor.lastName, COUNT(a.id) FROM Appointment a WHERE a.startAt BETWEEN :from AND :to GROUP BY a.doctor.firstName, a.doctor.lastName")
    List<Object[]> countAppointmentsByDoctorGrouped(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Filtro: citas por doctor y estado */
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    /** Reportes: contar citas por estado */
    long countByStatus(AppointmentStatus status);

    /** Reportes: contar citas por doctor y estado */
    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);
}

```

---

### Archivo: `src/main/java/com/university/clinic/repository/AppointmentTypeRepository.java`
- Bytes: 363
- Encoding detectado: utf-8

```java
package com.university.clinic.repository;

import com.university.clinic.entity.AppointmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentTypeRepository extends JpaRepository<AppointmentType, Long> {

    boolean existsByNameIgnoreCase(String name);
}

```

---

### Archivo: `src/main/java/com/university/clinic/repository/DoctorRepository.java`
- Bytes: 529
- Encoding detectado: utf-8

```java
package com.university.clinic.repository;

import com.university.clinic.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByLicenseNumber(String licenseNumber);

    List<Doctor> findBySpecialtyId(Long specialtyId);

    List<Doctor> findBySpecialtyIdAndActiveTrue(Long specialtyId);

    List<Doctor> findByActiveTrue();
}

```

---

### Archivo: `src/main/java/com/university/clinic/repository/DoctorScheduleRepository.java`
- Bytes: 659
- Encoding detectado: utf-8

```java
package com.university.clinic.repository;

import com.university.clinic.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

    /** Busca horarios activos de un doctor para un día de la semana */
    List<DoctorSchedule> findByDoctorIdAndDayOfWeekAndActiveTrue(Long doctorId, DayOfWeek dayOfWeek);

    /** Todos los horarios activos de un doctor */
    List<DoctorSchedule> findByDoctorIdAndActiveTrue(Long doctorId);
}

```

---

### Archivo: `src/main/java/com/university/clinic/repository/OfficeRepository.java`
- Bytes: 286
- Encoding detectado: utf-8

```java
package com.university.clinic.repository;

import com.university.clinic.entity.Office;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficeRepository extends JpaRepository<Office, Long> {
}

```

---

### Archivo: `src/main/java/com/university/clinic/repository/PatientRepository.java`
- Bytes: 387
- Encoding detectado: utf-8

```java
package com.university.clinic.repository;

import com.university.clinic.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByEmail(String email);

    boolean existsByUniversityId(String universityId);
}

```

---

### Archivo: `src/main/java/com/university/clinic/repository/SpecialtyRepository.java`
- Bytes: 618
- Encoding detectado: utf-8

```java
package com.university.clinic.repository;

import com.university.clinic.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de Especialidades.
 * Equivalente a Specialty::query() en Eloquent.
 *
 * JpaRepository<Specialty, Long> = "esta clase maneja la entidad Specialty y su PK es Long".
 * Spring genera automáticamente: findAll(), findById(), save(), deleteById(), etc.
 */
@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {

    boolean existsByNameIgnoreCase(String name);
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/AppointmentService.java`
- Bytes: 1099
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/main/java/com/university/clinic/service/AppointmentTypeService.java`
- Bytes: 479
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/main/java/com/university/clinic/service/AvailabilityService.java`
- Bytes: 301
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.AvailabilitySlotResponse;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityService {
    List<AvailabilitySlotResponse> getAvailability(Long doctorId, LocalDate date, int slotDurationMinutes);
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/DoctorScheduleService.java`
- Bytes: 560
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/main/java/com/university/clinic/service/DoctorService.java`
- Bytes: 452
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.CreateDoctorRequest;
import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.dto.UpdateDoctorRequest;

import java.util.List;

public interface DoctorService {
    List<DoctorResponse> findAll();
    DoctorResponse findById(Long id);
    DoctorResponse create(CreateDoctorRequest request);
    DoctorResponse update(Long id, UpdateDoctorRequest request);
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/OfficeService.java`
- Bytes: 452
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.CreateOfficeRequest;
import com.university.clinic.dto.OfficeResponse;
import com.university.clinic.dto.UpdateOfficeRequest;

import java.util.List;

public interface OfficeService {
    List<OfficeResponse> findAll();
    OfficeResponse findById(Long id);
    OfficeResponse create(CreateOfficeRequest request);
    OfficeResponse update(Long id, UpdateOfficeRequest request);
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/PatientService.java`
- Bytes: 462
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.dto.UpdatePatientRequest;

import java.util.List;

public interface PatientService {
    List<PatientResponse> findAll();
    PatientResponse findById(Long id);
    PatientResponse create(CreatePatientRequest request);
    PatientResponse update(Long id, UpdatePatientRequest request);
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/ReportService.java`
- Bytes: 708
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.DoctorProductivityResponse;
import com.university.clinic.dto.NoShowPatientResponse;
import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.dto.ReportResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {
    ReportResponse generateReport(LocalDateTime from, LocalDateTime to);
    List<OfficeOccupancyResponse> getOfficeOccupancy(LocalDateTime from, LocalDateTime to);
    List<DoctorProductivityResponse> getDoctorProductivity(LocalDateTime from, LocalDateTime to);
    List<NoShowPatientResponse> getNoShowPatients(LocalDateTime from, LocalDateTime to);
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/SpecialtyService.java`
- Bytes: 425
- Encoding detectado: utf-8

```java
package com.university.clinic.service;

import com.university.clinic.dto.CreateSpecialtyRequest;
import com.university.clinic.dto.SpecialtyResponse;

import java.util.List;

public interface SpecialtyService {
    List<SpecialtyResponse> findAll();
    SpecialtyResponse findById(Long id);
    SpecialtyResponse create(CreateSpecialtyRequest request);
    SpecialtyResponse update(Long id, CreateSpecialtyRequest request);
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/AppointmentServiceImpl.java`
- Bytes: 9170
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/AppointmentTypeServiceImpl.java`
- Bytes: 2591
- Encoding detectado: utf-8

```java
package com.university.clinic.service.impl;

import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.dto.CreateAppointmentTypeRequest;
import com.university.clinic.entity.AppointmentType;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.AppointmentTypeRepository;
import com.university.clinic.service.AppointmentTypeService;
import com.university.clinic.mapper.AppointmentTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentTypeServiceImpl implements AppointmentTypeService {

    private final AppointmentTypeRepository typeRepository;
    private final AppointmentTypeMapper typeMapper;

    @Override
    public List<AppointmentTypeResponse> findAll() {
        return typeRepository.findAll().stream().map(typeMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public AppointmentTypeResponse findById(Long id) {
        return typeMapper.toResponse(typeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tipo de cita", id)));
    }

    @Override
    public AppointmentTypeResponse create(CreateAppointmentTypeRequest request) {
        if (typeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un tipo de cita con este nombre");
        }
        AppointmentType type = new AppointmentType();
        type.setName(request.getName());
        type.setDurationMinutes(request.getDurationMinutes());
        type.setActive(true);
        return typeMapper.toResponse(typeRepository.save(type));
    }

    @Override
    public AppointmentTypeResponse update(Long id, CreateAppointmentTypeRequest request) {
        AppointmentType type = typeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tipo de cita", id));
        if (request.getName() != null && !request.getName().equalsIgnoreCase(type.getName())) {
            if (typeRepository.existsByNameIgnoreCase(request.getName())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un tipo de cita con este nombre");
            }
            type.setName(request.getName());
        }
        if (request.getDurationMinutes() != null) {
            type.setDurationMinutes(request.getDurationMinutes());
        }
        return typeMapper.toResponse(typeRepository.save(type));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/AvailabilityServiceImpl.java`
- Bytes: 3127
- Encoding detectado: utf-8

```java
package com.university.clinic.service.impl;

import com.university.clinic.dto.AvailabilitySlotResponse;
import com.university.clinic.entity.Appointment;
import com.university.clinic.entity.DoctorSchedule;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.AppointmentRepository;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.DoctorScheduleRepository;
import com.university.clinic.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final DoctorScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public List<AvailabilitySlotResponse> getAvailability(Long doctorId, LocalDate date, int slotDurationMinutes) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor", doctorId);
        }

        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, date.getDayOfWeek());
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        List<Appointment> existingAppointments = appointmentRepository.findActiveDoctorAppointments(doctorId, startOfDay, endOfDay);
        
        List<AvailabilitySlotResponse> availableSlots = new ArrayList<>();
        
        for (DoctorSchedule schedule : schedules) {
            LocalTime currentSlotTime = schedule.getStartTime();
            LocalTime endTime = schedule.getEndTime();
            
            while (currentSlotTime.plusMinutes(slotDurationMinutes).isBefore(endTime) || 
                   currentSlotTime.plusMinutes(slotDurationMinutes).equals(endTime)) {
                
                LocalDateTime slotStart = date.atTime(currentSlotTime);
                LocalDateTime slotEnd = slotStart.plusMinutes(slotDurationMinutes);
                
                boolean isOverlapping = existingAppointments.stream().anyMatch(appointment -> {
                    LocalDateTime aptStart = appointment.getStartAt();
                    LocalDateTime aptEnd = appointment.getEndAt();
                    return slotStart.isBefore(aptEnd) && aptStart.isBefore(slotEnd);
                });
                
                if (!isOverlapping) {
                    availableSlots.add(AvailabilitySlotResponse.builder()
                            .startAt(slotStart)
                            .endAt(slotEnd)
                            .build());
                }
                
                currentSlotTime = currentSlotTime.plusMinutes(slotDurationMinutes);
            }
        }
        
        return availableSlots;
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/DoctorScheduleServiceImpl.java`
- Bytes: 4748
- Encoding detectado: utf-8

```java
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

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/DoctorServiceImpl.java`
- Bytes: 3355
- Encoding detectado: utf-8

```java
package com.university.clinic.service.impl;

import com.university.clinic.dto.CreateDoctorRequest;
import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.dto.UpdateDoctorRequest;
import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.Specialty;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.DoctorService;
import com.university.clinic.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorMapper doctorMapper;

    @Override
    public List<DoctorResponse> findAll() {
        return doctorRepository.findAll().stream().map(doctorMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public DoctorResponse findById(Long id) {
        return doctorMapper.toResponse(doctorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor", id)));
    }

    @Override
    public DoctorResponse create(CreateDoctorRequest request) {
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un doctor con esta cédula");
        }
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad", request.getSpecialtyId()));
        Doctor doctor = new Doctor();
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setSpecialty(specialty);
        doctor.setActive(true);
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    public DoctorResponse update(Long id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
        if (request.getFirstName() != null) doctor.setFirstName(request.getFirstName());
        if (request.getLastName() != null) doctor.setLastName(request.getLastName());
        if (request.getLicenseNumber() != null && !request.getLicenseNumber().equals(doctor.getLicenseNumber())) {
            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un doctor con esta cédula");
            }
            doctor.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getSpecialtyId() != null) {
            Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Especialidad", request.getSpecialtyId()));
            doctor.setSpecialty(specialty);
        }
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/OfficeServiceImpl.java`
- Bytes: 2092
- Encoding detectado: utf-8

```java
package com.university.clinic.service.impl;

import com.university.clinic.dto.CreateOfficeRequest;
import com.university.clinic.dto.OfficeResponse;
import com.university.clinic.dto.UpdateOfficeRequest;
import com.university.clinic.entity.Office;
import com.university.clinic.entity.OfficeStatus;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.OfficeRepository;
import com.university.clinic.service.OfficeService;
import com.university.clinic.mapper.OfficeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfficeServiceImpl implements OfficeService {

    private final OfficeRepository officeRepository;
    private final OfficeMapper officeMapper;

    @Override
    public List<OfficeResponse> findAll() {
        return officeRepository.findAll().stream().map(officeMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public OfficeResponse findById(Long id) {
        return officeMapper.toResponse(officeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Consultorio", id)));
    }

    @Override
    public OfficeResponse create(CreateOfficeRequest request) {
        Office office = new Office();
        office.setName(request.getName());
        office.setFloor(request.getFloor());
        office.setStatus(OfficeStatus.ACTIVE);
        return officeMapper.toResponse(officeRepository.save(office));
    }

    @Override
    public OfficeResponse update(Long id, UpdateOfficeRequest request) {
        Office office = officeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Consultorio", id));
        if (request.getName() != null) office.setName(request.getName());
        if (request.getFloor() != null) office.setFloor(request.getFloor());
        if (request.getStatus() != null) office.setStatus(request.getStatus());
        return officeMapper.toResponse(officeRepository.save(office));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/PatientServiceImpl.java`
- Bytes: 3523
- Encoding detectado: utf-8

```java
package com.university.clinic.service.impl;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.dto.UpdatePatientRequest;
import com.university.clinic.entity.Patient;
import com.university.clinic.entity.PatientStatus;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.PatientRepository;
import com.university.clinic.service.PatientService;
import com.university.clinic.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Override
    public List<PatientResponse> findAll() {
        return patientRepository.findAll().stream().map(patientMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public PatientResponse findById(Long id) {
        return patientMapper.toResponse(patientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Paciente", id)));
    }

    @Override
    public PatientResponse create(CreatePatientRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este correo electrónico");
        }
        if (patientRepository.existsByUniversityId(request.getUniversityId())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este número de control");
        }
        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setUniversityId(request.getUniversityId());
        patient.setStatus(PatientStatus.ACTIVE);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Override
    public PatientResponse update(Long id, UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Paciente", id));
        if (request.getFirstName() != null) patient.setFirstName(request.getFirstName());
        if (request.getLastName() != null) patient.setLastName(request.getLastName());
        if (request.getEmail() != null && !request.getEmail().equals(patient.getEmail())) {
            if (patientRepository.existsByEmail(request.getEmail())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este correo electrónico");
            }
            patient.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) patient.setPhone(request.getPhone());
        if (request.getUniversityId() != null && !request.getUniversityId().equals(patient.getUniversityId())) {
            if (patientRepository.existsByUniversityId(request.getUniversityId())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un paciente con este número de control");
            }
            patient.setUniversityId(request.getUniversityId());
        }
        return patientMapper.toResponse(patientRepository.save(patient));
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/ReportServiceImpl.java`
- Bytes: 5258
- Encoding detectado: utf-8

```java
package com.university.clinic.service.impl;

import com.university.clinic.dto.DoctorProductivityResponse;
import com.university.clinic.dto.NoShowPatientResponse;
import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.dto.ReportResponse;
import com.university.clinic.entity.Appointment;
import com.university.clinic.repository.AppointmentRepository;
import com.university.clinic.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final AppointmentRepository appointmentRepository;

    @Override
    public ReportResponse generateReport(LocalDateTime from, LocalDateTime to) {
        long totalAppointments = appointmentRepository.countAppointmentsByDateRange(from, to);

        List<Object[]> statusRows = appointmentRepository.countAppointmentsByStatusGrouped(from, to);
        Map<String, Long> countByStatus = statusRows.stream()
                .collect(Collectors.toMap(
                        row -> ((com.university.clinic.entity.AppointmentStatus) row[0]).name(),
                        row -> ((Number) row[1]).longValue()
                ));

        List<Object[]> doctorRows = appointmentRepository.countAppointmentsByDoctorGrouped(from, to);
        Map<String, Long> countByDoctor = doctorRows.stream()
                .collect(Collectors.toMap(
                        row -> row[0] + " " + row[1],
                        row -> ((Number) row[2]).longValue()
                ));

        return ReportResponse.builder()
                .totalAppointments((int) totalAppointments)
                .countByStatus(countByStatus)
                .countByDoctor(countByDoctor)
                .build();
    }

    @Override
    public List<OfficeOccupancyResponse> getOfficeOccupancy(LocalDateTime from, LocalDateTime to) {
        List<Object[]> results = appointmentRepository.getOfficeOccupancyReport(from, to);
        return results.stream().map(row -> {
            Long officeId = ((Number) row[0]).longValue();
            String officeName = (String) row[1];
            Integer floor = (Integer) row[2];
            long total = ((Number) row[3]).longValue();
            long completed = ((Number) row[4]).longValue();
            long cancelled = ((Number) row[5]).longValue();

            double occupancy = total > 0 ? (double) completed / total * 100.0 : 0.0;
            return OfficeOccupancyResponse.builder()
                    .officeId(officeId)
                    .officeName(officeName)
                    .floor(floor)
                    .totalAppointments(total)
                    .completedAppointments(completed)
                    .cancelledAppointments(cancelled)
                    .occupancyPercentage(Math.round(occupancy * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<DoctorProductivityResponse> getDoctorProductivity(LocalDateTime from, LocalDateTime to) {
        List<Object[]> results = appointmentRepository.getDoctorProductivityReport(from, to);
        return results.stream().map(row -> {
            Long doctorId = ((Number) row[0]).longValue();
            String fullName = row[1] + " " + row[2];
            String specialtyName = ((String) row[3]).isEmpty() ? null : (String) row[3];
            long total = ((Number) row[4]).longValue();
            long completed = ((Number) row[5]).longValue();
            long cancelled = ((Number) row[6]).longValue();
            long noShow = ((Number) row[7]).longValue();

            double completionRate = total > 0 ? (double) completed / total * 100.0 : 0.0;

            return DoctorProductivityResponse.builder()
                    .doctorId(doctorId)
                    .doctorFullName(fullName)
                    .specialtyName(specialtyName)
                    .totalAppointments(total)
                    .completedAppointments(completed)
                    .cancelledAppointments(cancelled)
                    .noShowAppointments(noShow)
                    .completionRate(Math.round(completionRate * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<NoShowPatientResponse> getNoShowPatients(LocalDateTime from, LocalDateTime to) {
        List<Object[]> results = appointmentRepository.getNoShowPatientsReport(from, to);
        return results.stream().map(row -> {
            Long patientId = ((Number) row[0]).longValue();
            String fullName = row[1] + " " + row[2];
            String email = (String) row[3];
            String uuid = (String) row[4];
            long count = ((Number) row[5]).longValue();

            return NoShowPatientResponse.builder()
                    .patientId(patientId)
                    .patientFullName(fullName)
                    .email(email)
                    .universityId(uuid)
                    .noShowCount(count)
                    .build();
        }).collect(Collectors.toList());
    }
}

```

---

### Archivo: `src/main/java/com/university/clinic/service/impl/SpecialtyServiceImpl.java`
- Bytes: 2392
- Encoding detectado: utf-8

```java
package com.university.clinic.service.impl;

import com.university.clinic.dto.CreateSpecialtyRequest;
import com.university.clinic.dto.SpecialtyResponse;
import com.university.clinic.entity.Specialty;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.SpecialtyService;
import com.university.clinic.mapper.SpecialtyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final SpecialtyMapper specialtyMapper;

    @Override
    public List<SpecialtyResponse> findAll() {
        return specialtyRepository.findAll().stream().map(specialtyMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public SpecialtyResponse findById(Long id) {
        return specialtyMapper.toResponse(specialtyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Especialidad", id)));
    }

    @Override
    public SpecialtyResponse create(CreateSpecialtyRequest request) {
        if (specialtyRepository.existsByNameIgnoreCase(request.getName())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe una especialidad con este nombre");
        }
        Specialty specialty = new Specialty();
        specialty.setName(request.getName());
        specialty.setActive(true);
        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }

    @Override
    public SpecialtyResponse update(Long id, CreateSpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Especialidad", id));
        if (request.getName() != null && !request.getName().equalsIgnoreCase(specialty.getName())) {
            if (specialtyRepository.existsByNameIgnoreCase(request.getName())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe una especialidad con este nombre");
            }
            specialty.setName(request.getName());
        }
        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }
}

```