package com.university.clinic.integration;

import com.university.clinic.entity.Office;
import com.university.clinic.entity.OfficeStatus;
import com.university.clinic.repository.OfficeRepository;
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
public class OfficeRepositoryIntegrationTest {

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
    private OfficeRepository officeRepository;

    @Test
    @DisplayName("Debe gestionar consultorios y estado en base de datos")
    void shouldSaveOffice() {
        Office office = new Office();
        office.setName("A101");
        office.setFloor(1);
        office.setStatus(OfficeStatus.ACTIVE);

        Office saved = officeRepository.save(office);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(OfficeStatus.ACTIVE);
    }

    @Test
    @DisplayName("Debe encontrar consultorio por ID tras guardarlo")
    void shouldFindOfficeById() {
        Office office = new Office();
        office.setName("B202");
        office.setFloor(2);
        office.setStatus(OfficeStatus.ACTIVE);
        Office saved = officeRepository.save(office);

        Office found = officeRepository.findById(saved.getId()).orElseThrow();

        assertThat(found.getName()).isEqualTo("B202");
        assertThat(found.getFloor()).isEqualTo(2);
    }
}
