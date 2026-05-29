package com.university.clinic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicación.
 * Equivalente a "public/index.php" + "bootstrap/app.php" en Laravel.
 *
 * @SpringBootApplication combina:
 *  - @Configuration  (como config/app.php)
 *  - @EnableAutoConfiguration (auto-configura JPA, Web, etc.)
 *  - @ComponentScan (busca @Controller, @Service, @Repository en este paquete)
 */
@SpringBootApplication
public class ClinicReservationsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicReservationsApplication.class, args);
    }
}
