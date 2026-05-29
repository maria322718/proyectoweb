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
