# Sistema de Gestión de Citas Médicas Universitarias

Este sistema proporciona un backend robusto para la reserva, gestión, agendamiento y evaluación del servicio de citas médicas. Está diseñado específicamente para clínicas universitarias, permitiendo coordinar de forma centralizada la logística requerida en centros de salud estudiantiles, previniendo cruces de horarios, garantizando un manejo adecuado de consultorios y controlando el ciclo completo de la atención (desde la solicitud inicial hasta el reporte gerencial y estadístico posterior).

---

## 1. Módulos Funcionales del Proyecto

El sistema está compuesto por los siguientes submódulos altamente cohesivos:

1. **Módulo Demográfico y de Especialidades**: Gestión del catálogo de pacientes (estudiantes y personal de la universidad) y ramas de la especialidad médica ofertadas.
2. **Módulo de Tipos de Cita**: Configuración paramétrica de las categorías de atención médica dictaminando su nivel temporal o duración base en minutos.
3. **Módulo de Médicos y Agendas (Schedules)**: Control del equipo de doctores y parametrización de sus franjas de disponibilidad semanales obligatorias dictando los días y bordes horarios funcionales.
4. **Módulo de Instalaciones Físicas (Offices)**: Administración del estado funcional (activo, en mantenimiento) de los espacios o infraestructura de consultorios.
5. **Módulo Transaccional de Citas Médicas**: Centralización del volumen de reservas operando una sólida máquina de estados finitos que modela el ciclo real de vida de la atención médica (agendada, confirmada, completada, ausente, cancelada).
6. **Módulo de Control de Disponibilidad Compleja**: Motor algorítmico central diseñado para resolver dinámicamente "huecos disponibles". Extrae las franjas de trabajo de un doctor y les deduce matemáticamente las citas que ya se hayan comprometido.
7. **Módulo Analítico y de Reportes Estadísticos**: Dashboard intermedio en formato API para consolidar agrupaciones y evaluar el desempeño del negocio asistencial.

---

## 2. Stack Tecnológico Actualizado

La arquitectura y las soluciones base operan sobre el ecosistema Java Enterprise moderno empleando:

- **Java 21**: Aprovechamiento fundamental de Records y switch expressions modernas para un código resiliente.
- **Spring Boot 4.x**: Framework núcleo central que aprovisiona las configuraciones de Inyección de Dependencias (DI), IoC y el ruteo web MVC en su servidor embebido (Tomcat).
- **Spring Data JPA / Hibernate**: Integración ininterrumpida de ORM (Object-Relational Mapping) bajo el estándar JPA.
- **PostgreSQL**: Motor de base de datos relacional para el cumplimiento fehaciente de restricciones transaccionales ACID.
- **Lombok**: Sustitución técnica del boilerplate (eliminación de Getters/Setters verbosos mediante anotaciones formales).
- **Testcontainers, JUnit 5, Mockito**: Suite avanzada integral e impecable para pruebas automatizadas con aislamiento y ejecución dependiente de contenedores Docker efímeros de validación.
- **Maven**: Instrumento automatizador general de fase de construcción (Build) y administración semántica de dependencias.

---

## 3. Arquitectura de Software por Capas (N-Tier)

La solución técnica está estrictamente dividida mediante una arquitectura monolítica limpia y por capas:

- **Capa Controladores (`Controller`)**: Punto de encuentro con clientes web que reciben las peticiones RESTful (HTTP/JSON). Asumen la validación primaria de estructuras entrantes sirviéndose de Data Transfer Objects (DTOs) protegidos por Jakarta Validation (`@Valid`), enrutando entonces la directriz a la capa inferior.
- **Capa de Servicio (`Service` e `Impl`)**: Encapsula de forma hermética la **lógica de negocio**. Aplica con rigurosidad las reglas del dominio de salud establecidas y asegura la coherencia en las transiciones de entidades manipulando las llamadas a repositorios.
- **Capa Repositorio (`Repository`)**: Interfaces extendidas de persistencia `JpaRepository`. Resuelven operaciones estándar además de modelar consultas SQL/JPQL agregadas complejas necesarias para la lógica analítica y motor de superposiciones.
- **Capa de Transferencias Puras (DTO / Mapper)**: Capa de desacoplamiento formal. Garantiza y protege como "cortafuegos" que ninguna entidad o esquema relacional del dominio invada como respuesta directa el exterior HTTP.
- **Capa Entidades (`Entity`)**: Clases marcadas y ligadas explícitamente a las plantillas tabla relacionales subyacentes.

---

## 4. Entidades Principales del Dominio

El diseño de la persistencia se ramifica a través de las siguientes 7 entidades fundamentales:
1. `Patient` (Paciente)
2. `Doctor` (Médico Especialista)
3. `Specialty` (Especialidad Médica)
4. `Office` (Consultorio o infraestructura)
5. `AppointmentType` (Configuración paramétrica del motivo de la cita)
6. `DoctorSchedule` (Esquema de horarios recurrentes)
7. `Appointment` (Cita Médica — Núcleo transaccional orquestador)

---

## 5. Reglas de Negocio Centrales Implementadas

El sistema blinda la integridad de sus datos y las operativas clínicas programando de modo determinista las siguientes restricciones de negocio obligatorias:

- **Definición Automática de Finalización Temporizada (`endAt`)**: Al crearse una reserva nunca se provee "cuándo termina" manualmente; siempre el servidor intercepta el alta y deduce por cálculo el límite final sumando los minutos paramétricos establecidos en `AppointmentType.durationMinutes` sobre el `startAt`.
- **Inviolabilidad Temporal o Anti-Solapamiento (Overlap Protection)**: Operativización que previene duplicidad. Es tecnológicamente imposible que sobre determinado `Doctor`, `Office` o `Patient` converja más de un bloque de `Appointment` compartiendo segundos temporalmente. Ante colisión, estalla de golpe una `ConflictException`.
- **Restricción y Custodia de Marco Laboral**: Toda asignación de cita requiere obligatoriamente cruzar la validación de que el instante provisto encaje completamente al interior del marco legal propuesto por la bitácora `DoctorSchedule` del médico asignado según día de semana.
- **Bloqueos de Dependencia de Estados (Status Validation)**: Se valida rigurosamente la disponibilidad en estatus (Enum) para los nodos que arman la red de una cita impidiendo generar atenciones cuando algún recurso está incapacitado funcionalmente (Consultorios inhabilitados por `UNDER_MAINTENANCE`, Médicos de baja `active=false`, o Pacientes expulsados `INACTIVE`).

---

## 6. Transiciones de Estado en las Citas (Máquina de Estados)

La trayectoria transaccional de todo `Appointment` es controlada por el enum orgánico restrictivo `AppointmentStatus`:

*   🔵 **`SCHEDULED`** (Agendada): Estado inicial predeterminado.
    *   *Posibles Derivaciones:* `CONFIRMED` o `CANCELLED`.
*   🟡 **`CONFIRMED`** (Confirmada): Transición positiva de asentimiento anticipado del paciente por algún medio.
    *   *Posibles Derivaciones:* `COMPLETED`, `CANCELLED`, o `NO_SHOW`.
*   🟢 **`COMPLETED`** (Completada): Exito en la atención integral médica. Consiente inyectar bitácoras de historia sobre las propiedades de notas (*Estado de término*).
*   🔴 **`CANCELLED`** (Cancelada): Voluntad manifiesta de renuncia devolviendo la liquidez de espacio. Insta un soporte de cancelación adjunta mediante *reason* o notas (*Estado de término*).
*   ⚫ **`NO_SHOW`** (Ausencia / Inasistencia): Infracción sistemática. Paciente nunca acudió restándole posibilidad financiera a la institución (*Estado de término*).

---

## 7. Disponibilidad y Reportes Gerenciales Existentes

El backend satisface interrogantes organizativas en tiempo real:

- **Algoritmo Predictor de Disponibilidad (`/api/availability`)**: Proyección cruzada en vivo extrayendo la matriz total de la jornada `DoctorSchedule`, fragmentándola y restándole las sub-franjas estalladas en estado latente agendadas en `Appointments`, respondiendo de modo prolijo con los verdaderos "puestos libres" limpios de 30 o N minutos.
- **Suite Analítica Táctica (`/api/reports`)**: Funcionalidad de sondeo administrativo integral:
    - *Ocupación Institucional (`office-occupancy`)*: Revela un perfil detallado de la ratio de usabilidad y cancelaciones percutidas sobre cada sala `Office` evaluable en un tramo de fechas.
    - *Productividad Laboral Médica (`doctor-productivity`)*: Expide la densidad de logro ponderando asistencias completas provistas por cada especialista respecto a la nómina general reservada.
    - *Registro de Infractores (`no-show-patients`)*: Compilación de ranking penal orientada a aquellos que registran más incumplimientos crónicos evadiéndose del consultorio en reserva.

---

## 8. Endpoints Principales (API REST)

La plataforma dispone de la colección jerarquizada principal a continuación. (*Párese la atención especializada al controlador dinámico global de variables de mapeo en `requests.http`*):

- Rutas de Gestión de Archivo Base (Expuestos por GET, POST, GET/{id}, PUT/{id}):
  - `/api/specialties`
  - `/api/doctors`
  - `/api/patients`
  - `/api/offices`
  - `/api/appointment-types`

- Rutas Operacionales y Lógicas Maestras:
  - `POST /api/appointments`: Orquestador principal de consolidación de turnos.
  - `GET /api/availability/doctors/{doctorId}`: Mecanismo de cálculo temporal interrogando huecos libres por medio de parámetros dinámicos (`date` y `durationMinutes`).
  - `PUT /api/appointments/{id}/confirm`, `/complete`, `/cancel`, `/no-show`: Inflexiones preestablecidas para desplazar la máquina de estados por bloque.
  - `GET /api/reports/office-occupancy` (y sus variantes): Descargas estadísticas en volcado directo JSON provistas de delimitadores temporales (`from` / `to`).

---

## 9. Referencias Adicionales
- Para observar sin ambages el diagrama de mapeo arquitectónico en base de datos PostgreSQL y llaves cruzadas diríjase a este enlace referencial: **[MER.md](./MER.md)**
- Para consultar o someter a emulación el flujo 1 a 1 de la totalidad de funcionalidades con cuerpos y queries en norma JSON utilice el archivo de test local: **[requests.http](./requests.http)**

---

## 10. Forma de Ejecutar la App y sus Pruebas

### 10.1. Preparar la Base de Datos
Se precisa de un motor PostgreSQL activo. Si levanta la base de datos mediante el archivo `docker-compose.yml` provisto en el directorio contiguo `docker/`, tenga en cuenta que este mapea el puerto **`5433`** del host:
```bash
# Iniciar contenedor de base de datos
cd ../docker
docker-compose up -d
```
> [!IMPORTANT]
> Si usa el contenedor Docker, debe abrir el archivo **[application.yml](file:///c:/Users/maria/Downloads/consultorios/proyecto%20web/proyecto%20web/clinic-reservations/src/main/resources/application.yml)** y cambiar la URL de conexión del puerto `5432` al puerto `5433`:
> `url: jdbc:postgresql://localhost:5433/consultorios_db`

### 10.2. Arranque de la Aplicación (Spring Boot)
Una vez configurada y activa la base de datos, inicie el backend en la carpeta de este proyecto:
```bash
mvn spring-boot:run
```
El backend estará disponible en `http://localhost:8080` (CORS habilitado para puerto `5173`).

### 10.3. Arranque del Frontend (React + Vite)
El código de la aplicación de usuario se encuentra en la carpeta paralela: **[taskboard-react-main/taskboard-react-main](file:///c:/Users/maria/Downloads/consultorios/taskboard-react-main/taskboard-react-main)**. Para iniciarlo:
```bash
cd ../../../taskboard-react-main/taskboard-react-main
npm install
npm run dev
```
Abra el navegador en **`http://localhost:5173`**.

### 10.4. Ejecución del Entorno de Pruebas
Las pruebas unitarias y de integración (con `Testcontainers`) se ejecutan con:
```bash
mvn clean test
```
