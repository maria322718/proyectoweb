package com.university.clinic.service;

import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.repository.AppointmentRepository;
import com.university.clinic.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    @Test
    @DisplayName("Debe mapear correctamente Object[] de repositorio a OfficeOccupancyResponse")
    void shouldMapOfficeOccupancyCorrectly() {
        // Formato esperado de repository:
        // office.id, office.name, office.floor, COUNT(a.id),
        // SUM(COMPLETED), SUM(CANCELLED)
        Object[] row = new Object[]{
                1L, "Consultorio A", 2, 10L, 8L, 2L
        };

        when(appointmentRepository.getOfficeOccupancyReport(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(java.util.Collections.singletonList(row));

        List<OfficeOccupancyResponse> result = reportService.getOfficeOccupancy(LocalDateTime.now().minusDays(1), LocalDateTime.now());

        assertThat(result).hasSize(1);
        OfficeOccupancyResponse response = result.get(0);
        
        assertThat(response.getOfficeId()).isEqualTo(1L);
        assertThat(response.getOfficeName()).isEqualTo("Consultorio A");
        assertThat(response.getFloor()).isEqualTo(2);
        assertThat(response.getTotalAppointments()).isEqualTo(10L);
        assertThat(response.getCompletedAppointments()).isEqualTo(8L);
        assertThat(response.getCancelledAppointments()).isEqualTo(2L);
        
        // occupancyPercentage: (8 / 10) * 100 = 80.0
        assertThat(response.getOccupancyPercentage()).isEqualTo(80.0);
    }
    @Test
    @DisplayName("Debe mapear correctamente Object[] a DoctorProductivityResponse")
    void shouldMapDoctorProductivityCorrectly() {
        Object[] row = new Object[]{
                1L, "Juan", "Perez", "Cardiologia", 20L, 15L, 3L, 2L
        };

        when(appointmentRepository.getDoctorProductivityReport(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(java.util.Collections.singletonList(row));

        List<com.university.clinic.dto.DoctorProductivityResponse> result = reportService.getDoctorProductivity(LocalDateTime.now().minusDays(1), LocalDateTime.now());

        assertThat(result).hasSize(1);
        com.university.clinic.dto.DoctorProductivityResponse response = result.get(0);
        
        assertThat(response.getDoctorId()).isEqualTo(1L);
        assertThat(response.getDoctorFullName()).isEqualTo("Juan Perez");
        assertThat(response.getSpecialtyName()).isEqualTo("Cardiologia");
        assertThat(response.getTotalAppointments()).isEqualTo(20L);
        assertThat(response.getCompletedAppointments()).isEqualTo(15L);
        assertThat(response.getCancelledAppointments()).isEqualTo(3L);
        assertThat(response.getNoShowAppointments()).isEqualTo(2L);
        
        // completionRate: (15 / 20) * 100 = 75.0
        assertThat(response.getCompletionRate()).isEqualTo(75.0);
    }

    @Test
    @DisplayName("Debe mapear correctamente Object[] a NoShowPatientResponse")
    void shouldMapNoShowPatientsCorrectly() {
        Object[] row = new Object[]{
                5L, "Maria", "Gomez", "maria@mail.com", "U123", 4L
        };

        when(appointmentRepository.getNoShowPatientsReport(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(java.util.Collections.singletonList(row));

        List<com.university.clinic.dto.NoShowPatientResponse> result = reportService.getNoShowPatients(LocalDateTime.now().minusDays(1), LocalDateTime.now());

        assertThat(result).hasSize(1);
        com.university.clinic.dto.NoShowPatientResponse response = result.get(0);
        
        assertThat(response.getPatientId()).isEqualTo(5L);
        assertThat(response.getPatientFullName()).isEqualTo("Maria Gomez");
        assertThat(response.getEmail()).isEqualTo("maria@mail.com");
        assertThat(response.getUniversityId()).isEqualTo("U123");
        assertThat(response.getNoShowCount()).isEqualTo(4L);
    }
}
