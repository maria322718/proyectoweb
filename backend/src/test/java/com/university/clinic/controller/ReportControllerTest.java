package com.university.clinic.controller;

import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.exception.GlobalExceptionHandler;
import com.university.clinic.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class ReportControllerTest {

        private MockMvc mockMvc;

        @Mock
        private ReportService reportService;

        @InjectMocks
        private ReportController reportController;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(reportController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
        }

        @Test
        @DisplayName("GET /api/reports/office-occupancy - Debe retornar 200 y la lista")
        void shouldReturnOfficeOccupancy() throws Exception {
                OfficeOccupancyResponse response = OfficeOccupancyResponse.builder()
                                .officeId(1L)
                                .officeName("Consultorio Test")
                                .totalAppointments(10L)
                                .build();

                when(reportService.getOfficeOccupancy(any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(List.of(response));

                mockMvc.perform(get("/api/reports/office-occupancy")
                                .param("from", "2026-04-01T00:00:00")
                                .param("to", "2026-04-30T23:59:59"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].officeId").value(1L))
                                .andExpect(jsonPath("$[0].officeName").value("Consultorio Test"));
        }
        @Test
        @DisplayName("GET /api/reports/doctor-productivity - Debe retornar 200 y la lista")
        void shouldReturnDoctorProductivity() throws Exception {
                com.university.clinic.dto.DoctorProductivityResponse response =
                                com.university.clinic.dto.DoctorProductivityResponse.builder()
                                                .doctorId(1L)
                                                .doctorFullName("Dr. Prueba")
                                                .totalAppointments(5L)
                                                .build();

                when(reportService.getDoctorProductivity(any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(List.of(response));

                mockMvc.perform(get("/api/reports/doctor-productivity")
                                .param("from", "2026-04-01T00:00:00")
                                .param("to", "2026-04-30T23:59:59"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].doctorId").value(1L))
                                .andExpect(jsonPath("$[0].doctorFullName").value("Dr. Prueba"));
        }

        @Test
        @DisplayName("GET /api/reports/no-show-patients - Debe retornar 200 y la lista")
        void shouldReturnNoShowPatients() throws Exception {
                com.university.clinic.dto.NoShowPatientResponse response =
                                com.university.clinic.dto.NoShowPatientResponse.builder()
                                                .patientId(1L)
                                                .patientFullName("Paciente Prueba")
                                                .noShowCount(2L)
                                                .build();

                when(reportService.getNoShowPatients(any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(List.of(response));

                mockMvc.perform(get("/api/reports/no-show-patients")
                                .param("from", "2026-04-01T00:00:00")
                                .param("to", "2026-04-30T23:59:59"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].patientId").value(1L))
                                .andExpect(jsonPath("$[0].patientFullName").value("Paciente Prueba"));
        }
}
