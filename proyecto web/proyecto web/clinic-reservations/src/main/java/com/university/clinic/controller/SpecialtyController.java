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
