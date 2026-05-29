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
