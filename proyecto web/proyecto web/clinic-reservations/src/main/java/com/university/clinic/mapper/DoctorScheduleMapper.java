package com.university.clinic.mapper;

import com.university.clinic.dto.DoctorScheduleResponse;
import com.university.clinic.entity.DoctorSchedule;
import org.springframework.stereotype.Component;

@Component
public class DoctorScheduleMapper {
    public DoctorScheduleResponse toResponse(DoctorSchedule schedule) {
        if (schedule == null) return null;
        return DoctorScheduleResponse.builder()
                .id(schedule.getId())
                .doctorId(schedule.getDoctor() != null ? schedule.getDoctor().getId() : null)
                .doctorFullName(schedule.getDoctor() != null ? schedule.getDoctor().getFirstName() + " " + schedule.getDoctor().getLastName() : null)
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .active(schedule.getActive())
                .createdAt(schedule.getCreatedAt())
                .build();
    }
}
