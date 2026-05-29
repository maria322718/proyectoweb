package com.university.clinic.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Representa un slot de tiempo disponible para agendar cita.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlotResponse {
    private LocalDateTime startAt;
    private LocalDateTime endAt;
}
