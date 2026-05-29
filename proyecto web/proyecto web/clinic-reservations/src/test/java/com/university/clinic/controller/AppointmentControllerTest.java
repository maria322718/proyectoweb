package com.university.clinic.controller;

import com.university.clinic.dto.AppointmentResponse;
import com.university.clinic.dto.CreateAppointmentRequest;
import com.university.clinic.exception.ConflictException;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.exception.GlobalExceptionHandler;
import com.university.clinic.service.AppointmentService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class AppointmentControllerTest {

        private MockMvc mockMvc;

        @Mock
        private AppointmentService appointmentService;

        @InjectMocks
        private AppointmentController appointmentController;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(appointmentController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
        }

        @Test
        @DisplayName("POST /api/appointments - Debe retornar 201 Created")
        void shouldCreateAppointment() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.create(any(CreateAppointmentRequest.class))).thenReturn(response);

                String jsonContent = "{\"patientId\":1,\"doctorId\":1,\"officeId\":1,\"appointmentTypeId\":1,\"startAt\":\"2030-01-01T08:00:00\"}";

                mockMvc.perform(post("/api/appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(100L));
        }

        @Test
        @DisplayName("PUT /api/appointments/{id}/confirm - Debe confirmar cita")
        void shouldConfirmAppointment() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.confirm(100L)).thenReturn(response);

                mockMvc.perform(put("/api/appointments/100/confirm"))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("PUT /api/appointments/{id}/complete - Debe completar cita enviando notes opcionales")
        void shouldCompleteAppointmentWithNotes() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.complete(eq(100L),
                                any(com.university.clinic.dto.CompleteAppointmentRequest.class)))
                                .thenReturn(response);

                String jsonContent = "{\"notes\":\"Todo conforme\"}";

                mockMvc.perform(put("/api/appointments/100/complete")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("PUT /api/appointments/{id}/complete - Debe completar cita sin body (backward compatible)")
        void shouldCompleteAppointmentWithoutBody() throws Exception {
                AppointmentResponse response = AppointmentResponse.builder().id(100L).build();
                when(appointmentService.complete(100L)).thenReturn(response);

                mockMvc.perform(put("/api/appointments/100/complete"))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("POST /api/appointments - Debe retornar 409 si hay conflicto de horario")
        void shouldReturn409WhenConflict() throws Exception {
                when(appointmentService.create(any(CreateAppointmentRequest.class)))
                                .thenThrow(new ConflictException("El doctor tiene otra cita en este horario"));

                String jsonContent = "{\"patientId\":1,\"doctorId\":1,\"officeId\":1,\"appointmentTypeId\":1,\"startAt\":\"2030-01-01T08:00:00\"}";

                mockMvc.perform(post("/api/appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().is(409))
                                .andExpect(jsonPath("$.error").value("El doctor tiene otra cita en este horario"));
        }

        @Test
        @DisplayName("GET /api/appointments/{id} - Debe retornar 404 si no existe")
        void shouldReturn404WhenNotFound() throws Exception {
                when(appointmentService.findById(999L))
                                .thenThrow(new ResourceNotFoundException("Cita", 999L));

                mockMvc.perform(get("/api/appointments/999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.error").exists())
                                .andExpect(jsonPath("$.status").value(404))
                                .andExpect(jsonPath("$.error").value("Cita no encontrado con id: 999"));
        }

        @Test
        @DisplayName("POST /api/appointments - Debe retornar 400 por body incompleto")
        void shouldReturn400WhenValidationFails() throws Exception {
                // Enviar request sin fecha ni validaciones requeridas
                String jsonContent = "{\"patientId\":1}";

                mockMvc.perform(post("/api/appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonContent))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").exists())
                                .andExpect(jsonPath("$.fieldErrors").exists());
        }
}
