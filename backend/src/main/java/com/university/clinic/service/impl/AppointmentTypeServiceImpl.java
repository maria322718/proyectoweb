package com.university.clinic.service.impl;

import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.dto.CreateAppointmentTypeRequest;
import com.university.clinic.entity.AppointmentType;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.AppointmentTypeRepository;
import com.university.clinic.service.AppointmentTypeService;
import com.university.clinic.mapper.AppointmentTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentTypeServiceImpl implements AppointmentTypeService {

    private final AppointmentTypeRepository typeRepository;
    private final AppointmentTypeMapper typeMapper;

    @Override
    public List<AppointmentTypeResponse> findAll() {
        return typeRepository.findAll().stream().map(typeMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public AppointmentTypeResponse findById(Long id) {
        return typeMapper.toResponse(typeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tipo de cita", id)));
    }

    @Override
    public AppointmentTypeResponse create(CreateAppointmentTypeRequest request) {
        if (typeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new com.university.clinic.exception.ConflictException("Ya existe un tipo de cita con este nombre");
        }
        AppointmentType type = new AppointmentType();
        type.setName(request.getName());
        type.setDurationMinutes(request.getDurationMinutes());
        type.setActive(true);
        return typeMapper.toResponse(typeRepository.save(type));
    }

    @Override
    public AppointmentTypeResponse update(Long id, CreateAppointmentTypeRequest request) {
        AppointmentType type = typeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tipo de cita", id));
        if (request.getName() != null && !request.getName().equalsIgnoreCase(type.getName())) {
            if (typeRepository.existsByNameIgnoreCase(request.getName())) {
                throw new com.university.clinic.exception.ConflictException("Ya existe un tipo de cita con este nombre");
            }
            type.setName(request.getName());
        }
        if (request.getDurationMinutes() != null) {
            type.setDurationMinutes(request.getDurationMinutes());
        }
        return typeMapper.toResponse(typeRepository.save(type));
    }
}
