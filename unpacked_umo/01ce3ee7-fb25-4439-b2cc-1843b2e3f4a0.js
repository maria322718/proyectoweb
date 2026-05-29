// UMO — Availability View
const { useState, useContext } = React;

function ViewAvailability() {
  const ctx = useContext(window.AppCtx);
  const { doctors, appointments, setView, showToast } = ctx;
  const { Icon, EmptyState } = window;

  const [doctorId, setDoctorId] = useState('1');
  const [date, setDate]         = useState(window.umoData.today);

  const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

  const getDayName = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return DAY_NAMES[new Date(y, m - 1, d).getDay()];
  };

  const dayName  = getDayName(date);
  const schedule = window.umoData.schedules[Number(doctorId)] || {};
  const daySlots = schedule[dayName] || [];

  const occupiedSlots = appointments
    .filter(a => a.doctorId === Number(doctorId) && a.date === date && a.status !== 'CANCELLED')
    .map(a => a.time);

  const doctor = doctors.find(d => d.id === Number(doctorId));

  const handleSlotClick = (slot) => {
    ctx.setPrefillAppt({ doctorId: Number(doctorId), date, time: slot });
    setView('appointments');
    showToast(`Slot ${slot} seleccionado. Completa la cita.`, 'info');
  };

  const isWeekend = ['Domingo','Sábado'].includes(dayName);

  const fmtDateDisplay = (iso) => {
    const [y, m, dd] = iso.split('-').map(Number);
    return new Date(y, m - 1, dd).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Disponibilidad</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Consulta los slots disponibles por doctor y fecha</p>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</label>
          <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
          { color: '#d1fae5', border: '#10b981', textColor: '#047857', label: 'Disponible (click para reservar)' },
          { color: 'var(--bg)', border: 'var(--border)', textColor: 'var(--text-muted)', label: 'Ocupado' },
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
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{doctor?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {fmtDateDisplay(date)}
            </div>
          </div>
          {daySlots.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{daySlots.length - occupiedSlots.length}</span> disponibles ·{' '}
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{occupiedSlots.length}</span> ocupados
            </div>
          )}
        </div>

        {isWeekend || daySlots.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title={isWeekend ? 'Sin atención' : 'Sin horario'}
            message={isWeekend ? 'No hay atención los fines de semana.' : `${doctor?.name} no tiene horario definido para ${dayName.toLowerCase()}.`}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
            {daySlots.map(slot => {
              const busy = occupiedSlots.includes(slot);
              return (
                <button
                  key={slot}
                  onClick={() => !busy && handleSlotClick(slot)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: busy ? '1.5px solid var(--border)' : '1.5px solid #10b981',
                    background: busy ? 'var(--bg)' : '#d1fae5',
                    color: busy ? 'var(--text-muted)' : '#047857',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    opacity: busy ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#a7f3d0'; }}
                  onMouseLeave={e => { if (!busy) e.currentTarget.style.background = '#d1fae5'; }}
                >
                  <Icon name={busy ? 'lock' : 'add_circle_outline'} size={14} />
                  {slot}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

window.ViewAvailability = ViewAvailability;
