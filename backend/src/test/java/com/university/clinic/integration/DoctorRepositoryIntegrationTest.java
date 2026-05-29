package com.university.clinic.integration;

import com.university.clinic.entity.Doctor;
import com.university.clinic.entity.Specialty;
import com.university.clinic.repository.DoctorRepository;
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

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class DoctorRepositoryIntegrationTest {

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
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Test
    @DisplayName("Debe guardar un doctor correctamente con su especialidad")
    void shouldSaveDoctor() {
        Specialty specialty = new Specialty();
        specialty.setName("Cardiology");
        specialty.setActive(true);
        specialtyRepository.save(specialty);

        Doctor doctor = new Doctor();
        doctor.setFirstName("House");
        doctor.setLastName("Gregory");
        doctor.setLicenseNumber("MED999");
        doctor.setSpecialty(specialty);
        doctor.setActive(true);

        Doctor saved = doctorRepository.save(doctor);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getSpecialty().getName()).isEqualTo("Cardiology");
    }

    @Test
    @DisplayName("findBySpecialtyId debe retornar doctores de esa especialidad")
    void shouldFindDoctorsBySpecialtyId() {
        Specialty cardio = new Specialty();
        cardio.setName("Cardiología IT");
        cardio.setActive(true);
        specialtyRepository.save(cardio);

        Specialty neuro = new Specialty();
        neuro.setName("Neurología IT");
        neuro.setActive(true);
        specialtyRepository.save(neuro);

        Doctor doc1 = new Doctor();
        doc1.setFirstName("Doc1");
        doc1.setLastName("Cardio");
        doc1.setLicenseNumber("LIC-C1");
        doc1.setSpecialty(cardio);
        doc1.setActive(true);
        doctorRepository.save(doc1);

        Doctor doc2 = new Doctor();
        doc2.setFirstName("Doc2");
        doc2.setLastName("Neuro");
        doc2.setLicenseNumber("LIC-N1");
        doc2.setSpecialty(neuro);
        doc2.setActive(true);
        doctorRepository.save(doc2);

        var cardioDoctors = doctorRepository.findBySpecialtyId(cardio.getId());
        assertThat(cardioDoctors).hasSize(1);
        assertThat(cardioDoctors.get(0).getFirstName()).isEqualTo("Doc1");
    }

    @Test
    @DisplayName("findByActiveTrue debe retornar solo doctores activos")
    void shouldFindOnlyActiveDoctors() {
        Specialty spec = new Specialty();
        spec.setName("General IT");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor active = new Doctor();
        active.setFirstName("Activo");
        active.setLastName("Doc");
        active.setLicenseNumber("LIC-A1");
        active.setSpecialty(spec);
        active.setActive(true);
        doctorRepository.save(active);

        Doctor inactive = new Doctor();
        inactive.setFirstName("Inactivo");
        inactive.setLastName("Doc");
        inactive.setLicenseNumber("LIC-I1");
        inactive.setSpecialty(spec);
        inactive.setActive(false);
        doctorRepository.save(inactive);

        var activeDoctors = doctorRepository.findByActiveTrue();
        assertThat(activeDoctors).allMatch(Doctor::getActive);
        assertThat(activeDoctors.stream().anyMatch(d -> d.getFirstName().equals("Activo"))).isTrue();
        assertThat(activeDoctors.stream().noneMatch(d -> d.getFirstName().equals("Inactivo"))).isTrue();
    }

    @Test
    @DisplayName("existsByLicenseNumber debe retornar true si la licencia ya existe")
    void shouldReturnTrueWhenLicenseExists() {
        Specialty spec = new Specialty();
        spec.setName("Pediatría IT");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor doctor = new Doctor();
        doctor.setFirstName("Pedro");
        doctor.setLastName("Licencia");
        doctor.setLicenseNumber("LIC-UNICA-99");
        doctor.setSpecialty(spec);
        doctor.setActive(true);
        doctorRepository.save(doctor);

        assertThat(doctorRepository.existsByLicenseNumber("LIC-UNICA-99")).isTrue();
        assertThat(doctorRepository.existsByLicenseNumber("LIC-INEXISTENTE")).isFalse();
    }

    @Test
    @DisplayName("findBySpecialtyIdAndActiveTrue debe retornar solo doctores activos de esa especialidad")
    void shouldFindActiveDoctorsBySpecialtyId() {
        Specialty spec = new Specialty();
        spec.setName("Traumatología");
        spec.setActive(true);
        specialtyRepository.save(spec);

        Doctor activeDoc = new Doctor();
        activeDoc.setFirstName("Juan");
        activeDoc.setLastName("Activo");
        activeDoc.setLicenseNumber("TRM-1");
        activeDoc.setSpecialty(spec);
        activeDoc.setActive(true);
        doctorRepository.save(activeDoc);

        Doctor inactiveDoc = new Doctor();
        inactiveDoc.setFirstName("Pedro");
        inactiveDoc.setLastName("Inactivo");
        inactiveDoc.setLicenseNumber("TRM-2");
        inactiveDoc.setSpecialty(spec);
        inactiveDoc.setActive(false);
        doctorRepository.save(inactiveDoc);

        var activeDoctors = doctorRepository.findBySpecialtyIdAndActiveTrue(spec.getId());
        assertThat(activeDoctors).hasSize(1);
        assertThat(activeDoctors.get(0).getFirstName()).isEqualTo("Juan");
    }
}
