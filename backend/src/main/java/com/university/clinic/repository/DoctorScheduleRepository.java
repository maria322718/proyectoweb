package com.university.clinic.repository;

import com.university.clinic.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

    /** Busca horarios activos de un doctor para un día de la semana */
    List<DoctorSchedule> findByDoctorIdAndDayOfWeekAndActiveTrue(Long doctorId, DayOfWeek dayOfWeek);

    /** Todos los horarios activos de un doctor */
    List<DoctorSchedule> findByDoctorIdAndActiveTrue(Long doctorId);
}
