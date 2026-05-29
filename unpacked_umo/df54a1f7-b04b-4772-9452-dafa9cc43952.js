// UMO — Appointments View
const { useState, useContext, useEffect } = React;

function ViewAppointments() {
  const ctx = useContext(window.AppCtx);
  const { appointments, setAppointments, patients, doctors, rooms, appointmentTypes, showToast, prefillAppt, setPrefillAppt } = ctx;
  const { Badge, Modal, ConfirmDialog, PageHeader, FormGroup, FormInput, FormSelect, FormTextarea, SkeletonTable, EmptyState, Icon } = window;

  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFStatus]  = useState('ALL');
  const [filterDoctor, setFDoctor]  = useState('ALL');
  const [filterDate, setFDate]      = useState('');
  const [newOpen, setNewOpen]       = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmOpen, setConfirm]   = useState({ open: false, apptId: null, action: '', label: '' });
  const [selected, setSelected]     = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const emptyForm = { patientId:'1', doctorId:'1', roomId:'1', typeId:'1', date: window.umoData.today, time:'09:00', notes:'' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);

  // Handle pre-fill from Availability view
  useEffect(() => {
    if (prefillAppt) {
      setForm(f => ({ ...f, doctorId: String(prefillAppt.doctorId), date: prefillAppt.date, time: prefillAppt.time }));
      setNewOpen(true);
      setPrefillAppt(null);
    }
  }, [prefillAppt]);

  const getP = id => patients.find(p => p.id === Number(id));
  const getD = id => doctors.find(d => d.id === Number(id));
  const getR = id => rooms.find(r => r.id === Number(id));
  const getT = id => appointmentTypes.find(t => t.id === Number(id));

  const filtered = appointments.filter(a => {
    const okStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const okDoctor = filterDoctor === 'ALL' || a.doctorId === Number(filterDoctor);
    const okDate   = !filterDate || a.date === filterDate;
    return okStatus && okDoctor && okDate;
  });

  const handleNew = () => {
    if (!form.date || !form.time) return showToast('Completa todos los campos requeridos.', 'error');
    const type = getT(form.typeId);
    const [h, m] = form.time.split(':').map(Number);
    const endMin  = m + (type?.duration || 30);
    const endH    = h + Math.floor(endMin / 60);
    const endTime = `${String(endH).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`;
    setAppointments(prev => [...prev, {
      id: Date.now(), patientId: Number(form.patientId), doctorId: Number(form.doctorId),
      roomId: Number(form.roomId), typeId: Number(form.typeId),
      date: form.date, time: form.time, endTime, status: 'SCHEDULED',
      cancellationReason: null, notes: form.notes,
    }]);
    showToast('Cita creada exitosamente.', 'success');
    setNewOpen(false); setForm(emptyForm);
  };

  const changeStatus = (apptId, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus } : a));
    const labels = { CONFIRMED:'confirmada', COMPLETED:'marcada como completada', NO_SHOW:'marcada como no asistió' };
    showToast(`Cita ${labels[newStatus] || newStatus}.`, 'success');
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) return showToast('El motivo de cancelación es obligatorio.', 'error');
    setAppointments(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'CANCELLED', cancellationReason: cancelReason } : a));
    showToast('Cita cancelada.', 'success');
    setCancelOpen(false); setCancelReason('');
  };

  const openDetail = (a) => { setSelected(a); setDetailOpen(true); };
  const openCancel = (a) => { setSelected(a); setCancelOpen(true); };
  const openConfirmAction = (apptId, action, label) => setConfirm({ open: true, apptId, action, label });

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const fmtDate = iso => { const [y,m,d] = iso.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}); };

  return (
    <div>
      <PageHeader
        title="Citas"
        subtitle={`${appointments.length} citas registradas`}
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setNewOpen(true); }}>
            <Icon name="add" size={16} /> Nueva cita
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <select className="form-select" style={{ flex:'1 1 150px' }} value={filterStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="ALL">Todos los estados</option>
          <option value="SCHEDULED">Programada</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="NO_SHOW">No asistió</option>
        </select>
        <select className="form-select" style={{ flex:'1 1 160px' }} value={filterDoctor} onChange={e => setFDoctor(e.target.value)}>
          <option value="ALL">Todos los doctores</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input className="form-input" type="date" style={{ flex:'1 1 150px' }} value={filterDate} onChange={e => setFDate(e.target.value)} />
        {(filterStatus !== 'ALL' || filterDoctor !== 'ALL' || filterDate) &&
          <button className="btn btn-ghost btn-sm" onClick={() => { setFStatus('ALL'); setFDoctor('ALL'); setFDate(''); }}>
            <Icon name="filter_alt_off" size={14} /> Limpiar
          </button>
        }
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={6} rows={5} /> : filtered.length === 0 ? (
            <EmptyState icon="event_busy" title="Sin citas" message="No hay citas que coincidan con los filtros." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Consultorio</th>
                  <th>Fecha / Hora</th>
                  <th>Estado</th>
                  <th style={{ width:210 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time)).map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight:500, fontSize:14, color:'var(--text)' }}>{getP(a.patientId)?.name}</td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{getD(a.doctorId)?.name}</td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{getR(a.roomId)?.name}</td>
                    <td>
                      <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{fmtDate(a.date)}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{a.time} – {a.endTime}</div>
                    </td>
                    <td><Badge status={a.status} /></td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        <button className="btn btn-ghost btn-sm" title="Ver detalle" onClick={() => openDetail(a)}>
                          <Icon name="visibility" size={13} />
                        </button>
                        {a.status === 'SCHEDULED' && <>
                          <button className="btn btn-sm" style={{ background:'#d1fae5', color:'#047857', border:'none' }}
                            onClick={() => openConfirmAction(a.id, 'CONFIRMED', 'confirmar')}>Confirmar</button>
                          <button className="btn btn-sm" style={{ background:'#fee2e2', color:'#b91c1c', border:'none' }}
                            onClick={() => openCancel(a)}>Cancelar</button>
                        </>}
                        {a.status === 'CONFIRMED' && <>
                          <button className="btn btn-sm" style={{ background:'#dbeafe', color:'#1d4ed8', border:'none' }}
                            onClick={() => openConfirmAction(a.id, 'COMPLETED', 'completar')}>Completar</button>
                          <button className="btn btn-sm" style={{ background:'#fef3c7', color:'#92400e', border:'none' }}
                            onClick={() => openConfirmAction(a.id, 'NO_SHOW', 'marcar como no asistió')}>No-Show</button>
                          <button className="btn btn-sm" style={{ background:'#fee2e2', color:'#b91c1c', border:'none' }}
                            onClick={() => openCancel(a)}>Cancelar</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      <Modal isOpen={newOpen} onClose={() => setNewOpen(false)} title="Nueva cita" size="md"
        footer={
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setNewOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleNew}>Crear cita</button>
          </div>
        }>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <FormGroup label="Paciente" required>
            <FormSelect name="patientId" value={form.patientId} onChange={fc}>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Doctor" required>
            <FormSelect name="doctorId" value={form.doctorId} onChange={fc}>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Consultorio" required>
            <FormSelect name="roomId" value={form.roomId} onChange={fc}>
              {rooms.filter(r => r.status === 'AVAILABLE').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Tipo de cita" required>
            <FormSelect name="typeId" value={form.typeId} onChange={fc}>
              {appointmentTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.duration} min)</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Fecha" required>
            <FormInput name="date" type="date" value={form.date} onChange={fc} />
          </FormGroup>
          <FormGroup label="Hora" required>
            <FormInput name="time" type="time" value={form.time} onChange={fc} />
          </FormGroup>
        </div>
        <FormGroup label="Notas (opcional)">
          <FormTextarea name="notes" value={form.notes} onChange={fc} placeholder="Observaciones adicionales…" />
        </FormGroup>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle de la cita" size="md"
        footer={<button className="btn btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>}>
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', gap:12, marginBottom:8 }}>
              <Badge status={selected.status} />
            </div>
            {[
              { icon:'person',        label:'Paciente',   val: getP(selected.patientId)?.name },
              { icon:'medical_services', label:'Doctor', val: getD(selected.doctorId)?.name },
              { icon:'meeting_room',  label:'Consultorio',val: getR(selected.roomId)?.name },
              { icon:'event_note',    label:'Tipo',       val: `${getT(selected.typeId)?.name} · ${getT(selected.typeId)?.duration} min` },
              { icon:'calendar_today',label:'Fecha',      val: fmtDate(selected.date) },
              { icon:'schedule',      label:'Horario',    val: `${selected.time} – ${selected.endTime}` },
              ...(selected.notes ? [{ icon:'notes', label:'Notas', val: selected.notes }] : []),
              ...(selected.cancellationReason ? [{ icon:'cancel', label:'Motivo cancelación', val: selected.cancellationReason }] : []),
            ].map(r => (
              <div key={r.label} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <Icon name={r.icon} size={16} style={{ color:'var(--text-muted)', flexShrink:0, marginTop:2 }} />
                <div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{r.label}</div>
                  <div style={{ fontSize:14, color:'var(--text)', marginTop:2 }}>{r.val}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Cancel Reason Modal */}
      <Modal isOpen={cancelOpen} onClose={() => { setCancelOpen(false); setCancelReason(''); }}
        title="Cancelar cita" size="sm"
        footer={
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => { setCancelOpen(false); setCancelReason(''); }}>Volver</button>
            <button className="btn btn-danger" onClick={handleCancel}>Cancelar cita</button>
          </div>
        }>
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:14 }}>Indica el motivo de cancelación. Este campo es obligatorio.</p>
        <FormGroup label="Motivo de cancelación" required>
          <FormTextarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
            placeholder="Ej. Paciente solicitó reprogramación…" rows={4} />
        </FormGroup>
      </Modal>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen.open}
        onClose={() => setConfirm({ open:false, apptId:null, action:'', label:'' })}
        onConfirm={() => changeStatus(confirmOpen.apptId, confirmOpen.action)}
        title="Confirmar acción"
        message={`¿Seguro que deseas ${confirmOpen.label} esta cita?`}
        confirmLabel="Sí, continuar"
        danger={confirmOpen.action === 'NO_SHOW'}
      />
    </div>
  );
}

window.ViewAppointments = ViewAppointments;
