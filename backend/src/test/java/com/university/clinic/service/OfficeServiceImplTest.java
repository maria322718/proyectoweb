package com.university.clinic.service;

import com.university.clinic.dto.OfficeResponse;
import com.university.clinic.dto.UpdateOfficeRequest;
import com.university.clinic.entity.Office;
import com.university.clinic.entity.OfficeStatus;
import com.university.clinic.mapper.OfficeMapper;
import com.university.clinic.repository.OfficeRepository;
import com.university.clinic.service.impl.OfficeServiceImpl;
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
class OfficeServiceImplTest {

    @Mock
    private OfficeRepository officeRepository;

    @Spy
    private OfficeMapper officeMapper;

    @InjectMocks
    private OfficeServiceImpl officeService;

    @Test
    @DisplayName("Update debe actualizar status cuando viene informado")
    void updateShouldChangeStatusWhenProvided() {
        Office existing = new Office();
        existing.setId(1L);
        existing.setName("Consultorio 101");
        existing.setFloor(1);
        existing.setStatus(OfficeStatus.ACTIVE);

        when(officeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(officeRepository.save(any(Office.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateOfficeRequest request = new UpdateOfficeRequest();
        request.setStatus(OfficeStatus.UNDER_MAINTENANCE);

        OfficeResponse response = officeService.update(1L, request);

        assertThat(response.getStatus()).isEqualTo(OfficeStatus.UNDER_MAINTENANCE);
        assertThat(response.getName()).isEqualTo("Consultorio 101");
        assertThat(response.getFloor()).isEqualTo(1);
    }

    @Test
    @DisplayName("Update parcial no debe borrar campos existentes cuando llegan null")
    void partialUpdateShouldPreserveExistingFields() {
        Office existing = new Office();
        existing.setId(1L);
        existing.setName("Consultorio 202");
        existing.setFloor(2);
        existing.setStatus(OfficeStatus.ACTIVE);

        when(officeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(officeRepository.save(any(Office.class))).thenAnswer(inv -> inv.getArgument(0));

        // Solo actualizar nombre, dejar floor y status null
        UpdateOfficeRequest request = new UpdateOfficeRequest();
        request.setName("Consultorio 202A");

        OfficeResponse response = officeService.update(1L, request);

        assertThat(response.getName()).isEqualTo("Consultorio 202A");
        assertThat(response.getFloor()).isEqualTo(2);
        assertThat(response.getStatus()).isEqualTo(OfficeStatus.ACTIVE);
    }
}
