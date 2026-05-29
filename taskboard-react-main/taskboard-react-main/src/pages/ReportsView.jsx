import React, { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../App';
import { PageHeader, Icon, EmptyState, BarChart } from '../components/Shared';
import { api } from '../services/api';

export default function ReportsView() {
  const ctx = useContext(AppCtx);
  const { showToast } = ctx;

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNDaysAgoStr = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [from, setFrom] = useState(getNDaysAgoStr(30));
  const [to, setTo]     = useState(getTodayStr());
  const [tab, setTab]   = useState(0);

  const [loading, setLoading] = useState(true);
  const [officeOccupancy, setOfficeOccupancy] = useState([]);
  const [doctorProductivity, setDoctorProductivity] = useState([]);
  const [noShowPatients, setNoShowPatients] = useState([]);

  const TABS = ['Ocupación de consultorios', 'Productividad de doctores', 'Inasistencias'];
  const TAB_ICONS = ['meeting_room', 'bar_chart', 'person_off'];

  const loadReports = async () => {
    try {
      setLoading(true);
      const fromIso = `${from}T00:00:00`;
      const toIso   = `${to}T23:59:59`;

      const [occupancyData, productivityData, noShowData] = await Promise.all([
        api.getOfficeOccupancy(fromIso, toIso),
        api.getDoctorProductivity(fromIso, toIso),
        api.getNoShowPatients(fromIso, toIso)
      ]);

      setOfficeOccupancy(occupancyData || []);
      setDoctorProductivity(productivityData || []);
      setNoShowPatients(noShowData || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [from, to]);

  // Calculations for summary chips
  const totalCompleted = doctorProductivity.reduce((sum, dp) => sum + Number(dp.completedAppointments || 0), 0);
  const totalNoShow    = noShowPatients.reduce((sum, n) => sum + Number(n.noShowCount || 0), 0);
  
  const activeOccupancies = officeOccupancy.filter(r => r.totalAppointments > 0);
  const avgOccupancy = activeOccupancies.length > 0
    ? activeOccupancies.reduce((sum, r) => sum + r.occupancyPercentage, 0) / activeOccupancies.length
    : 0;

  // Chart Mappings
  const roomBarData = officeOccupancy.map(r => {
    const label = r.officeName ? r.officeName.replace('Consultorio ', 'C-') : `C-${r.officeId}`;
    return {
      label,
      value: Math.round(r.occupancyPercentage),
      displayValue: Math.round(r.occupancyPercentage) + '%'
    };
  });

  const doctorBarData = doctorProductivity.map(dp => {
    // Show last name or short name
    const nameParts = dp.doctorFullName ? dp.doctorFullName.split(' ') : ['—'];
    const shortName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    return {
      label: shortName,
      value: Number(dp.completedAppointments || 0)
    };
  });

  const fmtValuePercent = (val) => `${val}%`;

  return (
    <div>
      <PageHeader
        title="Reportes"
        subtitle="Estadísticas de uso y productividad del sistema"
      />

      {/* Date Range Selection */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha Inicio</label>
          <input className="form-input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha Fin</label>
          <input className="form-input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <button className="btn btn-primary" onClick={loadReports}>
            <Icon name="search" size={14} style={{ marginRight: 6 }} /> Actualizar Reportes
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: 'check_circle', label: 'Citas completadas', value: totalCompleted, color: 'var(--success)' },
          { icon: 'percent',      label: 'Ocupación promedio', value: Math.round(avgOccupancy) + '%', color: 'var(--accent)' },
          { icon: 'person_off',   label: 'Inasistencias totales', value: totalNoShow, color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', flex: '1 1 180px' }}>
            <Icon name={s.icon} size={20} style={{ color: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg)', borderRadius: 10, padding: 4, width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, border: 'none',
              background: tab === i ? 'var(--bg-card)' : 'transparent',
              color: tab === i ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: tab === i ? 700 : 500,
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: tab === i ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}>
            <Icon name={TAB_ICONS[i]} size={15} />
            {t}
          </button>
        ))}
      </div>

      {/* Report loading / content */}
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando datos de reportes para el período seleccionado...
        </div>
      ) : (
        <>
          {/* Tab 0: Room Occupancy */}
          {tab === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Ocupación de consultorios</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Porcentaje de ocupación calculado para cada consultorio activo</div>
                </div>
                {officeOccupancy.length === 0 ? (
                  <EmptyState icon="meeting_room" title="Sin registros" message="No hay datos de consultorios en este rango." />
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Consultorio</th>
                        <th>Piso</th>
                        <th>Total Citas</th>
                        <th>Completadas</th>
                        <th>Canceladas</th>
                        <th>Ocupación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officeOccupancy.map(r => {
                        const pct = Math.round(r.occupancyPercentage);
                        return (
                          <tr key={r.officeId}>
                            <td style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{r.officeName}</td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Piso {r.floor}</td>
                            <td style={{ fontSize: 14, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.totalAppointments}</td>
                            <td style={{ fontSize: 14, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.completedAppointments}</td>
                            <td style={{ fontSize: 14, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.cancelledAppointments}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden', minWidth: 80 }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--warning)', borderRadius: 99, transition: 'width 0.5s' }} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', minWidth: 38 }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>% Ocupación</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Por consultorio</div>
                {roomBarData.length > 0 ? (
                  <BarChart data={roomBarData} height={180} color="var(--accent)" formatValue={fmtValuePercent} />
                ) : (
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Sin datos para graficar</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 1: Doctor Productivity */}
          {tab === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Productividad de doctores</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Citas completadas, canceladas e inasistencias por doctor</div>
                </div>
                {doctorProductivity.length === 0 ? (
                  <EmptyState icon="medical_services" title="Sin registros" message="No hay productividad de doctores en este rango." />
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Especialidad</th>
                        <th>Completadas</th>
                        <th>Canceladas</th>
                        <th>No-Show</th>
                        <th>Total</th>
                        <th>Tasa Completadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorProductivity.map(dp => {
                        const total = dp.totalAppointments;
                        const complRate = Math.round(dp.completionRate);
                        return (
                          <tr key={dp.doctorId}>
                            <td style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{dp.doctorFullName}</td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{dp.specialtyName}</td>
                            <td><span style={{ fontWeight: 700, color: 'var(--success)' }}>{dp.completedAppointments}</span></td>
                            <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{dp.cancelledAppointments}</span></td>
                            <td><span style={{ fontWeight: 600, color: 'var(--warning)' }}>{dp.noShowAppointments}</span></td>
                            <td style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{total}</td>
                            <td><span style={{ fontWeight: 700, color: complRate >= 75 ? 'var(--success)' : complRate >= 50 ? 'var(--accent)' : 'var(--warning)' }}>{complRate}%</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>Citas completadas</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Por doctor</div>
                {doctorBarData.length > 0 ? (
                  <BarChart data={doctorBarData} height={180} color="var(--success)" />
                ) : (
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Sin datos para graficar</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: No-Shows */}
          {tab === 2 && (
            <div>
              <div style={{ background: '#fef3c718', border: '1px solid #fef3c7', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="warning" size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Pacientes con historial de inasistencias en el período seleccionado. Se recomienda contacto preventivo antes de su próxima cita.
                </span>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Pacientes con mayor inasistencia</div>
                </div>
                {noShowPatients.length === 0 ? (
                  <EmptyState icon="person_search" title="Sin inasistencias" message="No se registraron no-shows en este período." />
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Identificación</th>
                        <th>Correo electrónico</th>
                        <th>No-Shows</th>
                        <th>Riesgo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {noShowPatients.map((n, i) => {
                        const count = n.noShowCount;
                        const risk = count >= 3 ? { label: 'Alto', color: 'var(--danger)', bg: '#fee2e2' }
                                   : count >= 2 ? { label: 'Medio', color: 'var(--warning)', bg: '#fef3c7' }
                                   : { label: 'Bajo', color: 'var(--success)', bg: '#d1fae5' };
                        return (
                          <tr key={n.patientId}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                  {n.patientFullName ? n.patientFullName.charAt(0) : 'P'}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{n.patientFullName}</span>
                              </div>
                            </td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.universityId}</td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.email}</td>
                            <td>
                              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{count}</span>
                            </td>
                            <td>
                              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, color: risk.color, background: risk.bg }}>
                                {risk.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
