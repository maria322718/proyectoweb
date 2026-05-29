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
