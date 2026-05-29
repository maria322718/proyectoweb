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
