import React, { useState, useEffect } from 'react';
import { Modal, FormGroup, FormSelect, FormInput, Icon } from '../components/Shared';
import { api } from '../services/api';

const DAYS_MAP = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
};

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function ScheduleConfig({ isOpen, onClose, doctor, showToast }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const emptyForm = { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' };
  const [form, setForm] = useState(emptyForm);

  const loadSchedules = async () => {
    if (!doctor) return;
    try {
      setLoading(true);
      const data = await api.getDoctorSchedules(doctor.id);
      setSchedules(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && doctor) {
      loadSchedules();
      setAdding(false);
      setForm(emptyForm);
    }
  }, [isOpen, doctor]);

  const handleAdd = async () => {
    if (!form.startTime || !form.endTime) {
      return showToast('Las horas de inicio y fin son obligatorias', 'error');
    }
    
    // Validar que la hora de inicio sea menor que la hora de fin
    if (form.startTime >= form.endTime) {
      return showToast('La hora de inicio debe ser anterior a la hora de fin', 'error');
    }

    try {
      const payload = {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime + ':00', // Dar formato HH:mm:ss esperado por Spring LocalTime
        endTime: form.endTime + ':00'
      };
      
      const created = await api.createDoctorSchedule(doctor.id, payload);
      setSchedules(prev => [...prev, created]);
      showToast('Horario añadido correctamente.', 'success');
      setAdding(false);
      setForm(emptyForm);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Agrupar horarios por día de la semana
  const groupedSchedules = {};
  DAYS_ORDER.forEach(d => {
    groupedSchedules[d] = schedules.filter(s => s.dayOfWeek === d && s.active);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Horarios de Atención — ${doctor ? (doctor.firstName + ' ' + doctor.lastName) : ''}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', width: '100%' }}>
          {!adding ? (
            <button className="btn btn-secondary" onClick={() => setAdding(true)}>
              <Icon name="add" size={14} style={{ marginRight: 4 }} /> Agregar franja horaria
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleAdd}>Guardar Horario</button>
              <button className="btn btn-secondary" onClick={() => setAdding(false)}>Cancelar</button>
            </div>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando horarios de atención...</div>
      ) : (
        <div>
          {adding && (
            <div className="card" style={{ background: 'var(--bg)', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Nueva franja horaria</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <FormGroup label="Día de la semana">
                  <FormSelect name="dayOfWeek" value={form.dayOfWeek} onChange={fc}>
                    {DAYS_ORDER.map(d => <option key={d} value={d}>{DAYS_MAP[d]}</option>)}
                  </FormSelect>
                </FormGroup>
                <FormGroup label="Hora de inicio">
                  <FormInput type="time" name="startTime" value={form.startTime} onChange={fc} />
                </FormGroup>
                <FormGroup label="Hora de fin">
                  <FormInput type="time" name="endTime" value={form.endTime} onChange={fc} />
                </FormGroup>
              </div>
            </div>
          )}

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Rangos de horas configurados para atención laboral:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {DAYS_ORDER.map(day => {
              const list = groupedSchedules[day] || [];
              return (
                <div key={day} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                    {DAYS_MAP[day]}
                  </div>
                  {list.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', italic: 'true', padding: '4px 0' }}>Sin horarios</div>
                  ) : (
                    list.map(s => {
                      const start = s.startTime.substring(0, 5);
                      const end = s.endTime.substring(0, 5);
                      return (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', marginBottom: 4, fontSize: 12, fontWeight: 600, background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 6 }}>
                          <Icon name="schedule" size={12} />
                          <span>{start} - {end}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
