package com.university.clinic.integration;

import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.DoctorSchedule;
import com.university.clinic.entity.Specialty;
import com.university.clinic.repository.DoctorRepository;
import com.university.clinic.repository.DoctorScheduleRepository;
import com.university.clinic.repository.SpecialtyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class DoctorScheduleRepositoryIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("clinic_db")
            .withUsername("postgres")
            .withPassword("postgres");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Test
    @DisplayName("Debe obtener schedules activos de un doctor")
    void shouldFindActiveSchedules() {
        Specialty spec = new Specialty();
        spec.setName("General");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor doctor = new Doctor();
        doctor.setFirstName("John");
        doctor.setLastName("Watson");
        doctor.setLicenseNumber("DOC111");
        doctor.setSpecialty(spec);
        doctor.setActive(true);
        doctorRepository.save(doctor);

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(DayOfWeek.MONDAY);
        schedule.setStartTime(LocalTime.of(8, 0));
        schedule.setEndTime(LocalTime.of(12, 0));
        schedule.setActive(true);
        scheduleRepository.save(schedule);

        List<DoctorSchedule> found = scheduleRepository.findByDoctorIdAndActiveTrue(doctor.getId());
        
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getDayOfWeek()).isEqualTo(DayOfWeek.MONDAY);
    }
}
