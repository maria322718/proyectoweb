package com.university.clinic.service.impl;

import com.university.clinic.dto.CreateSpecialtyRequest;
import com.university.clinic.dto.SpecialtyResponse;
import com.university.clinic.entity.Specialty;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.SpecialtyService;
import com.university.clinic.mapper.SpecialtyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final SpecialtyMapper specialtyMapper;

    @Override
    public List<SpecialtyResponse> findAll() {
        return specialtyRepository.findAll().stream().map(specialtyMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public SpecialtyResponse findById(Long id) {
        return specialtyMapper.toResponse(specialtyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Especialidad", id)));
    }

    @Override
    public SpecialtyResponse create(CreateSpecialtyRequest request) {
        if (specialtyRepository.existsByNameIgnoreCase(request.getName())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe una especialidad con este nombre");
        }
        Specialty specialty = new Specialty();
        specialty.setName(request.getName());
        specialty.setActive(true);
        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }

    @Override
    public SpecialtyResponse update(Long id, CreateSpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Especialidad", id));
        if (request.getName() != null && !request.getName().equalsIgnoreCase(specialty.getName())) {
            if (specialtyRepository.existsByNameIgnoreCase(request.getName())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe una especialidad con este nombre");
            }
            specialty.setName(request.getName());
        }
        return specialtyMapper.toResponse(specialtyRepository.save(specialty));
    }
}
