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
