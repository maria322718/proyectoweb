import React, { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../App';
import { Badge, Modal, PageHeader, FormGroup, FormInput, FormSelect, SkeletonTable, EmptyState, Icon } from '../components/Shared';
import { api } from '../services/api';

export default function OfficeCrud() {
  const ctx = useContext(AppCtx);
  const { offices, setOffices, showToast } = ctx;

  const [loading, setLoading]  = useState(true);
  const [modalOpen, setModalOpen]  = useState(false);
  const [editMode, setEditMode]    = useState(false);
  const [selected, setSelected] = useState(null);

  const emptyForm = { name: '', floor: '1', status: 'ACTIVE' };
  const [form, setForm]        = useState(emptyForm);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const data = await api.getOffices();
      setOffices(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffices();
  }, []);

  const openNew  = () => { setForm(emptyForm); setEditMode(false); setModalOpen(true); };
  const openEdit = (r) => {
    setForm({ name: r.name, floor: String(r.floor), status: r.status });
    setSelected(r); setEditMode(true); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.floor) return showToast('Completa los campos requeridos.', 'error');
    try {
      const payload = {
        name: form.name,
        floor: Number(form.floor),
        status: form.status
      };
      if (editMode) {
        const updated = await api.updateOffice(selected.id, payload);
        setOffices(prev => prev.map(r => r.id === selected.id ? updated : r));
        showToast('Consultorio actualizado.', 'success');
      } else {
        const created = await api.createOffice(payload);
        setOffices(prev => [...prev, created]);
        showToast('Consultorio registrado exitosamente.', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const STATUS_ICON = { ACTIVE: 'check_circle', UNDER_MAINTENANCE: 'build', INACTIVE: 'cancel' };
  const STATUS_COLOR = { ACTIVE: 'var(--success)', UNDER_MAINTENANCE: 'var(--warning)', INACTIVE: 'var(--text-muted)' };

  const stats = {
    available:   offices.filter(r => r.status === 'ACTIVE').length,
    maintenance: offices.filter(r => r.status === 'UNDER_MAINTENANCE').length,
    inactive:    offices.filter(r => r.status === 'INACTIVE').length,
  };

  return (
    <div>
      <PageHeader
        title="Consultorios"
        subtitle={`${offices.length} consultorios registrados`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Icon name="add" size={16} style={{ marginRight: 4 }} /> Nuevo consultorio
          </button>
        }
      />

      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Disponibles',     count: stats.available,   status: 'ACTIVE',   color: 'var(--success)' },
          { label: 'Mantenimiento',   count: stats.maintenance, status: 'UNDER_MAINTENANCE', color: 'var(--warning)' },
          { label: 'Inactivos',       count: stats.inactive,    status: 'INACTIVE',    color: 'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', marginBottom: 0 }}>
            <Icon name={STATUS_ICON[s.status]} size={22} style={{ color: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={4} rows={4} /> : offices.length === 0 ? (
            <EmptyState icon="meeting_room" title="Sin consultorios" message="Registra el primer consultorio." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Consultorio</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th style={{ width: 100 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {offices.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name="meeting_room" size={18} style={{ color: STATUS_COLOR[r.status] }} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{r.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                        <Icon name="location_on" size={14} style={{ color: 'var(--text-muted)' }} />
                        Piso {r.floor}
                      </div>
                    </td>
                    <td><Badge status={r.status} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>
                        <Icon name="edit" size={14} style={{ marginRight: 4 }} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editMode ? 'Editar consultorio' : 'Nuevo consultorio'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        }>
        <FormGroup label="Nombre del consultorio" required>
          <FormInput name="name" value={form.name} onChange={fc} placeholder="Ej. Consultorio 401" />
        </FormGroup>
        <FormGroup label="Número de Piso" required>
          <FormSelect name="floor" value={form.floor} onChange={fc}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(f => <option key={f} value={f}>Piso {f}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup label="Estado">
          <FormSelect name="status" value={form.status} onChange={fc}>
            <option value="ACTIVE">Disponible (Activo)</option>
            <option value="UNDER_MAINTENANCE">En mantenimiento</option>
            <option value="INACTIVE">Inactivo</option>
          </FormSelect>
        </FormGroup>
      </Modal>
    </div>
  );
}
