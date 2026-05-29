import React, { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../App';
import { Badge, Modal, ConfirmDialog, PageHeader, FormGroup, FormInput, FormSelect, FormTextarea, SkeletonTable, EmptyState, Icon } from '../components/Shared';
import { api } from '../services/api';

export default function AppointmentCrud() {
  const ctx = useContext(AppCtx);
  const { 
    appointments, setAppointments, 
    patients, setPatients, 
    doctors, setDoctors, 
    rooms, setRooms, 
    appointmentTypes, setAppointmentTypes, 
    showToast, prefillAppt, setPrefillAppt 
  } = ctx;

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFStatus]  = useState('ALL');
  const [filterDoctor, setFDoctor]  = useState('ALL');
  const [filterDate, setFDate]      = useState('');
  const [newOpen, setNewOpen]       = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [confirmOpen, setConfirm]   = useState({ open: false, apptId: null, action: '', label: '' });
  const [selected, setSelected]     = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  const emptyForm = { patientId: '', doctorId: '', roomId: '', typeId: '', date: getTodayStr(), time: '09:00', notes: '' };
  const [form, setForm] = useState(emptyForm);

  // Load appointments and catalogs
  const loadAllData = async () => {
    try {
      setLoading(true);
      const appts = await api.getAppointments();
      setAppointments(appts);

      if (!patients || patients.length === 0) {
        const pts = await api.getPatients();
        setPatients(pts);
      }
      if (!doctors || doctors.length === 0) {
        const docs = await api.getDoctors();
        setDoctors(docs);
      }
      if (!rooms || rooms.length === 0) {
        const rms = await api.getOffices();
        setRooms(rms);
      }
      if (!appointmentTypes || appointmentTypes.length === 0) {
        const types = await api.getAppointmentTypes();
        setAppointmentTypes(types);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync initial dropdown selections when modal opens or catalogs load
  useEffect(() => {
    if (newOpen) {
      const defaultPt = patients.length > 0 ? String(patients[0].id) : '';
      const defaultDoc = doctors.length > 0 ? String(doctors[0].id) : '';
      const defaultRoom = rooms.length > 0 ? String(rooms[0].id) : '';
      const defaultType = appointmentTypes.length > 0 ? String(appointmentTypes[0].id) : '';

      setForm(prev => ({
        ...prev,
        patientId: prev.patientId || defaultPt,
        doctorId: prev.doctorId || defaultDoc,
        roomId: prev.roomId || defaultRoom,
        typeId: prev.typeId || defaultType
      }));
    }
  }, [newOpen, patients, doctors, rooms, appointmentTypes]);

  // Handle pre-fill from Availability view
  useEffect(() => {
    if (prefillAppt) {
      const defaultPt = patients.length > 0 ? String(patients[0].id) : '';
      const defaultRoom = rooms.length > 0 ? String(rooms[0].id) : '';

      setForm({
        patientId: defaultPt,
        doctorId: String(prefillAppt.doctorId),
        roomId: defaultRoom,
        typeId: String(prefillAppt.typeId),
        date: prefillAppt.date,
        time: prefillAppt.time,
        notes: ''
      });
      setNewOpen(true);
      setPrefillAppt(null);
    }
  }, [prefillAppt]);

  // Helpers to extract date & time from LocalDateTime strings (e.g. "2026-04-15T09:00:00")
  const getDateStr = (dtStr) => dtStr ? dtStr.split('T')[0] : '';
  const getTimeStr = (dtStr) => dtStr && dtStr.includes('T') ? dtStr.split('T')[1].substring(0, 5) : '';

  const getP = id => patients.find(p => p.id === Number(id));
  const getD = id => doctors.find(d => d.id === Number(id));
  const getR = id => rooms.find(r => r.id === Number(id));
  const getT = id => appointmentTypes.find(t => t.id === Number(id));

  const filtered = appointments.filter(a => {
    const apptDate = getDateStr(a.startAt);
    const okStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const okDoctor = filterDoctor === 'ALL' || a.doctorId === Number(filterDoctor);
    const okDate   = !filterDate || apptDate === filterDate;
    return okStatus && okDoctor && okDate;
  });

  const handleNew = async () => {
    if (!form.patientId || !form.doctorId || !form.roomId || !form.typeId || !form.date || !form.time) {
      return showToast('Completa todos los campos requeridos.', 'error');
    }

    try {
      const payload = {
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        officeId: Number(form.roomId),
        appointmentTypeId: Number(form.typeId),
        startAt: `${form.date}T${form.time}:00`,
        notes: form.notes
      };

      const created = await api.createAppointment(payload);
      setAppointments(prev => [created, ...prev]);
      showToast('Cita creada exitosamente.', 'success');
      setNewOpen(false);
      setForm(emptyForm);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const executeStatusChange = async (apptId, newStatus) => {
    try {
      let updated;
      if (newStatus === 'CONFIRMED') {
        updated = await api.confirmAppointment(apptId);
      } else if (newStatus === 'NO_SHOW') {
        updated = await api.noShowAppointment(apptId);
      }
      
      setAppointments(prev => prev.map(a => a.id === apptId ? updated : a));
      const labels = { CONFIRMED: 'confirmada', NO_SHOW: 'marcada como no asistió' };
      showToast(`Cita ${labels[newStatus] || newStatus}.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return showToast('El motivo de cancelación es obligatorio.', 'error');
    try {
      const updated = await api.cancelAppointment(selected.id, cancelReason);
      setAppointments(prev => prev.map(a => a.id === selected.id ? updated : a));
      showToast('Cita cancelada.', 'success');
      setCancelOpen(false);
      setCancelReason('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleComplete = async () => {
    try {
      const updated = await api.completeAppointment(selected.id, completeNotes.trim() ? completeNotes : null);
      setAppointments(prev => prev.map(a => a.id === selected.id ? updated : a));
      showToast('Cita completada con éxito.', 'success');
      setCompleteOpen(false);
      setCompleteNotes('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openDetail = (a) => { setSelected(a); setDetailOpen(true); };
  const openCancel = (a) => { setSelected(a); setCancelOpen(true); };
  const openComplete = (a) => { setSelected(a); setCompleteOpen(true); };
  const openConfirmAction = (apptId, action, label) => setConfirm({ open: true, apptId, action, label });

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const fmtDate = iso => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ flex: '1 1 150px' }} value={filterStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="ALL">Todos los estados</option>
          <option value="SCHEDULED">Programada</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="NO_SHOW">No asistió</option>
        </select>
        <select className="form-select" style={{ flex: '1 1 160px' }} value={filterDoctor} onChange={e => setFDoctor(e.target.value)}>
          <option value="ALL">Todos los doctores</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
        </select>
        <input className="form-input" type="date" style={{ flex: '1 1 150px' }} value={filterDate} onChange={e => setFDate(e.target.value)} />
        {(filterStatus !== 'ALL' || filterDoctor !== 'ALL' || filterDate) &&
          <button className="btn btn-ghost btn-sm" onClick={() => { setFStatus('ALL'); setFDoctor('ALL'); setFDate(''); }}>
            <Icon name="filter_alt_off" size={14} /> Limpiar
          </button>
        }
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                  <th style={{ width: 210 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].sort((a, b) => b.startAt.localeCompare(a.startAt)).map(a => {
                  const dateVal = getDateStr(a.startAt);
                  const timeVal = getTimeStr(a.startAt);
                  const endVal  = getTimeStr(a.endAt);
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{a.patientFullName}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.doctorFullName}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.officeName}</td>
                      <td>
                        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{fmtDate(dateVal)}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeVal} – {endVal}</div>
                      </td>
                      <td><Badge status={a.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <button className="btn btn-ghost btn-sm" title="Ver detalle" onClick={() => openDetail(a)}>
                            <Icon name="visibility" size={13} />
                          </button>
                          {a.status === 'SCHEDULED' && (
                            <>
                              <button className="btn btn-sm" style={{ background: '#d1fae5', color: '#047857', border: 'none' }}
                                onClick={() => openConfirmAction(a.id, 'CONFIRMED', 'confirmar')}>Confirmar</button>
                              <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#b91c1c', border: 'none' }}
                                onClick={() => openCancel(a)}>Cancelar</button>
                            </>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <>
                              <button className="btn btn-sm" style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none' }}
                                onClick={() => openComplete(a)}>Completar</button>
                              <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#92400e', border: 'none' }}
                                onClick={() => openConfirmAction(a.id, 'NO_SHOW', 'marcar como no asistió')}>No-Show</button>
                              <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#b91c1c', border: 'none' }}
                                onClick={() => openCancel(a)}>Cancelar</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      <Modal isOpen={newOpen} onClose={() => setNewOpen(false)} title="Nueva cita" size="md"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setNewOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleNew}>Crear cita</button>
          </div>
        }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Paciente" required>
            <FormSelect name="patientId" value={form.patientId} onChange={fc}>
              <option value="" disabled>Seleccione paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Doctor" required>
            <FormSelect name="doctorId" value={form.doctorId} onChange={fc}>
              <option value="" disabled>Seleccione doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Consultorio" required>
            <FormSelect name="roomId" value={form.roomId} onChange={fc}>
              <option value="" disabled>Seleccione consultorio</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Piso {r.floor})</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Tipo de cita" required>
            <FormSelect name="typeId" value={form.typeId} onChange={fc}>
              <option value="" disabled>Seleccione tipo de cita</option>
              {appointmentTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <Badge status={selected.status} />
            </div>
            {[
              { icon: 'person',        label: 'Paciente',   val: selected.patientFullName },
              { icon: 'medical_services', label: 'Doctor', val: selected.doctorFullName },
              { icon: 'meeting_room',  label: 'Consultorio',val: selected.officeName },
              { icon: 'event_note',    label: 'Tipo',       val: selected.appointmentTypeName },
              { icon: 'calendar_today',label: 'Fecha',      val: fmtDate(getDateStr(selected.startAt)) },
              { icon: 'schedule',      label: 'Horario',    val: `${getTimeStr(selected.startAt)} – ${getTimeStr(selected.endAt)}` },
              ...(selected.notes ? [{ icon: 'notes', label: 'Observaciones / Notas', val: selected.notes }] : []),
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Icon name={r.icon} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 2, whiteSpace: 'pre-wrap' }}>{r.val}</div>
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
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => { setCancelOpen(false); setCancelReason(''); }}>Volver</button>
            <button className="btn btn-danger" onClick={handleCancel}>Cancelar cita</button>
          </div>
        }>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Indica el motivo de cancelación. Este campo es obligatorio.</p>
        <FormGroup label="Motivo de cancelación" required>
          <FormTextarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
            placeholder="Ej. Paciente solicitó reprogramación…" rows={4} />
        </FormGroup>
      </Modal>

      {/* Complete Notes Modal */}
      <Modal isOpen={completeOpen} onClose={() => { setCompleteOpen(false); setCompleteNotes(''); }}
        title="Completar cita" size="sm"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => { setCompleteOpen(false); setCompleteNotes(''); }}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleComplete}>Completar cita</button>
          </div>
        }>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Registra observaciones administrativas o notas clínicas de la consulta (opcional).</p>
        <FormGroup label="Observaciones finales">
          <FormTextarea value={completeNotes} onChange={e => setCompleteNotes(e.target.value)}
            placeholder="Ej. Se recetaron analgésicos, requiere control en 15 días…" rows={4} />
        </FormGroup>
      </Modal>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen.open}
        onClose={() => setConfirm({ open: false, apptId: null, action: '', label: '' })}
        onConfirm={() => executeStatusChange(confirmOpen.apptId, confirmOpen.action)}
        title="Confirmar acción"
        message={`¿Seguro que deseas ${confirmOpen.label} esta cita?`}
        confirmLabel="Sí, continuar"
        danger={confirmOpen.action === 'NO_SHOW'}
      />
    </div>
  );
}
