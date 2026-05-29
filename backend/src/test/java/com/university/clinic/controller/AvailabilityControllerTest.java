package com.university.clinic.controller;

import com.university.clinic.service.AvailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class AvailabilityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AvailabilityService availabilityService;

    @InjectMocks
    private AvailabilityController availabilityController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(availabilityController).build();
    }

    @Test
    @DisplayName("GET /api/availability/doctors/{doctorId} - Llama al servicio y retorna array")
    void shouldGetAvailability() throws Exception {
        com.university.clinic.dto.AvailabilitySlotResponse slot = com.university.clinic.dto.AvailabilitySlotResponse.builder()
                .startAt(java.time.LocalDateTime.of(2026, 4, 10, 8, 0))
                .endAt(java.time.LocalDateTime.of(2026, 4, 10, 8, 30))
                .build();
                
        when(availabilityService.getAvailability(eq(1L), any(), anyInt()))
                .thenReturn(List.of(slot));

        mockMvc.perform(get("/api/availability/doctors/1")
                .param("date", "2026-04-10")
                .param("durationMinutes", "30"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].startAt").value("2026-04-10T08:00:00"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].endAt").value("2026-04-10T08:30:00"));
    }
}
