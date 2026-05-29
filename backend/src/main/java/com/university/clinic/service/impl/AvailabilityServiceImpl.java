package com.university.clinic.service.impl;

import com.university.clinic.dto.AvailabilitySlotResponse;
import com.university.clinic.entity.Appointment;
import com.university.clinic.entity.DoctorSchedule;
import com.university.clinic.exception.ResourceNotFoundException;
import com.university.clinic.repository.AppointmentRepository;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.DoctorScheduleRepository;
import com.university.clinic.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final DoctorScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public List<AvailabilitySlotResponse> getAvailability(Long doctorId, LocalDate date, int slotDurationMinutes) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor", doctorId);
        }

        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, date.getDayOfWeek());
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        List<Appointment> existingAppointments = appointmentRepository.findActiveDoctorAppointments(doctorId, startOfDay, endOfDay);
        
        List<AvailabilitySlotResponse> availableSlots = new ArrayList<>();
        
        for (DoctorSchedule schedule : schedules) {
            LocalTime currentSlotTime = schedule.getStartTime();
            LocalTime endTime = schedule.getEndTime();
            
            while (currentSlotTime.plusMinutes(slotDurationMinutes).isBefore(endTime) || 
                   currentSlotTime.plusMinutes(slotDurationMinutes).equals(endTime)) {
                
                LocalDateTime slotStart = date.atTime(currentSlotTime);
                LocalDateTime slotEnd = slotStart.plusMinutes(slotDurationMinutes);
                
                boolean isOverlapping = existingAppointments.stream().anyMatch(appointment -> {
                    LocalDateTime aptStart = appointment.getStartAt();
                    LocalDateTime aptEnd = appointment.getEndAt();
                    return slotStart.isBefore(aptEnd) && aptStart.isBefore(slotEnd);
                });
                
                if (!isOverlapping) {
                    availableSlots.add(AvailabilitySlotResponse.builder()
                            .startAt(slotStart)
                            .endAt(slotEnd)
                            .build());
                }
                
                currentSlotTime = currentSlotTime.plusMinutes(slotDurationMinutes);
            }
        }
        
        return availableSlots;
    }
}
