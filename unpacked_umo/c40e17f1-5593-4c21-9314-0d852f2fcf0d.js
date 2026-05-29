// UMO — Reports View
const { useState, useContext } = React;

function ViewReports() {
  const ctx = useContext(window.AppCtx);
  const { doctors, patients, rooms } = ctx;
  const { BarChart, PageHeader, Icon, EmptyState } = window;

  const [tab, setTab] = useState(0);
  const { roomOccupancy, doctorProductivity, noShows } = window.umoData.reportData;

  const getD = id => doctors.find(d => d.id === id);
  const getP = id => patients.find(p => p.id === id);
  const getR = id => rooms.find(r => r.id === id);

  const TABS = ['Ocupación de consultorios', 'Productividad de doctores', 'Inasistencias'];
  const TAB_ICONS = ['meeting_room', 'bar_chart', 'person_off'];

  const roomBarData = roomOccupancy.map(r => {
    const room = getR(r.roomId);
    const pct  = r.totalSlots > 0 ? Math.round((r.occupied / r.totalSlots) * 100) : 0;
    return { label: room?.name?.replace('Consultorio ', 'C-') || '—', value: pct, displayValue: pct + '%' };
  });

  const doctorBarData = doctorProductivity.map(d => ({
    label: getD(d.doctorId)?.name?.split(' ').slice(-1)[0] || '—',
    value: d.completed,
  }));

  const totalCompleted = doctorProductivity.reduce((s, d) => s + d.completed, 0);
  const totalNoShow    = noShows.reduce((s, n) => s + n.count, 0);
  const avgOccupancy   = roomOccupancy.filter(r => r.totalSlots > 0).reduce((s, r) => s + Math.round((r.occupied / r.totalSlots) * 100), 0)
    / (roomOccupancy.filter(r => r.totalSlots > 0).length || 1);

  return (
    <div>
      <PageHeader
        title="Reportes"
        subtitle="Estadísticas de uso y productividad del sistema"
      />

      {/* Summary chips */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { icon:'check_circle', label:'Citas completadas', value: totalCompleted, color:'var(--success)' },
          { icon:'percent',      label:'Ocupación promedio', value: Math.round(avgOccupancy) + '%', color:'var(--accent)' },
          { icon:'person_off',   label:'Inasistencias totales', value: totalNoShow, color:'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', flex:'1 1 180px' }}>
            <Icon name={s.icon} size={20} style={{ color: s.color, flexShrink:0 }} />
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--bg)', borderRadius:10, padding:4, width:'fit-content', flexWrap:'wrap' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{
              display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:7, border:'none',
              background: tab === i ? 'var(--bg-card)' : 'transparent',
              color: tab === i ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: tab === i ? 700 : 500,
              fontSize: 13, cursor:'pointer', fontFamily:'inherit',
              boxShadow: tab === i ? 'var(--shadow-sm)' : 'none',
              transition:'all 0.15s',
            }}>
            <Icon name={TAB_ICONS[i]} size={15} />
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Room Occupancy */}
      {tab === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>Ocupación de consultorios</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Porcentaje de slots utilizados por consultorio</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Consultorio</th>
                  <th>Ubicación</th>
                  <th>Slots totales</th>
                  <th>Ocupados</th>
                  <th>Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {roomOccupancy.map(r => {
                  const room = getR(r.roomId);
                  const pct  = r.totalSlots > 0 ? Math.round((r.occupied / r.totalSlots) * 100) : 0;
                  return (
                    <tr key={r.roomId}>
                      <td style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{room?.name}</td>
                      <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{room?.location}</td>
                      <td style={{ fontSize:14, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' }}>{r.totalSlots}</td>
                      <td style={{ fontSize:14, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' }}>{r.occupied}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:6, background:'var(--bg)', borderRadius:99, overflow:'hidden', minWidth:80 }}>
                            <div style={{ width:`${pct}%`, height:'100%', background: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--warning)', borderRadius:99, transition:'width 0.5s' }} />
                          </div>
                          <span style={{ fontSize:13, fontWeight:700, color:'var(--text)', minWidth:38 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:4 }}>% Ocupación</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>Por consultorio</div>
            <BarChart data={roomBarData} height={180} color="var(--accent)" />
          </div>
        </div>
      )}

      {/* Tab 1: Doctor Productivity */}
      {tab === 1 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>Productividad de doctores</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Citas completadas, canceladas y no-shows por doctor</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Especialidad</th>
                  <th>Completadas</th>
                  <th>Canceladas</th>
                  <th>No-Show</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {doctorProductivity.map(dp => {
                  const doc  = getD(dp.doctorId);
                  const spec = ctx.specialties.find(s => s.id === doc?.specialtyId);
                  const total = dp.completed + dp.cancelled + dp.noShow + dp.scheduled;
                  return (
                    <tr key={dp.doctorId}>
                      <td style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{doc?.name}</td>
                      <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{spec?.name}</td>
                      <td><span style={{ fontWeight:700, color:'var(--success)' }}>{dp.completed}</span></td>
                      <td><span style={{ fontWeight:600, color:'var(--text-muted)' }}>{dp.cancelled}</span></td>
                      <td><span style={{ fontWeight:600, color:'var(--warning)' }}>{dp.noShow}</span></td>
                      <td style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:4 }}>Citas completadas</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>Por doctor</div>
            <BarChart data={doctorBarData} height={180} color="var(--success)" />
          </div>
        </div>
      )}

      {/* Tab 2: No-Shows */}
      {tab === 2 && (
        <div>
          <div style={{ background:'#fef3c718', border:'1px solid #fef3c7', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
            <Icon name="warning" size={18} style={{ color:'var(--warning)', flexShrink:0 }} />
            <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
              Pacientes con historial de inasistencias. Se recomienda contacto preventivo antes de la próxima cita.
            </span>
          </div>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>Pacientes con mayor inasistencia</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Identificación</th>
                  <th>No-Shows</th>
                  <th>Última inasistencia</th>
                  <th>Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {noShows.map((n, i) => {
                  const pat  = getP(n.patientId);
                  const risk = n.count >= 3 ? { label:'Alto', color:'var(--danger)', bg:'#fee2e2' }
                             : n.count >= 2 ? { label:'Medio', color:'var(--warning)', bg:'#fef3c7' }
                             : { label:'Bajo', color:'var(--success)', bg:'#d1fae5' };
                  return (
                    <tr key={n.patientId}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:'#fef3c7', color:'#b45309', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                            {pat?.name?.charAt(0)}
                          </div>
                          <span style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{pat?.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{pat?.identification}</td>
                      <td>
                        <span style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>{n.count}</span>
                      </td>
                      <td style={{ fontSize:13, color:'var(--text-muted)' }}>
                        {new Date(n.lastDate + 'T00:00:00').toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })}
                      </td>
                      <td>
                        <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600, color: risk.color, background: risk.bg }}>
                          {risk.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

window.ViewReports = ViewReports;
