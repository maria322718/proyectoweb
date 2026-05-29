# Plataforma de Reservas de Consultorios Médicos Universitarios (UMO)

Este es el repositorio completo del proyecto **Taller de Programación Web: Plataforma de Reservas de Consultorios Médicos Universitarios (UMO)**, estructurado con un backend desarrollado en Java con Spring Boot y un frontend SPA interactivo en React + Vite.

El sistema completo automatiza la gestión y asignación de citas, previene cruces de horarios, controla el ciclo de vida de la atención médica (agendada, confirmada, cancelada, completada o inasistencia) y genera analíticas detalladas de ocupación y productividad.

---

## 🛠️ Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas del espacio de trabajo:

- **[Proyecto Web (Backend)](file:///c:/Users/maria/Downloads/consultorios/proyecto%20web/proyecto%20web/clinic-reservations/)**: Código fuente Java con Spring Boot, persistencia con PostgreSQL, Hibernate y pruebas automáticas.
- **[Taskboard React (Frontend)](file:///c:/Users/maria/Downloads/consultorios/taskboard-react-main/taskboard-react-main/)**: Aplicación frontend SPA construida con React, Vite y CSS Vanilla para coincidir de manera idéntica con el diseño premium "UMO - Standalone.html".
- **[Documentación MER](file:///c:/Users/maria/Downloads/consultorios/proyecto%20web/proyecto%20web/clinic-reservations/MER.md)**: Diagrama entidad-relación y modelo conceptual de persistencia.

---

## 🚀 Guía de Instalación y Arranque Rápido

Siga estos pasos para ejecutar la base de datos, el backend y el frontend localmente.

### Paso 1: Levantar la Base de Datos PostgreSQL
El proyecto cuenta con una definición de servicios en Docker Compose. La base de datos expone el puerto `5433` al host externo y mapea al puerto estándar `5432` interno.

1. Abra una terminal en la ruta de Docker:
   ```bash
   cd "proyecto web/proyecto web/docker"
   ```
2. Ejecute el comando para iniciar el contenedor:
   ```bash
   docker-compose up -d
   ```
   > [!NOTE]
   > Credenciales configuradas:
   > - **Base de datos**: `consultorios_db`
   > - **Usuario**: `consultorios_user`
   > - **Contraseña**: `secret123`
   > - **Puerto**: `5433` (Host) -> `5432` (Contenedor)

### Paso 2: Ejecutar el Backend (Spring Boot)
1. Navegue al directorio del proyecto backend:
   ```bash
   cd "proyecto web/proyecto web/clinic-reservations"
   ```
2. Compile y ejecute la aplicación con Maven:
   ```bash
   mvn spring-boot:run
   ```
   El backend iniciará su servidor Tomcat en el puerto estándar `8080` (API base: `http://localhost:8080/api`).

   > [!TIP]
   > **CORS habilitado**: El backend incluye la clase [WebConfig.java](file:///c:/Users/maria/Downloads/consultorios/proyecto%20web/proyecto%20web/clinic-reservations/src/main/java/com/university/clinic/config/WebConfig.java) que habilita peticiones cruzadas desde el origen del frontend (`http://localhost:5173`) para métodos `GET, POST, PUT, DELETE, OPTIONS`.

### Paso 3: Ejecutar el Frontend (React + Vite)
1. Abra una nueva terminal en el directorio del frontend:
   ```bash
   cd "taskboard-react-main/taskboard-react-main"
   ```
2. Instale las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abra su navegador en la dirección indicada: `http://localhost:5173`.

---

## 🧪 Pruebas y Validación

### Pruebas Unitarias e Integración del Backend
El backend tiene una batería de pruebas automatizadas que usan `Testcontainers` para validar las reglas de negocio (traslapes, horarios, estados, etc.) en un contenedor real de PostgreSQL efímero.

Para ejecutar las pruebas:
```bash
cd "proyecto web/proyecto web/clinic-reservations"
mvn clean test
```

### Pruebas Manuales de la API REST
Se incluye una colección de pruebas en formato HTTP Client en el archivo **[requests.http](file:///c:/Users/maria/Downloads/consultorios/proyecto%20web/proyecto%20web/clinic-reservations/requests.http)**. Puede ejecutar las peticiones directamente en VS Code con la extensión REST Client instalada para simular el comportamiento completo de la API.

---

## 💼 Cobertura Funcional (Historias de Usuario)

El software cubre de manera nativa las 12 Historias de Usuario (HUs) requeridas:

1. **HU-01 (Pacientes)**: Registro, listado y detalle de pacientes.
2. **HU-02 (Doctores)**: Registro de profesionales y asociación a especialidades.
3. **HU-03 (Consultorios)**: Gestión de consultorios físicos por piso y estado funcional.
4. **HU-04 (Tipos de Cita)**: Configuración paramétrica de la duración en minutos de las citas.
5. **HU-05 (Horarios de Doctores)**: Configuración de franjas laborales semanales recurrentes por doctor.
6. **HU-06 (Disponibilidad)**: Consulta dinámica de slots libres cruzando agendas y citas existentes.
7. **HU-07 (Creación de Cita)**: Registro de reservas validando traslapes e inactividad en el servidor.
8. **HU-08 (Confirmar Cita)**: Transición del estado programado a confirmado (`SCHEDULED` -> `CONFIRMED`).
9. **HU-09 (Cancelar Cita)**: Cancelación de citas registrando motivo obligatorio y liberando agendas.
10. **HU-10 (Completar Cita)**: Cierre médico del ciclo asistencial permitiendo guardar notas administrativas.
11. **HU-11 (Inasistencias / No-Show)**: Registro de pacientes ausentes tras superar el horario programado.
12. **HU-12 (Reportes)**: Visualización y filtro de 3 reportes (Ocupación de salas, Productividad médica y Ranking de inasistencias).
