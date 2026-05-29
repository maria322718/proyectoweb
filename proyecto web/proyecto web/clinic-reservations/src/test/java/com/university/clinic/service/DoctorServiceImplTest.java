package com.university.clinic.service;

import com.university.clinic.dto.DoctorResponse;
import com.university.clinic.dto.UpdateDoctorRequest;
import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.Specialty;
import com.university.clinic.mapper.DoctorMapper;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.impl.DoctorServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private SpecialtyRepository specialtyRepository;

    @Spy
    private DoctorMapper doctorMapper;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    @Test
    @DisplayName("Update parcial no debe borrar campos existentes cuando llegan null")
    void partialUpdateShouldPreserveExistingFields() {
        Specialty cardio = new Specialty();
        cardio.setId(1L);
        cardio.setName("Cardiología");

        Doctor existing = new Doctor();
        existing.setId(1L);
        existing.setFirstName("María");
        existing.setLastName("García");
        existing.setLicenseNumber("LIC-999");
        existing.setSpecialty(cardio);
        existing.setActive(true);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(inv -> inv.getArgument(0));

        // Solo actualizar firstName, dejar todo lo demás null (incluido specialtyId)
        UpdateDoctorRequest request = new UpdateDoctorRequest();
        request.setFirstName("Ana");

        DoctorResponse response = doctorService.update(1L, request);

        assertThat(response.getFirstName()).isEqualTo("Ana");
        assertThat(response.getLastName()).isEqualTo("García");
        assertThat(response.getLicenseNumber()).isEqualTo("LIC-999");
        assertThat(response.getSpecialtyName()).isEqualTo("Cardiología");
        // No se debió buscar especialidad porque specialtyId vino null
        verify(specialtyRepository, never()).findById(any());
    }

    @Test
    @DisplayName("create debe fallar si existsByLicenseNumber es true")
    void createShouldFailIfLicenseExists() {
        com.university.clinic.dto.CreateDoctorRequest request = new com.university.clinic.dto.CreateDoctorRequest();
        request.setFirstName("Test");
        request.setLastName("Test");
        request.setLicenseNumber("LIC-123");
        request.setSpecialtyId(1L);

        when(doctorRepository.existsByLicenseNumber("LIC-123")).thenReturn(true);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> doctorService.create(request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("cédula");
    }

    @Test
    @DisplayName("update no debe fallar si licenseNumber no cambia")
    void updateShouldNotFailIfLicenseUnchanged() {
        Doctor existing = new Doctor();
        existing.setId(1L);
        existing.setLicenseNumber("LIC-999");

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateDoctorRequest request = new UpdateDoctorRequest();
        request.setLicenseNumber("LIC-999"); // mismo valor

        DoctorResponse response = doctorService.update(1L, request);

        assertThat(response.getLicenseNumber()).isEqualTo("LIC-999");
        verify(doctorRepository, never()).existsByLicenseNumber(any());
    }

    @Test
    @DisplayName("update debe fallar si cambia a una licencia ya existente")
    void updateShouldFailIfLicenseChangesToExisting() {
        Doctor existing = new Doctor();
        existing.setId(1L);
        existing.setLicenseNumber("LIC-999");

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(doctorRepository.existsByLicenseNumber("LIC-888")).thenReturn(true);

        UpdateDoctorRequest request = new UpdateDoctorRequest();
        request.setLicenseNumber("LIC-888");

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> doctorService.update(1L, request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("cédula");
    }
}
