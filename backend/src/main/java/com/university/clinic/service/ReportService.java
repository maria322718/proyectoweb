package com.university.clinic.service;

import com.university.clinic.dto.DoctorProductivityResponse;
import com.university.clinic.dto.NoShowPatientResponse;
import com.university.clinic.dto.OfficeOccupancyResponse;
import com.university.clinic.dto.ReportResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {
    ReportResponse generateReport(LocalDateTime from, LocalDateTime to);
    List<OfficeOccupancyResponse> getOfficeOccupancy(LocalDateTime from, LocalDateTime to);
    List<DoctorProductivityResponse> getDoctorProductivity(LocalDateTime from, LocalDateTime to);
    List<NoShowPatientResponse> getNoShowPatients(LocalDateTime from, LocalDateTime to);
}
