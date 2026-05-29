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
