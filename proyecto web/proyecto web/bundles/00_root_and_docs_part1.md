# Bundle 00_root_and_docs

Proyecto: `clinic-reservations`
Grupo: `00_root_and_docs`
### Archivo: `MER.md`
- Bytes: 5100
- Encoding detectado: utf-8

```md
# Modelo Entidad-Relación (MER): Sistema de Citas Médicas

Este documento contiene la representación y diccionario de datos base para las entidades implicadas en el backend del sistema de reservaciones de la clínica universitaria.

## Resumen de Entidades Principales y Descripción

1. **Patient (Paciente)**: Almacena los perfiles demográficos de los clientes o asistentes a la clínica.
2. **Doctor**: Agrupa a los especialistas disponibles adscritos al centro.
3. **Specialty (Especialidad)**: Catálogo base centralizado de las ramas de la medicina disponibles para cita.
4. **Office (Consultorio)**: Espacios destinados a prestar el servicio físico.
5. **AppointmentType (Tipo de Cita)**: Clasifica las citas según el contexto clínico, definiendo el tiempo estándar por defecto a reservar.
6. **DoctorSchedule (Horario Medico)**: Las franjas de disponibilidad en la semana del médico para automatizar confirmaciones de agenda.
7. **Appointment (Cita)**: La tabla transaccional fundamental que cruza entidades registrando el momento en el que convergen Pacientes, Doctores y Consultorios bajo un tipo de Cita.

---

## Atributos Principales, Relaciones y Cardinalidad

### 🏥 Entidad: Patient
- **Atributos:** `id` (PK), `first_name`, `last_name`, `university_id`, `email`, `phone`, `status` (enum: ACTIVE, INACTIVE), `created_at`, `updated_at`
- **Relaciones:** Puede tener MUCHAS Citas (`1 a N`).

### 👨‍⚕️ Entidad: Doctor
- **Atributos:** `id` (PK), `first_name`, `last_name`, `license_number`, `specialty_id` (FK), `active` (boolean), `created_at`, `updated_at`
- **Relaciones:**
    - Pertenece a UNA Especialidad (`N a 1`).
    - Posee MUCHOS Horarios configurados (`1 a N`).
    - Es asignado a MUCHAS Citas (`1 a N`).

### 🔬 Entidad: Specialty
- **Atributos:** `id` (PK), `name`, `active` (boolean), `created_at`, `updated_at`
- **Relaciones:** Puede clasificar a MUCHOS Doctores (`1 a N`).

### 🏢 Entidad: Office
- **Atributos:** `id` (PK), `name`, `floor` (integer), `status` (enum: ACTIVE, INACTIVE, UNDER_MAINTENANCE), `created_at`, `updated_at`
- **Relaciones:** Una oficina puede albergar MUCHAS citas (en diferentes horarios) (`1 a N`).

### 📑 Entidad: AppointmentType
- **Atributos:** `id` (PK), `name`, `duration_minutes` (integer), `active` (boolean), `created_at`, `updated_at`
- **Relaciones:** Aplica a MUCHAS Citas (`1 a N`).

### 🕒 Entidad: DoctorSchedule
- **Atributos:** `id` (PK), `doctor_id` (FK), `day_of_week` (enum: MONDAY–SUNDAY), `start_time` (time), `end_time` (time), `active` (boolean), `created_at`, `updated_at`
- **Relaciones:** Pertenece exclusivamente a UN doctor base.

### 📅 Entidad: Appointment
- **Atributos:** `id` (PK), `patient_id` (FK), `doctor_id` (FK), `office_id` (FK), `appointment_type_id` (FK), `start_at` (datetime), `end_at` (datetime), `status` (enum: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW), `notes`, `created_at`, `updated_at`
- **Relaciones:** Es la tabla pivote principal. Se asocia mediante FK con UN paciente, UN doctor, UN consultorio y UN tipo de cita (`4 dependencias fuertes 1 a 1 transaccionalmente`).

---

## Representación Mermaid (ER Diagram)

Dicho modelo visual puede ser exportado e importado de manera nativa en herramientas como *Draw.io*:

```mermaid
erDiagram
    Patient {
        bigint id PK
        string first_name
        string last_name
        string university_id
        string email
        string phone
        enum status
        datetime created_at
        datetime updated_at
    }

    Doctor {
        bigint id PK
        string first_name
        string last_name
        string license_number
        boolean active
        bigint specialty_id FK
        datetime created_at
        datetime updated_at
    }

    Specialty {
        bigint id PK
        string name
        boolean active
        datetime created_at
        datetime updated_at
    }

    Office {
        bigint id PK
        string name
        int floor
        enum status
        datetime created_at
        datetime updated_at
    }

    AppointmentType {
        bigint id PK
        string name
        int duration_minutes
        boolean active
        datetime created_at
        datetime updated_at
    }

    DoctorSchedule {
        bigint id PK
        enum day_of_week
        time start_time
        time end_time
        boolean active
        bigint doctor_id FK
        datetime created_at
        datetime updated_at
    }

    Appointment {
        bigint id PK
        datetime start_at
        datetime end_at
        enum status
        string notes
        bigint patient_id FK
        bigint doctor_id FK
        bigint office_id FK
        bigint appointment_type_id FK
        datetime created_at
        datetime updated_at
    }

    %% Relaciones / Cardinalidades
    Specialty ||--o{ Doctor : "clasifica a"
    Doctor ||--o{ DoctorSchedule : "cuenta con"
    Patient ||--o{ Appointment : "solicita"
    Doctor ||--o{ Appointment : "atiende"
    Office ||--o{ Appointment : "alberga"
    AppointmentType ||--o{ Appointment : "es de tipo"
```

```

---

### Archivo: `README.md`
- Bytes: 5275
- Encoding detectado: utf-8

```md
# Sistema de Gestión de Citas Médicas - Taller Universitario

## 1. Descripción General del Sistema
Este es un sistema robusto para la reserva, gestión y administración de citas médicas diseñado para entornos universitarios y clínicos, permitiendo el control del ciclo de vida completo de atenciones.
El sistema administra médicos, sus especialidades y horarios, así como a pacientes, consultorios, tipos de cita y los registros operativos para la toma de decisiones clínicas mediante reportes de uso y desempeño.

## 2. Stack Tecnológico
El proyecto hace uso intensivo de tecnologías modernas de backend alineado con estándares académicos e industriales actuales:
- **Java 21**
- **Spring Boot 4**
- **PostgreSQL**
- **Testcontainers**
- **JUnit 5**
- **Mockito**
- **Maven**

## 3. Arquitectura por Capas
El proyecto implementa una arquitectura multicapa (N-Tier) convencional limpia con Spring Boot:
- **Capa Entidad / Dominio**: Objetos mapeados a la base de datos a través de JPA/Hibernate (Entities).
- **Capa Repositorio (Data Access)**: Subinterfaces `JpaRepository` delegando las interacciones a la base de datos.
- **Capa de Servicio (Lógica de Negocio)**: Implementación de contratos (Interfaces) y clases concretas de servicio donde residen las validaciones de negocio, previniendo acoplamiento.
- **Capa Controlador (Presentación/API)**: Clases con `@RestController` que manejan todas las solicitudes HTTP, el parseo del payload y las devoluciones del API estructuradas.

## 4. Modelo de Datos Resumido
El sistema se compone de entidades transaccionales centrales interrelacionadas:
- **Patient**: Manejo de historial y datos del usuario del servicio.
- **Doctor & Specialty**: Personal médico adscrito a una especialidad.
- **DoctorSchedule**: Disponibilidad del médico a lo largo de la semana.
- **Office**: Espacio físico destinado a la labor médica.
- **AppointmentType**: Definición paramétrica de los tipos de servicio/procedimiento y sus duraciones.
- **Appointment**: La tabla pivote/transaccional más importante. Conecta todas las restricciones temporales.

Para más detalle a nivel de diagramas e integridad referencial, consulta [MER.md](./MER.md).

## 5. Reglas de Negocio Principales
- Un doctor está asociado obligatoriamente a una especialidad.
- Un doctor necesita horarios parametrizados (`DoctorSchedule`) para estar disponible para tomar citas.
- Las citas (`Appointment`) vinculan inherentemente al paciente, doctor, consultorio y duración según tipo de consulta (`AppointmentType`).
- Al crear una cita, el sistema valida que el rango horario caiga dentro de un `DoctorSchedule` activo del doctor para ese día de la semana.
- Un consultorio (`Office`) solo puede estar en uso en una cita a la vez, garantizando nulas colisiones.
- El ciclo de vida de la Cita de forma general: `SCHEDULED` -> `CONFIRMED` -> `COMPLETED` / `CANCELLED` / `NO_SHOW`.

## 6. Base de Datos: Cómo levantar PostgreSQL con Docker
Para habilitar el servicio de datos usando Docker, corre el siguiente comando (puedes detener y remover uno existente primero de ser necesario):

Si cuentas con un archivo `docker-compose.yml` en la raíz del proyecto, puedes levantar el servicio ejecutando:

```bash
docker compose up -d
```

Alternativamente, puedes correr un contenedor directamente:

```bash
docker run --name pg-clinic -e POSTGRES_DB=consultorios_db -e POSTGRES_USER=consultorios_user -e POSTGRES_PASSWORD=secret123 -p 5432:5432 -d postgres
```

## 7. Cómo correr la aplicación
Antes de levantar el servidor, asegúrate de que el contenedor de Docker esté ejecutándose correctamente.
Para ejecutar la aplicación y compilar todo en Spring Boot:

```bash
mvn spring-boot:run
```
*(El servidor comenzará de manera habitual en el puerto 8080)*

## 8. Cómo ejecutar Pruebas Automáticas y Validación
Para verificar la estabilidad y ejecutar toda la suite de pruebas unitarias e integrales del proyecto apoyado en Testcontainers, ejecuta:

```bash
mvn clean test
```

## 9. Endpoints Principales
A continuación, algunos de los endpoints base habilitados. Consulta el fichero [requests.http](./requests.http) para la colección extendida.
- **Pacientes:** `/api/patients` (GET, POST, PUT)
- **Doctores:** `/api/doctors` (GET, POST, PUT)
- **Citas:** `/api/appointments` (GET, POST)
- **Citas [Estados]:** `/api/appointments/{id}/{confirm|cancel|complete|no-show}` (PUT)
- **Reportes:** `/api/reports/...` (GET)

## 10. Decisiones de Diseño Principal
- **Inyección de Dependencias (DI):** Inyección de dependencias en constructores utilizando `@RequiredArgsConstructor`.
- **Uso Estricto de DTOs:** Se hace uso extensivo y explícito de Data Transfer Objects (`Request` / `Response`) para transferir información en las peticiones y respuestas HTTP. Esto blinda las entidades de la base de datos y permite exponer solo los atributos necesarios por la API, manteniendo la seguridad e integridad.
- **Separación de Responsabilidades:** Lógica encapsulada netamente en los `Services`.

## 11. Limitaciones Relativas
- No incluye un módulo robusto de autenticación en su estado actual (por ej. Spring Security + JWT).
- No soporta concurrencia masiva ni eventos re-creacionales de auditoría completa, asume flujos controlados.

```

---

### Archivo: `auditoria_endpoints.txt`
- Bytes: 9926
- Encoding detectado: latin-1

```txt
ÿþ
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 3 4 : @ R e q u e s t M a p p i n g ( " / a p i / a p p o i n t m e n t s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 4 2 :         @ G e t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 4 7 :         @ G e t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 5 3 :         @ G e t M a p p i n g ( p a r a m s   =   " d o c t o r I d " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 5 9 :         @ G e t M a p p i n g ( p a r a m s   =   " p a t i e n t I d " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 6 5 :         @ G e t M a p p i n g ( p a r a m s   =   " s t a t u s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 7 1 :         @ G e t M a p p i n g ( p a r a m s   =   { " f r o m " ,   " t o " } ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 8 0 :         @ P o s t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 8 8 :         @ P u t M a p p i n g ( " / { i d } / c o n f i r m " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 9 4 :         @ P u t M a p p i n g ( " / { i d } / c a n c e l " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 1 0 0 :         @ P u t M a p p i n g ( " / { i d } / c o m p l e t e " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r . j a v a : 1 0 6 :         @ P u t M a p p i n g ( " / { i d } / n o - s h o w " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t T y p e C o n t r o l l e r . j a v a : 1 5 : @ R e q u e s t M a p p i n g ( " / a p i / a p p o i n t m e n t - t y p e 
 
 s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t T y p e C o n t r o l l e r . j a v a : 2 1 :         @ G e t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t T y p e C o n t r o l l e r . j a v a : 2 6 :         @ G e t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t T y p e C o n t r o l l e r . j a v a : 3 1 :         @ P o s t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t T y p e C o n t r o l l e r . j a v a : 3 6 :         @ P u t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A v a i l a b i l i t y C o n t r o l l e r . j a v a : 2 2 : @ R e q u e s t M a p p i n g ( " / a p i / a v a i l a b i l i t y " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A v a i l a b i l i t y C o n t r o l l e r . j a v a : 2 8 :         @ G e t M a p p i n g ( " / d o c t o r s / { d o c t o r I d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r C o n t r o l l e r . j a v a : 1 6 : @ R e q u e s t M a p p i n g ( " / a p i / d o c t o r s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r C o n t r o l l e r . j a v a : 2 2 :         @ G e t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r C o n t r o l l e r . j a v a : 2 7 :         @ G e t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r C o n t r o l l e r . j a v a : 3 2 :         @ P o s t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r C o n t r o l l e r . j a v a : 3 7 :         @ P u t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r S c h e d u l e C o n t r o l l e r . j a v a : 1 5 : @ R e q u e s t M a p p i n g ( " / a p i / d o c t o r s / { d o c t o r I d 
 
 } / s c h e d u l e s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r S c h e d u l e C o n t r o l l e r . j a v a : 2 1 :         @ G e t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r S c h e d u l e C o n t r o l l e r . j a v a : 2 6 :         @ P o s t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ O f f i c e C o n t r o l l e r . j a v a : 1 6 : @ R e q u e s t M a p p i n g ( " / a p i / o f f i c e s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ O f f i c e C o n t r o l l e r . j a v a : 2 2 :         @ G e t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ O f f i c e C o n t r o l l e r . j a v a : 2 7 :         @ G e t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ O f f i c e C o n t r o l l e r . j a v a : 3 2 :         @ P o s t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ O f f i c e C o n t r o l l e r . j a v a : 3 7 :         @ P u t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ P a t i e n t C o n t r o l l e r . j a v a : 1 6 : @ R e q u e s t M a p p i n g ( " / a p i / p a t i e n t s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ P a t i e n t C o n t r o l l e r . j a v a : 2 2 :         @ G e t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ P a t i e n t C o n t r o l l e r . j a v a : 2 7 :         @ G e t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ P a t i e n t C o n t r o l l e r . j a v a : 3 2 :         @ P o s t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ P a t i e n t C o n t r o l l e r . j a v a : 3 7 :         @ P u t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ R e p o r t C o n t r o l l e r . j a v a : 2 7 : @ R e q u e s t M a p p i n g ( " / a p i / r e p o r t s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ R e p o r t C o n t r o l l e r . j a v a : 3 3 :         @ G e t M a p p i n g ( " / o f f i c e - o c c u p a n c y " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ R e p o r t C o n t r o l l e r . j a v a : 4 0 :         @ G e t M a p p i n g ( " / d o c t o r - p r o d u c t i v i t y " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ R e p o r t C o n t r o l l e r . j a v a : 4 7 :         @ G e t M a p p i n g ( " / n o - s h o w - p a t i e n t s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ S p e c i a l t y C o n t r o l l e r . j a v a : 2 1 :   *   @ R e q u e s t M a p p i n g   =   p r e f i j o   d e   r u t a ,   c o m o   
 
 R o u t e : : p r e f i x ( ' a p i / s p e c i a l t i e s ' ) . 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ S p e c i a l t y C o n t r o l l e r . j a v a : 2 4 : @ R e q u e s t M a p p i n g ( " / a p i / s p e c i a l t i e s " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ S p e c i a l t y C o n t r o l l e r . j a v a : 3 1 :         @ G e t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ S p e c i a l t y C o n t r o l l e r . j a v a : 3 7 :         @ G e t M a p p i n g ( " / { i d } " ) 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ S p e c i a l t y C o n t r o l l e r . j a v a : 4 7 :         @ P o s t M a p p i n g 
 
 s r c \ m a i n \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ S p e c i a l t y C o n t r o l l e r . j a v a : 5 3 :         @ P u t M a p p i n g ( " / { i d } " ) 
 
 
 
 
 
 
```

---

### Archivo: `auditoria_estructura_main.txt`
- Bytes: 3316
- Encoding detectado: utf-8

```txt
Listado de rutas de carpetas
El número de serie del volumen es 465D-EBB9
C:\USERS\HP\DOCUMENTS\PROYECTO WEB\CLINIC-RESERVATIONS\SRC\MAIN\JAVA\COM\UNIVERSITY\CLINIC
│   ClinicReservationsApplication.java
│   
├───controller
│       AppointmentController.java
│       AppointmentTypeController.java
│       AvailabilityController.java
│       DoctorController.java
│       DoctorScheduleController.java
│       OfficeController.java
│       PatientController.java
│       ReportController.java
│       SpecialtyController.java
│       
├───dto
│       AppointmentResponse.java
│       AppointmentTypeResponse.java
│       AvailabilitySlotResponse.java
│       CancelAppointmentRequest.java
│       CreateAppointmentRequest.java
│       CreateAppointmentTypeRequest.java
│       CreateDoctorRequest.java
│       CreateDoctorScheduleRequest.java
│       CreateOfficeRequest.java
│       CreatePatientRequest.java
│       CreateSpecialtyRequest.java
│       DoctorProductivityResponse.java
│       DoctorResponse.java
│       DoctorScheduleResponse.java
│       NoShowPatientResponse.java
│       OfficeOccupancyResponse.java
│       OfficeResponse.java
│       PatientResponse.java
│       ReportResponse.java
│       SpecialtyResponse.java
│       UpdateDoctorRequest.java
│       UpdateOfficeRequest.java
│       UpdatePatientRequest.java
│       
├───entity
│       Appointment.java
│       AppointmentStatus.java
│       AppointmentType.java
│       BaseEntity.java
│       Doctor.java
│       DoctorSchedule.java
│       Office.java
│       OfficeStatus.java
│       Patient.java
│       PatientStatus.java
│       Specialty.java
│       
├───exception
│       BusinessException.java
│       ConflictException.java
│       GlobalExceptionHandler.java
│       ResourceNotFoundException.java
│       ValidationException.java
│       
├───mapper
│       AppointmentMapper.java
│       AppointmentTypeMapper.java
│       DoctorMapper.java
│       DoctorScheduleMapper.java
│       OfficeMapper.java
│       PatientMapper.java
│       SpecialtyMapper.java
│       
├───repository
│       AppointmentRepository.java
│       AppointmentTypeRepository.java
│       DoctorRepository.java
│       DoctorScheduleRepository.java
│       OfficeRepository.java
│       PatientRepository.java
│       SpecialtyRepository.java
│       
└───service
    │   AppointmentService.java
    │   AppointmentTypeService.java
    │   AvailabilityService.java
    │   DoctorScheduleService.java
    │   DoctorService.java
    │   OfficeService.java
    │   PatientService.java
    │   ReportService.java
    │   SpecialtyService.java
    │   
    └───impl
            AppointmentServiceImpl.java
            AppointmentTypeServiceImpl.java
            AvailabilityServiceImpl.java
            DoctorScheduleServiceImpl.java
            DoctorServiceImpl.java
            OfficeServiceImpl.java
            PatientServiceImpl.java
            ReportServiceImpl.java
            SpecialtyServiceImpl.java
            

```

---

### Archivo: `auditoria_estructura_test.txt`
- Bytes: 867
- Encoding detectado: utf-8

```txt
Listado de rutas de carpetas
El número de serie del volumen es 465D-EBB9
C:\USERS\HP\DOCUMENTS\PROYECTO WEB\CLINIC-RESERVATIONS\SRC\TEST\JAVA\COM\UNIVERSITY\CLINIC
│   ClinicReservationsApplicationTest.java
│   
├───controller
│       AppointmentControllerTest.java
│       AvailabilityControllerTest.java
│       DoctorControllerTest.java
│       PatientControllerTest.java
│       
├───integration
│       AppointmentRepositoryIntegrationTest.java
│       DoctorRepositoryIntegrationTest.java
│       DoctorScheduleRepositoryIntegrationTest.java
│       OfficeRepositoryIntegrationTest.java
│       PatientRepositoryIntegrationTest.java
│       
└───service
        AppointmentServiceImplTest.java
        AvailabilityServiceImplTest.java
        DoctorScheduleServiceImplTest.java
        

```

---

### Archivo: `auditoria_tests_lista.txt`
- Bytes: 3558
- Encoding detectado: latin-1

```txt
ÿþC : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A p p o i n t m e n t C o n t r o l l e r T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ A v a i l a b i l i t y C o n t r o l l e r T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ D o c t o r C o n t r o l l e r T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ c o n t r o l l e r \ P a t i e n t C o n t r o l l e r T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ i n t e g r a t i o n \ A p p o i n t m e n t R e p o s i t o r y I n t e g r a t i o n T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ i n t e g r a t i o n \ D o c t o r R e p o s i t o r y I n t e g r a t i o n T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ i n t e g r a t i o n \ D o c t o r S c h e d u l e R e p o s i t o r y I n t e g r a t i o n T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ i n t e g r a t i o n \ O f f i c e R e p o s i t o r y I n t e g r a t i o n T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ i n t e g r a t i o n \ P a t i e n t R e p o s i t o r y I n t e g r a t i o n T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ s e r v i c e \ A p p o i n t m e n t S e r v i c e I m p l T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ s e r v i c e \ A v a i l a b i l i t y S e r v i c e I m p l T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ s e r v i c e \ D o c t o r S c h e d u l e S e r v i c e I m p l T e s t . j a v a 
 
 C : \ U s e r s \ H P \ D o c u m e n t s \ p r o y e c t o   w e b \ c l i n i c - r e s e r v a t i o n s \ s r c \ t e s t \ j a v a \ c o m \ u n i v e r s i t y \ c l i n i c \ C l i n i c R e s e r v a t i o n s A p p l i c a t i o n T e s t . j a v a 
 
 
```

---

### Archivo: `pom.xml`
- Bytes: 3824
- Encoding detectado: utf-8

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- Parent: Spring Boot 4.0.5 (equivalente a "require laravel/framework" en composer.json) -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.5</version>
        <relativePath/> <!-- buscar en repositorio Maven central -->
    </parent>

    <groupId>com.university.clinic</groupId>
    <artifactId>clinic-reservations</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    <name>clinic-reservations</name>
    <description>API REST para reservas de consultorios médicos universitarios</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Web: equivalente a instalar routes + controllers en Laravel -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- JPA/Hibernate: equivalente a Eloquent ORM -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Validación: equivalente a FormRequest en Laravel -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Driver PostgreSQL: equivalente a "pdo_pgsql" en PHP -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok: genera getters/setters/constructores automáticamente -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- ========== TESTING ========== -->

        <!-- Spring Boot Test: incluye JUnit 5 + Mockito -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Testcontainers: levanta PostgreSQL en Docker para tests de integración -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-testcontainers</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>1.20.4</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <version>1.20.4</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>

```

---

### Archivo: `requests.http`
- Bytes: 5279
- Encoding detectado: utf-8

```http
### ==============================================
### ESPECIALIDADES
### ==============================================

### Crear Especialidad
POST http://localhost:8080/api/specialties
Content-Type: application/json

{
    "name": "Cardiología"
}

### Obtener Especialidades
GET http://localhost:8080/api/specialties


### ==============================================
### DOCTORES
### ==============================================

### Crear Doctor
POST http://localhost:8080/api/doctors
Content-Type: application/json

{
    "firstName": "Carlos",
    "lastName": "Rodríguez",
    "licenseNumber": "X998877",
    "specialtyId": 1
}

### Obtener todos los Doctores
GET http://localhost:8080/api/doctors

### Obtener Doctor por ID
GET http://localhost:8080/api/doctors/1

### Actualizar Doctor
PUT http://localhost:8080/api/doctors/1
Content-Type: application/json

{
    "firstName": "Carlos Andrés",
    "lastName": "Rodríguez",
    "licenseNumber": "X998877",
    "specialtyId": 1
}


### ==============================================
### PACIENTES
### ==============================================

### Crear Paciente
POST http://localhost:8080/api/patients
Content-Type: application/json

{
    "firstName": "Ana",
    "lastName": "Gómez",
    "universityId": "11223344",
    "email": "ana.gomez@mail.com",
    "phone": "555-8765"
}

### Obtener todos los Pacientes
GET http://localhost:8080/api/patients

### Obtener Paciente por ID
GET http://localhost:8080/api/patients/1

### Actualizar Paciente
PUT http://localhost:8080/api/patients/1
Content-Type: application/json

{
    "firstName": "Ana Lucia",
    "lastName": "Gómez",
    "universityId": "11223344",
    "email": "ana.gomezl@mail.com",
    "phone": "555-9988"
}


### ==============================================
### CONSULTORIOS (OFFICES)
### ==============================================

### Crear Consultorio
POST http://localhost:8080/api/offices
Content-Type: application/json

{
    "name": "Consultorio 101",
    "floor": 1
}

### Obtener Consultorios
GET http://localhost:8080/api/offices

### Modificar Consultorio
PUT http://localhost:8080/api/offices/1
Content-Type: application/json

{
    "name": "Consultorio 101A",
    "floor": 1,
    "status": "ACTIVE"
}


### ==============================================
### TIPOS DE CITA
### ==============================================

### Crear Tipo de Cita
POST http://localhost:8080/api/appointment-types
Content-Type: application/json

{
    "name": "Chequeo General",
    "durationMinutes": 30
}

### Obtener Tipos de Cita
GET http://localhost:8080/api/appointment-types


### ==============================================
### HORARIOS DE DOCTOR (SCHEDULES)
### ==============================================

### Crear Horario para el Doctor (Doctor ID = 1)
POST http://localhost:8080/api/doctors/1/schedules
Content-Type: application/json

{
    "dayOfWeek": "MONDAY",
    "startTime": "08:00:00",
    "endTime": "14:00:00"
}

### Obtener Horarios de un Doctor
GET http://localhost:8080/api/doctors/1/schedules


### ==============================================
### DISPONIBILIDAD
### ==============================================

### Consultar Disponibilidad del Doctor (requiere date, durationMinutes es opcional, default 30)
GET http://localhost:8080/api/availability/doctors/1?date=2026-04-20&durationMinutes=30


### ==============================================
### CITAS (APPOINTMENTS)
### ==============================================

### Crear Cita
POST http://localhost:8080/api/appointments
Content-Type: application/json

{
    "patientId": 1,
    "doctorId": 1,
    "officeId": 1,
    "appointmentTypeId": 1,
    "startAt": "2026-04-20T09:00:00"
}

### Obtener Citas
GET http://localhost:8080/api/appointments

### Obtener Cita por ID
GET http://localhost:8080/api/appointments/1

### Filtrar citas por doctor
GET http://localhost:8080/api/appointments?doctorId=1

### Filtrar citas por paciente
GET http://localhost:8080/api/appointments?patientId=1

### Filtrar citas por estado
GET http://localhost:8080/api/appointments?status=SCHEDULED

### Filtrar citas por rango de fechas
GET http://localhost:8080/api/appointments?from=2026-04-01T00:00:00&to=2026-04-30T23:59:59

### Cambiar estado: Confirmar cita
PUT http://localhost:8080/api/appointments/1/confirm

### Cambiar estado: Completar cita
PUT http://localhost:8080/api/appointments/1/complete

### Cambiar estado: Paciente no asistió
PUT http://localhost:8080/api/appointments/1/no-show

### Cambiar estado: Cancelar cita (requiere body con reason)
PUT http://localhost:8080/api/appointments/1/cancel
Content-Type: application/json

{
    "reason": "El paciente solicita cancelar por motivos personales"
}


### ==============================================
### REPORTES
### ==============================================

### Reporte de Ocupación de Consultorios
GET http://localhost:8080/api/reports/office-occupancy?from=2026-04-01T00:00:00&to=2026-04-30T23:59:59

### Reporte de Productividad Médica
GET http://localhost:8080/api/reports/doctor-productivity?from=2026-04-01T00:00:00&to=2026-04-30T23:59:59

### Reporte de Pacientes Ausentes
GET http://localhost:8080/api/reports/no-show-patients?from=2026-04-01T00:00:00&to=2026-04-30T23:59:59

```