// UMO — Dashboard View
const { useState, useContext, useEffect } = React;

function ViewDashboard() {
  const ctx = useContext(window.AppCtx);
  const { appointments, patients, doctors, specialties, rooms } = ctx;
  const { KPICard, BarChart, Badge, Icon, SkeletonTable } = window;

  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);

  const today = window.umoData.today;
  const todayAppts = appointments.filter(a => a.date === today);
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED');
  const scheduled = appointments.filter(a => a.status === 'SCHEDULED');
  const activePatients = patients.filter(p => p.status === 'ACTIVE');

  const getPatient = id => patients.find(p => p.id === id);
  const getDoctor  = id => doctors.find(d => d.id === id);

  const barData = window.umoData.weeklyOccupancy.map(w => ({
    label: w.day,
    value: w.occupied,
    displayValue: w.occupied,
  }));

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KPICard icon="people" label="Pacientes activos"   value={activePatients.length} sub={`de ${patients.length} registrados`}     accentColor="var(--accent)" />
        <KPICard icon="event" label="Citas del día"         value={todayAppts.length}     sub="programadas para hoy"                     accentColor="#7c3aed" />
        <KPICard icon="check_circle" label="Confirmadas"   value={confirmed.length}       sub="listas para atención"                     accentColor="var(--success)" />
        <KPICard icon="pending" label="Pendientes"          value={scheduled.length}       sub="aguardando confirmación"                  accentColor="var(--warning)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Today's appointments table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Citas de hoy</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{todayAppts.length} citas programadas</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => ctx.setView('appointments')}>
              Ver todas <Icon name="arrow_forward" size={14} />
            </button>
          </div>
          <div className="table-wrapper">
            {loading ? <SkeletonTable cols={4} rows={4} /> : todayAppts.length === 0 ? (
              <window.EmptyState icon="event_busy" title="Sin citas hoy" message="No hay citas programadas para hoy." />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppts.map(a => {
                    const pat = getPatient(a.patientId);
                    const doc = getDoctor(a.doctorId);
                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: 14 }}>{pat?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pat?.identification}</div>
                        </td>
                        <td style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{doc?.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text)' }}>
                            <Icon name="schedule" size={14} style={{ color: 'var(--text-muted)' }} />
                            {a.time}
                          </div>
                        </td>
                        <td><Badge status={a.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Occupancy chart */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>Ocupación semanal</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Citas atendidas por día</div>
          {loading
            ? <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />
            : <BarChart data={barData} height={180} color="var(--accent)" />
          }
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Consultorios', value: rooms.length, icon: 'meeting_room', color: 'var(--accent)' },
              { label: 'Doctores',     value: doctors.length, icon: 'medical_services', color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All upcoming appointments */}
      <div className="card" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Historial reciente</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Últimas {appointments.length} citas en el sistema</div>
        </div>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={5} rows={4} /> : (
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {[...appointments].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)).map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{getPatient(a.patientId)?.name}</td>
                    <td style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{getDoctor(a.doctorId)?.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmtDate(a.date)}</td>
                    <td style={{ fontSize: 14, color: 'var(--text)' }}>{a.time}</td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

window.ViewDashboard = ViewDashboard;
