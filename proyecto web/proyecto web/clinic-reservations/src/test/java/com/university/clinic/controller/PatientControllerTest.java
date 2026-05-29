package com.university.clinic.controller;

import com.university.clinic.dto.CreatePatientRequest;
import com.university.clinic.dto.PatientResponse;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.exception.GlobalExceptionHandler;
import com.university.clinic.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class PatientControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PatientService patientService;

    @InjectMocks
    private PatientController patientController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/patients - Valida request y crea paciente")
    void shouldCreatePatient() throws Exception {
        PatientResponse response = PatientResponse.builder().id(1L).firstName("Ana").build();

        when(patientService.create(any(CreatePatientRequest.class))).thenReturn(response);

        String jsonContent = "{\"firstName\":\"Ana\",\"lastName\":\"Gomez\",\"email\":\"ana@univ.edu\",\"phone\":\"1234\",\"universityId\":\"U999\"}";

        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonContent))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("GET /api/patients/{id} - Devuelve 404 si no existe")
    void shouldReturn404WhenNotFound() throws Exception {
        when(patientService.findById(99L)).thenThrow(new ResourceNotFoundException("Paciente", 99L));

        mockMvc.perform(get("/api/patients/99"))
                .andExpect(status().isNotFound());
    }
}
