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
