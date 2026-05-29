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
