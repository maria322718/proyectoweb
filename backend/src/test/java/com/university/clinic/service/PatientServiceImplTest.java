package com.university.clinic.service;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.dto.UpdatePatientRequest;
import com.university.clinic.entity.Patient;
import com.university.clinic.entity.PatientStatus;
import com.university.clinic.mapper.PatientMapper;
import com.university.clinic.repository.PatientRepository;
import com.university.clinic.service.impl.PatientServiceImpl;
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
class PatientServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Spy
    private PatientMapper patientMapper;

    @InjectMocks
    private PatientServiceImpl patientService;

    @Test
    @DisplayName("Update parcial no debe borrar campos existentes cuando llegan null")
    void partialUpdateShouldPreserveExistingFields() {
        Patient existing = new Patient();
        existing.setId(1L);
        existing.setFirstName("Juan");
        existing.setLastName("Pérez");
        existing.setEmail("juan@univ.edu");
        existing.setPhone("555-1234");
        existing.setUniversityId("MAT-001");
        existing.setStatus(PatientStatus.ACTIVE);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        // Solo actualizar firstName, dejar todo lo demás null
        UpdatePatientRequest request = new UpdatePatientRequest();
        request.setFirstName("Carlos");

        PatientResponse response = patientService.update(1L, request);

        assertThat(response.getFirstName()).isEqualTo("Carlos");
        assertThat(response.getLastName()).isEqualTo("Pérez");
        assertThat(response.getEmail()).isEqualTo("juan@univ.edu");
        assertThat(response.getPhone()).isEqualTo("555-1234");
        assertThat(response.getUniversityId()).isEqualTo("MAT-001");
    }

    @Test
    @DisplayName("create debe fallar si existsByEmail es true")
    void createShouldFailIfEmailExists() {
        CreatePatientRequest request = new CreatePatientRequest();
        request.setFirstName("Test");
        request.setLastName("Test");
        request.setEmail("duplicado@univ.edu");
        request.setUniversityId("MAT-999");

        when(patientRepository.existsByEmail("duplicado@univ.edu")).thenReturn(true);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> patientService.create(request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("correo");
    }

    @Test
    @DisplayName("create debe fallar si existsByUniversityId es true")
    void createShouldFailIfUniversityIdExists() {
        CreatePatientRequest request = new CreatePatientRequest();
        request.setFirstName("Test");
        request.setLastName("Test");
        request.setEmail("nuevo@univ.edu");
        request.setUniversityId("MAT-002");

        when(patientRepository.existsByEmail("nuevo@univ.edu")).thenReturn(false);
        when(patientRepository.existsByUniversityId("MAT-002")).thenReturn(true);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> patientService.create(request))
                .isInstanceOf(com.university.clinic.exception.ConflictException.class)
                .hasMessageContaining("control");
    }

    @Test
    @DisplayName("update no debe fallar si el email es el mismo del registro actual")
    void updateShouldNotFailIfEmailIsTheSame() {
        Patient existing = new Patient();
        existing.setId(1L);
        existing.setEmail("juan@univ.edu");
        existing.setUniversityId("MAT-001");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdatePatientRequest request = new UpdatePatientRequest();
        request.setEmail("juan@univ.edu"); // mismo email

        PatientResponse response = patientService.update(1L, request);

        assertThat(response.getEmail()).isEqualTo("juan@univ.edu");
        verify(patientRepository, never()).existsByEmail(any());
    }
}
