package com.university.clinic.service;

import com.university.clinic.dto.CreateSpecialtyRequest;
import com.university.clinic.dto.SpecialtyResponse;
import com.university.clinic.entity.Specialty;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.mapper.SpecialtyMapper;
import com.university.clinic.repository.SpecialtyRepository;
import com.university.clinic.service.impl.SpecialtyServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpecialtyServiceImplTest {

    @Mock
    private SpecialtyRepository specialtyRepository;

    @Spy
    private SpecialtyMapper specialtyMapper;

    @InjectMocks
    private SpecialtyServiceImpl specialtyService;

    @Test
    @DisplayName("create falla si existsByNameIgnoreCase es true")
    void createShouldFailIfNameExists() {
        CreateSpecialtyRequest request = new CreateSpecialtyRequest();
        request.setName("Cardiología");

        when(specialtyRepository.existsByNameIgnoreCase("Cardiología")).thenReturn(true);

        assertThatThrownBy(() -> specialtyService.create(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }

    @Test
    @DisplayName("update no falla si el nombre es el mismo ignorando mayúsculas/minúsculas")
    void updateShouldNotFailIfNameIsSameIgnoreCase() {
        Specialty existing = new Specialty();
        existing.setId(1L);
        existing.setName("Cardiología");

        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(specialtyRepository.save(any(Specialty.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateSpecialtyRequest request = new CreateSpecialtyRequest();
        request.setName("CARDIOLOGÍA"); // mismo nombre, distinto case

        SpecialtyResponse response = specialtyService.update(1L, request);

        assertThat(response).isNotNull();
        verify(specialtyRepository, never()).existsByNameIgnoreCase(any());
    }

    @Test
    @DisplayName("update falla si cambia a un nombre ya existente")
    void updateShouldFailIfNameChangesToExisting() {
        Specialty existing = new Specialty();
        existing.setId(1L);
        existing.setName("Pediatría");

        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(specialtyRepository.existsByNameIgnoreCase("Cardiología")).thenReturn(true);

        CreateSpecialtyRequest request = new CreateSpecialtyRequest();
        request.setName("Cardiología");

        assertThatThrownBy(() -> specialtyService.update(1L, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }
}
