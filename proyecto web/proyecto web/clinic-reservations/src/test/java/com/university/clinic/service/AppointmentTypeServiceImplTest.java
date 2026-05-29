package com.university.clinic.service;

import com.university.clinic.dto.AppointmentTypeResponse;
import com.university.clinic.dto.CreateAppointmentTypeRequest;
import com.university.clinic.entity.AppointmentType;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.mapper.AppointmentTypeMapper;
import com.university.clinic.repository.AppointmentTypeRepository;
import com.university.clinic.service.impl.AppointmentTypeServiceImpl;
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
class AppointmentTypeServiceImplTest {

    @Mock
    private AppointmentTypeRepository typeRepository;

    @Spy
    private AppointmentTypeMapper typeMapper;

    @InjectMocks
    private AppointmentTypeServiceImpl typeService;

    @Test
    @DisplayName("create falla si existsByNameIgnoreCase es true")
    void createShouldFailIfNameExists() {
        CreateAppointmentTypeRequest request = new CreateAppointmentTypeRequest();
        request.setName("Primera Vez");
        request.setDurationMinutes(30);

        when(typeRepository.existsByNameIgnoreCase("Primera Vez")).thenReturn(true);

        assertThatThrownBy(() -> typeService.create(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }

    @Test
    @DisplayName("update no falla si el nombre es el mismo ignorando mayúsculas/minúsculas")
    void updateShouldNotFailIfNameIsSameIgnoreCase() {
        AppointmentType existing = new AppointmentType();
        existing.setId(1L);
        existing.setName("Revisión");
        existing.setDurationMinutes(30);

        when(typeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(typeRepository.save(any(AppointmentType.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateAppointmentTypeRequest request = new CreateAppointmentTypeRequest();
        request.setName("REVISIÓN"); // mismo nombre, distinto case

        AppointmentTypeResponse response = typeService.update(1L, request);

        assertThat(response).isNotNull();
        verify(typeRepository, never()).existsByNameIgnoreCase(any());
    }

    @Test
    @DisplayName("update falla si cambia a un nombre ya existente")
    void updateShouldFailIfNameChangesToExisting() {
        AppointmentType existing = new AppointmentType();
        existing.setId(1L);
        existing.setName("Seguimiento");
        existing.setDurationMinutes(30);

        when(typeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(typeRepository.existsByNameIgnoreCase("Revisión")).thenReturn(true);

        CreateAppointmentTypeRequest request = new CreateAppointmentTypeRequest();
        request.setName("Revisión");

        assertThatThrownBy(() -> typeService.update(1L, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("nombre");
    }
}
