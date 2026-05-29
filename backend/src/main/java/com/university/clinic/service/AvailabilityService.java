package com.university.clinic.service;

import com.university.clinic.dto.AvailabilitySlotResponse;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityService {
    List<AvailabilitySlotResponse> getAvailability(Long doctorId, LocalDate date, int slotDurationMinutes);
}
