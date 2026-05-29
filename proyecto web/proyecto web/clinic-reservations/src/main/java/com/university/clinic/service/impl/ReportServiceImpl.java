package com.university.clinic.service.impl;

import com.university.clinic.dto.DoctorProductivityResponse;
import com.university.clinic.dto.NoShowPatientResponse;
import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.dto.ReportResponse;
import com.university.clinic.entity.Appointment;
import com.university.clinic.repository.AppointmentRepository;
import com.university.clinic.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final AppointmentRepository appointmentRepository;

    @Override
    public ReportResponse generateReport(LocalDateTime from, LocalDateTime to) {
        long totalAppointments = appointmentRepository.countAppointmentsByDateRange(from, to);

        List<Object[]> statusRows = appointmentRepository.countAppointmentsByStatusGrouped(from, to);
        Map<String, Long> countByStatus = statusRows.stream()
                .collect(Collectors.toMap(
                        row -> ((com.university.clinic.entity.AppointmentStatus) row[0]).name(),
                        row -> ((Number) row[1]).longValue()
                ));

        List<Object[]> doctorRows = appointmentRepository.countAppointmentsByDoctorGrouped(from, to);
        Map<String, Long> countByDoctor = doctorRows.stream()
                .collect(Collectors.toMap(
                        row -> row[0] + " " + row[1],
                        row -> ((Number) row[2]).longValue()
                ));

        return ReportResponse.builder()
                .totalAppointments((int) totalAppointments)
                .countByStatus(countByStatus)
                .countByDoctor(countByDoctor)
                .build();
    }

    @Override
    public List<OfficeOccupancyResponse> getOfficeOccupancy(LocalDateTime from, LocalDateTime to) {
        List<Object[]> results = appointmentRepository.getOfficeOccupancyReport(from, to);
        return results.stream().map(row -> {
            Long officeId = ((Number) row[0]).longValue();
            String officeName = (String) row[1];
            Integer floor = (Integer) row[2];
            long total = ((Number) row[3]).longValue();
            long completed = ((Number) row[4]).longValue();
            long cancelled = ((Number) row[5]).longValue();

            double occupancy = total > 0 ? (double) completed / total * 100.0 : 0.0;
            return OfficeOccupancyResponse.builder()
                    .officeId(officeId)
                    .officeName(officeName)
                    .floor(floor)
                    .totalAppointments(total)
                    .completedAppointments(completed)
                    .cancelledAppointments(cancelled)
                    .occupancyPercentage(Math.round(occupancy * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<DoctorProductivityResponse> getDoctorProductivity(LocalDateTime from, LocalDateTime to) {
        List<Object[]> results = appointmentRepository.getDoctorProductivityReport(from, to);
        return results.stream().map(row -> {
            Long doctorId = ((Number) row[0]).longValue();
            String fullName = row[1] + " " + row[2];
            String specialtyName = ((String) row[3]).isEmpty() ? null : (String) row[3];
            long total = ((Number) row[4]).longValue();
            long completed = ((Number) row[5]).longValue();
            long cancelled = ((Number) row[6]).longValue();
            long noShow = ((Number) row[7]).longValue();

            double completionRate = total > 0 ? (double) completed / total * 100.0 : 0.0;

            return DoctorProductivityResponse.builder()
                    .doctorId(doctorId)
                    .doctorFullName(fullName)
                    .specialtyName(specialtyName)
                    .totalAppointments(total)
                    .completedAppointments(completed)
                    .cancelledAppointments(cancelled)
                    .noShowAppointments(noShow)
                    .completionRate(Math.round(completionRate * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<NoShowPatientResponse> getNoShowPatients(LocalDateTime from, LocalDateTime to) {
        List<Object[]> results = appointmentRepository.getNoShowPatientsReport(from, to);
        return results.stream().map(row -> {
            Long patientId = ((Number) row[0]).longValue();
            String fullName = row[1] + " " + row[2];
            String email = (String) row[3];
            String uuid = (String) row[4];
            long count = ((Number) row[5]).longValue();

            return NoShowPatientResponse.builder()
                    .patientId(patientId)
                    .patientFullName(fullName)
                    .email(email)
                    .universityId(uuid)
                    .noShowCount(count)
                    .build();
        }).collect(Collectors.toList());
    }
}
