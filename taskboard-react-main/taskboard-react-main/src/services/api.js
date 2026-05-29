const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Función genérica para realizar peticiones HTTP de forma segura a la API REST.
 * Maneja el parseo de errores de negocio devueltos por el GlobalExceptionHandler de Spring Boot.
 */
async function apiRequest(path, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  // Manejo de respuestas vacías (p. ej. DELETE o respuestas sin body)
  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    // Si la API lanzó un error estructurado, extrae su mensaje principal
    const errorMessage = data && (data.message || data.error) 
      ? (data.message || data.error) 
      : `Error de servidor (${response.status})`;
    
    // Adjuntar los detalles del error si existen
    const errorDetails = data && data.details ? data.details : null;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = errorDetails;
    throw error;
  }

  return data;
}

export const api = {
  // === PACIENTES ===
  getPatients: () => apiRequest('/patients'),
  getPatient: (id) => apiRequest(`/patients/${id}`),
  createPatient: (data) => apiRequest('/patients', 'POST', data),
  updatePatient: (id, data) => apiRequest(`/patients/${id}`, 'PUT', data),

  // === DOCTORES ===
  getDoctors: () => apiRequest('/doctors'),
  getDoctor: (id) => apiRequest(`/doctors/${id}`),
  createDoctor: (data) => apiRequest('/doctors', 'POST', data),
  updateDoctor: (id, data) => apiRequest(`/doctors/${id}`, 'PUT', data),

  // === HORARIOS DOCTOR ===
  getDoctorSchedules: (doctorId) => apiRequest(`/doctors/${doctorId}/schedules`),
  createDoctorSchedule: (doctorId, data) => apiRequest(`/doctors/${doctorId}/schedules`, 'POST', data),

  // === ESPECIALIDADES ===
  getSpecialties: () => apiRequest('/specialties'),
  createSpecialty: (data) => apiRequest('/specialties', 'POST', data),

  // === CONSULTORIOS ===
  getOffices: () => apiRequest('/offices'),
  createOffice: (data) => apiRequest('/offices', 'POST', data),
  updateOffice: (id, data) => apiRequest(`/offices/${id}`, 'PUT', data),

  // === TIPOS DE CITA ===
  getAppointmentTypes: () => apiRequest('/appointment-types'),
  createAppointmentType: (data) => apiRequest('/appointment-types', 'POST', data),

  // === CITAS ===
  getAppointments: () => apiRequest('/appointments'),
  getAppointment: (id) => apiRequest(`/appointments/${id}`),
  createAppointment: (data) => apiRequest('/appointments', 'POST', data),
  confirmAppointment: (id) => apiRequest(`/appointments/${id}/confirm`, 'PUT'),
  cancelAppointment: (id, reason) => apiRequest(`/appointments/${id}/cancel`, 'PUT', { reason }),
  completeAppointment: (id, notes) => apiRequest(`/appointments/${id}/complete`, 'PUT', notes ? { notes } : null),
  noShowAppointment: (id) => apiRequest(`/appointments/${id}/no-show`, 'PUT'),

  // === DISPONIBILIDAD ===
  getAvailability: (doctorId, date, slotDurationMinutes) => 
    apiRequest(`/availability/doctors/${doctorId}?date=${date}&durationMinutes=${slotDurationMinutes}`),

  // === REPORTES ===
  getOfficeOccupancy: (from, to) => apiRequest(`/reports/office-occupancy?from=${from}&to=${to}`),
  getDoctorProductivity: (from, to) => apiRequest(`/reports/doctor-productivity?from=${from}&to=${to}`),
  getNoShowPatients: (from, to) => apiRequest(`/reports/no-show-patients?from=${from}&to=${to}`)
};
