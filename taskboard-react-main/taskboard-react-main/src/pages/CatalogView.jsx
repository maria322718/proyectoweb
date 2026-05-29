import React, { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../App';
import { Modal, PageHeader, FormGroup, FormInput, FormSelect, EmptyState, Icon } from '../components/Shared';
import { api } from '../services/api';

export default function CatalogView() {
  const ctx = useContext(AppCtx);
  const { specialties, setSpecialties, appointmentTypes, setAppointmentTypes, showToast } = ctx;

  const [loading, setLoading]       = useState(true);
  const [specModal, setSpecModal]   = useState(false);
  const [typeModal, setTypeModal]   = useState(false);
  const [specForm, setSpecForm]     = useState({ name: '' });
  const [typeForm, setTypeForm]     = useState({ name: '', duration: '30' });

  const loadData = async () => {
    try {
      setLoading(true);
      const specs = await api.getSpecialties();
      setSpecialties(specs);
      
      const types = await api.getAppointmentTypes();
      setAppointmentTypes(types);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveSpec = async () => {
    if (!specForm.name) return showToast('Completa el nombre de la especialidad.', 'error');
    try {
      const created = await api.createSpecialty(specForm);
      setSpecialties(prev => [...prev, created]);
      showToast('Especialidad agregada.', 'success');
      setSpecModal(false);
      setSpecForm({ name: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const saveType = async () => {
    if (!typeForm.name) return showToast('Ingresa el nombre del tipo de cita.', 'error');
    try {
      const payload = {
        name: typeForm.name,
        durationMinutes: Number(typeForm.duration)
      };
      const created = await api.createAppointmentType(payload);
      setAppointmentTypes(prev => [...prev, created]);
      showToast('Tipo de cita agregado.', 'success');
      setTypeModal(false);
      setTypeForm({ name: '', duration: '30' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const SPEC_COLORS = ['#006494', '#7c3aed', '#0d9488', '#b45309', '#be185d', '#1d4ed8'];

  // Generar código de especialidad basado en su nombre
  const getShortCode = name => {
    if (!name) return 'MED';
    const cleaned = name.replace(/medicina|doctor|dra/gi, '').trim();
    if (cleaned.length >= 3) return cleaned.substring(0, 3).toUpperCase();
    return name.substring(0, 3).toUpperCase();
  };

  return (
    <div>
      <PageHeader
        title="Catálogo"
        subtitle="Gestión de especialidades médicas y tipos de cita"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>

        {/* Specialties */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Especialidades</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>{specialties.length} registradas</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setSpecModal(true)}>
              <Icon name="add" size={14} style={{ marginRight: 4 }} /> Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando especialidades...</div>
            ) : specialties.length === 0 ? (
              <EmptyState icon="local_hospital" title="Sin especialidades" message="Agrega la primera especialidad." />
            ) : (
              specialties.map((s, i) => {
                const code = getShortCode(s.name);
                return (
                  <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', marginBottom: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: SPEC_COLORS[i % SPEC_COLORS.length] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: SPEC_COLORS[i % SPEC_COLORS.length] }}>{code}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Código: {code}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Appointment Types */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Tipos de cita</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>{appointmentTypes.length} configurados</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setTypeModal(true)}>
              <Icon name="add" size={14} style={{ marginRight: 4 }} /> Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando tipos de cita...</div>
            ) : appointmentTypes.length === 0 ? (
              <EmptyState icon="event_note" title="Sin tipos de cita" message="Agrega el primer tipo de cita." />
            ) : (
              appointmentTypes.map(t => (
                <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', marginBottom: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="schedule" size={18} style={{ color: 'var(--success)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Duración: {t.durationMinutes} min</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ background: 'var(--bg)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {t.durationMinutes} min
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Specialty Modal */}
      <Modal isOpen={specModal} onClose={() => setSpecModal(false)} title="Nueva especialidad" size="sm"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setSpecModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveSpec}>Guardar</button>
          </div>
        }>
        <FormGroup label="Nombre de la especialidad" required>
          <FormInput value={specForm.name} onChange={e => setSpecForm({ name: e.target.value })} placeholder="Ej. Dermatología" />
        </FormGroup>
      </Modal>

      {/* New Appointment Type Modal */}
      <Modal isOpen={typeModal} onClose={() => setTypeModal(false)} title="Nuevo tipo de cita" size="sm"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setTypeModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveType}>Guardar</button>
          </div>
        }>
        <FormGroup label="Nombre del tipo" required>
          <FormInput value={typeForm.name} onChange={e => setTypeForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej. Control de seguimiento" />
        </FormGroup>
        <FormGroup label="Duración (minutos)" required>
          <FormSelect value={typeForm.duration} onChange={e => setTypeForm(p => ({ ...p, duration: e.target.value }))}>
            {[15, 20, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} minutos</option>)}
          </FormSelect>
        </FormGroup>
      </Modal>
    </div>
  );
}
