# UMO Clinic Reservations — Frontend (React + Vite)

Este es el frontend Single Page Application (SPA) para el proyecto **UMO - Plataforma de Reservas de Consultorios Médicos Universitarios**. Ha sido diseñado en base al prototipo interactivo "UMO - Standalone.html", utilizando CSS Vanilla moderno para recrear de manera exacta los estilos, transiciones, modo oscuro y la experiencia de usuario premium.

Toda la aplicación consume la API REST real de Spring Boot exponiendo los datos dinámicamente y aplicando las validaciones de negocio en el backend.

---

## 🚀 Funcionalidades

- **Dashboard**: Métricas clave en tiempo real (pacientes activos, citas del día, citas confirmadas y pendientes), listado de citas de hoy y gráfico de ocupación semanal.
- **Gestión de Pacientes (CRUD)**: Registro, edición y búsqueda de pacientes utilizando campos de matrícula, nombres, apellidos e información de contacto.
- **Gestión de Doctores (CRUD)**: Creación de doctores con su respectiva especialidad médica y número de licencia oficial.
- **Configuración de Horarios de Doctores**: Asignación de rangos horarios laborables recurrentes semanales por doctor para estructurar la agenda.
- **Catálogo de Especialidades y Servicios**: Configuración de especialidades médicas y tipos de cita determinando la duración oficial (en minutos).
- **Gestión de Consultorios (CRUD)**: Administración física de consultorios detallando piso y estado actual (activo, en mantenimiento).
- **Consulta de Disponibilidad**: Motor para verificar en tiempo real los slots de tiempo libres de un doctor en una fecha para un tipo de cita concreto. Permite reservar directamente sobre un slot libre.
- **Gestión Transaccional de Citas**: Creación de citas y avance de estados en base a la máquina de estados:
  - *Confirmar* una cita programada.
  - *Completar* una cita confirmada agregando observaciones finales.
  - *No-Show* para registrar inasistencias.
  - *Cancelar* requiriendo motivo obligatorio y liberando inmediatamente la agenda.
- **Reportes Operativos**: Filtro analítico por rango de fechas (ISO LocalDateTime) con tres informes gerenciales:
  - Ocupación porcentual de consultorios.
  - Productividad de doctores con gráfico de barras de citas completadas.
  - Ranking de pacientes incumplidores (No-Shows) clasificados por semáforos de riesgo (Alto, Medio, Bajo).

---

## 🛠️ Stack Tecnológico

- **React 19**: Biblioteca UI para la SPA.
- **Vite 7**: Empaquetador y entorno de desarrollo ultra-rápido.
- **JavaScript (ES6+)**: Lógica del lado del cliente.
- **CSS Vanilla (Custom Properties)**: Variables CSS para temas dinámicos claro/oscuro y diseño responsivo sin frameworks adicionales de estilos.
- **Context API (`AppCtx`)**: Gestión centralizada y reactiva del estado de datos (sincronizado con la base de datos).

---

## 📁 Estructura del Directorio

```txt
src/
├── components/
│   ├── Shared.jsx       (Componentes reusables: Icon, Badge, Modal, ConfirmDialog, KPICard, BarChart, PageHeader, etc.)
│   ├── Sidebar.jsx      (Barra de navegación lateral responsiva)
│   └── TopBar.jsx       (Barra de herramientas superior con switch de modo oscuro)
├── pages/
│   ├── DashboardView.jsx (Métricas del día e historial reciente)
│   ├── PatientCrud.jsx  (Gestión de pacientes)
│   ├── DoctorCrud.jsx   (Gestión de doctores)
│   ├── ScheduleConfig.jsx (Horarios de doctores)
│   ├── CatalogView.jsx  (Especialidades y tipos de cita)
│   ├── OfficeCrud.jsx   (Gestión de consultorios)
│   ├── AvailabilityView.jsx (Slots libres de agenda por doctor)
│   ├── AppointmentCrud.jsx (Máquina de estados de citas y creación)
│   └── ReportsView.jsx  (Filtros analíticos y gráficos)
├── services/
│   └── api.js           (Cliente HTTP para consumir la API de Spring Boot)
├── test/
│   └── setupTests.js    (Configuración de tests unitarios)
├── App.jsx              (Raíz del contexto e inicializador de carga cruzada)
├── main.jsx             (Punto de montaje del DOM)
└── index.css            (Tokens de estilo, tipografía e inputs del diseño de UMO)
```

---

## 💻 Instrucciones de Ejecución

### Prerrequisitos
Asegúrese de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada) y que el backend de Spring Boot esté corriendo en `http://localhost:8080`.

### 1. Instalar Dependencias
Desde el directorio del frontend:
```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

El servidor abrirá por defecto en la dirección: **`http://localhost:5173`**.

### 3. Build de Producción
Si desea generar el empaquetado optimizado para desplegar en producción:
```bash
npm run build
```
Los archivos optimizados estáticos se generarán en la carpeta `dist`.
