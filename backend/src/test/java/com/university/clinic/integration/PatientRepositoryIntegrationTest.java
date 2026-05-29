package com.university.clinic.integration;

import com.university.clinic.entity.Patient;
import com.university.clinic.entity.PatientStatus;
import com.university.clinic.repository.PatientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class PatientRepositoryIntegrationTest {

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
    private PatientRepository patientRepository;

    @Test
    @DisplayName("Debe guardar un paciente exitosamente en base de datos real")
    void shouldSavePatient() {
        Patient patient = new Patient();
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setEmail("jdoe@univ.edu");
        patient.setPhone("123456789");
        patient.setUniversityId("U12345");
        patient.setStatus(PatientStatus.ACTIVE);

        Patient saved = patientRepository.save(patient);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("existsByEmail debe retornar true si el email ya existe")
    void shouldReturnTrueWhenEmailExists() {
        Patient patient = new Patient();
        patient.setFirstName("Ana");
        patient.setLastName("López");
        patient.setEmail("ana.lopez@univ.edu");
        patient.setPhone("555000111");
        patient.setUniversityId("MAT-E1");
        patient.setStatus(PatientStatus.ACTIVE);
        patientRepository.save(patient);

        assertThat(patientRepository.existsByEmail("ana.lopez@univ.edu")).isTrue();
        assertThat(patientRepository.existsByEmail("noexiste@univ.edu")).isFalse();
    }

    @Test
    @DisplayName("existsByUniversityId debe retornar true si la matrícula ya existe")
    void shouldReturnTrueWhenUniversityIdExists() {
        Patient patient = new Patient();
        patient.setFirstName("Carlos");
        patient.setLastName("Ruiz");
        patient.setEmail("cruiz@univ.edu");
        patient.setPhone("555000222");
        patient.setUniversityId("MAT-U99");
        patient.setStatus(PatientStatus.ACTIVE);
        patientRepository.save(patient);

        assertThat(patientRepository.existsByUniversityId("MAT-U99")).isTrue();
        assertThat(patientRepository.existsByUniversityId("MAT-INEXISTENTE")).isFalse();
    }
}
