import React, { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../App';
import { Icon, EmptyState } from '../components/Shared';
import { api } from '../services/api';

export default function AvailabilityView() {
  const ctx = useContext(AppCtx);
  const { doctors, setDoctors, appointmentTypes, setAppointmentTypes, setView, setPrefillAppt, showToast } = ctx;

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [doctorId, setDoctorId] = useState('');
  const [date, setDate]         = useState(getTodayStr());
  const [typeId, setTypeId]     = useState('');
  const [slots, setSlots]       = useState([]);
  const [loading, setLoading]   = useState(false);

  // Sync initial dropdown selections when doctors or types load
  useEffect(() => {
    if (doctors && doctors.length > 0 && !doctorId) {
      setDoctorId(String(doctors[0].id));
    }
  }, [doctors]);

  useEffect(() => {
    if (appointmentTypes && appointmentTypes.length > 0 && !typeId) {
      setTypeId(String(appointmentTypes[0].id));
    }
  }, [appointmentTypes]);

  // Load catalogs if not already loaded in context
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        if (!doctors || doctors.length === 0) {
          const docs = await api.getDoctors();
          setDoctors(docs);
          if (docs.length > 0) setDoctorId(String(docs[0].id));
        }
        if (!appointmentTypes || appointmentTypes.length === 0) {
          const types = await api.getAppointmentTypes();
          setAppointmentTypes(types);
          if (types.length > 0) setTypeId(String(types[0].id));
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    fetchCatalogs();
  }, []);

  const selectedType = appointmentTypes.find(t => String(t.id) === typeId);
  const duration = selectedType ? selectedType.durationMinutes : 30;

  const fetchAvailability = async () => {
    if (!doctorId || !date || !duration) return;
    try {
      setLoading(true);
      const data = await api.getAvailability(doctorId, date, duration);
      setSlots(data || []);
    } catch (err) {
      showToast(err.message, 'error');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when query inputs change
  useEffect(() => {
    fetchAvailability();
  }, [doctorId, date, typeId]);

  const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const getDayName = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return DAY_NAMES[new Date(y, m - 1, d).getDay()];
  };

  const dayName = getDayName(date);
  const doctor = doctors.find(d => String(d.id) === doctorId);
  const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor';

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    // Format "2026-04-15T08:30:00" -> "08:30"
    const parts = dateTimeStr.split('T');
    if (parts.length > 1) {
      return parts[1].substring(0, 5);
    }
    return '';
  };

  const handleSlotClick = (slot) => {
    const timeStr = formatTime(slot.startAt);
    setPrefillAppt({
      doctorId: Number(doctorId),
      date,
      time: timeStr,
      typeId: Number(typeId)
    });
    setView('appointments');
    showToast(`Slot ${timeStr} seleccionado. Completa la cita.`, 'info');
  };

  const fmtDateDisplay = (iso) => {
    if (!iso) return '';
    const [y, m, dd] = iso.split('-').map(Number);
    return new Date(y, m - 1, dd).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Disponibilidad</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Consulta los slots disponibles por doctor, tipo de cita y fecha</p>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</label>
          <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            <option value="" disabled>Seleccione un doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.specialtyName})</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de Cita</label>
          <select className="form-select" value={typeId} onChange={e => setTypeId(e.target.value)}>
            <option value="" disabled>Seleccione un tipo</option>
            {appointmentTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <Icon name="calendar_today" size={14} style={{ marginRight: 6, color: 'var(--text-muted)', verticalAlign: 'middle' }} />
            {dayName}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {[
          { color: '#d1fae5', border: '#10b981', textColor: '#047857', label: 'Disponible (click para reservar)' }
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 18, borderRadius: 4, background: l.color, border: `1.5px solid ${l.border}` }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Slot grid */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{doctorName}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {fmtDateDisplay(date)} · Tipo: {selectedType?.name} ({duration} min)
            </div>
          </div>
          {slots.length > 0 && !loading && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{slots.length}</span> slots de tiempo disponibles
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando disponibilidad...
          </div>
        ) : slots.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title="Sin disponibilidad"
            message={`No se encontraron slots disponibles para ${doctorName} en esta fecha con una duración de ${duration} minutos. Verifique el horario laboral configurado del doctor.`}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
            {slots.map((slot, index) => {
              const startFormatted = formatTime(slot.startAt);
              return (
                <button
                  key={index}
                  onClick={() => handleSlotClick(slot)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: '1.5px solid #10b981',
                    background: '#d1fae5',
                    color: '#047857',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#a7f3d0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#d1fae5'; }}
                >
                  <Icon name="add_circle_outline" size={14} />
                  {startFormatted}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
