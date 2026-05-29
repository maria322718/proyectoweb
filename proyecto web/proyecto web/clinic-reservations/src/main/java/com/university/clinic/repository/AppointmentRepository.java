package com.university.clinic.repository;

import com.university.clinic.entity.Appointment;
import com.university.clinic.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Verifica si hay traslape de horario para un DOCTOR.
     * Equivalente en Laravel:
     *   Appointment::where('doctor_id', $doctorId)
     *       ->whereIn('status', ['SCHEDULED', 'CONFIRMED'])
     *       ->where('start_at', '<', $endAt)
     *       ->where('end_at', '>', $startAt)
     *       ->exists();
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
    """)
    boolean existsDoctorOverlap(@Param("doctorId") Long doctorId,
                                @Param("startAt") LocalDateTime startAt,
                                @Param("endAt") LocalDateTime endAt);

    /** Verifica traslape de horario para un CONSULTORIO */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.office.id = :officeId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
    """)
    boolean existsOfficeOverlap(@Param("officeId") Long officeId,
                                @Param("startAt") LocalDateTime startAt,
                                @Param("endAt") LocalDateTime endAt);

    /** Verifica traslape de horario para un PACIENTE */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.patient.id = :patientId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
    """)
    boolean existsPatientOverlap(@Param("patientId") Long patientId,
                                 @Param("startAt") LocalDateTime startAt,
                                 @Param("endAt") LocalDateTime endAt);

    /** Citas de un doctor en un rango de tiempo (para calcular disponibilidad) */
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.status IN (com.university.clinic.entity.AppointmentStatus.SCHEDULED,
                           com.university.clinic.entity.AppointmentStatus.CONFIRMED)
          AND a.startAt < :endAt
          AND a.endAt > :startAt
        ORDER BY a.startAt
    """)
    List<Appointment> findActiveDoctorAppointments(@Param("doctorId") Long doctorId,
                                                   @Param("startAt") LocalDateTime startAt,
                                                   @Param("endAt") LocalDateTime endAt);

    /** Filtro: citas por doctor */
    List<Appointment> findByDoctorId(Long doctorId);

    /** Filtro: citas por paciente */
    List<Appointment> findByPatientId(Long patientId);

    /** Filtro: citas por estado */
    List<Appointment> findByStatus(AppointmentStatus status);

    /** Filtro: citas en un rango de fechas */
    List<Appointment> findByStartAtBetween(LocalDateTime from, LocalDateTime to);

    /** Filtro: citas de un paciente por estado */
    List<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status);

    // ============================================
    // AGGREGATION QUERIES PARA REPORTES
    // ============================================

    @Query("SELECT a.office.id, a.office.name, a.office.floor, COUNT(a.id), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.COMPLETED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.CANCELLED THEN 1 ELSE 0 END) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to " +
           "GROUP BY a.office.id, a.office.name, a.office.floor")
    List<Object[]> getOfficeOccupancyReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.doctor.id, a.doctor.firstName, a.doctor.lastName, " +
           "COALESCE(a.doctor.specialty.name, ''), COUNT(a.id), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.COMPLETED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.CANCELLED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.NO_SHOW THEN 1 ELSE 0 END) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to " +
           "GROUP BY a.doctor.id, a.doctor.firstName, a.doctor.lastName, a.doctor.specialty.name")
    List<Object[]> getDoctorProductivityReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.patient.id, a.patient.firstName, a.patient.lastName, a.patient.email, a.patient.universityId, COUNT(a.id) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to AND a.status = com.university.clinic.entity.AppointmentStatus.NO_SHOW " +
           "GROUP BY a.patient.id, a.patient.firstName, a.patient.lastName, a.patient.email, a.patient.universityId")
    List<Object[]> getNoShowPatientsReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.doctor.specialty.id, COALESCE(a.doctor.specialty.name, 'Sin especialidad'), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.CANCELLED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = com.university.clinic.entity.AppointmentStatus.NO_SHOW THEN 1 ELSE 0 END) " +
           "FROM Appointment a " +
           "WHERE a.startAt BETWEEN :from AND :to " +
           "GROUP BY a.doctor.specialty.id, a.doctor.specialty.name")
    List<Object[]> getCancelledAndNoShowBySpecialtyReport(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ============================================
    // AGGREGATION QUERIES PARA GENERATE_REPORT GENERAL
    // ============================================

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.startAt BETWEEN :from AND :to")
    long countAppointmentsByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.status, COUNT(a.id) FROM Appointment a WHERE a.startAt BETWEEN :from AND :to GROUP BY a.status")
    List<Object[]> countAppointmentsByStatusGrouped(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT a.doctor.firstName, a.doctor.lastName, COUNT(a.id) FROM Appointment a WHERE a.startAt BETWEEN :from AND :to GROUP BY a.doctor.firstName, a.doctor.lastName")
    List<Object[]> countAppointmentsByDoctorGrouped(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Filtro: citas por doctor y estado */
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    /** Reportes: contar citas por estado */
    long countByStatus(AppointmentStatus status);

    /** Reportes: contar citas por doctor y estado */
    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);
}
