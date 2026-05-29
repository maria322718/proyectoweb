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
