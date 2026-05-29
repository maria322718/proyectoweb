import React, { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../App';
import { Badge, Modal, PageHeader, FormGroup, FormInput, FormSelect, SkeletonTable, EmptyState, Icon } from '../components/Shared';
import { api } from '../services/api';

export default function PatientCrud() {
  const ctx = useContext(AppCtx);
  const { patients, setPatients, showToast } = ctx;

  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('ALL');
  const [modalOpen, setModalOpen]   = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [editMode, setEditMode]     = useState(false);

  const emptyForm = { firstName: '', lastName: '', universityId: '', email: '', phone: '', status: 'ACTIVE' };
  const [form, setForm]             = useState(emptyForm);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const getFullName = (p) => {
    if (!p) return '';
    return `${p.firstName} ${p.lastName}`;
  };

  const filtered = patients.filter(p => {
    const fullName = getFullName(p).toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
                        p.universityId.toLowerCase().includes(search.toLowerCase()) ||
                        p.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openNew = () => {
    setForm(emptyForm);
    setEditMode(false);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      firstName: p.firstName,
      lastName: p.lastName,
      universityId: p.universityId,
      email: p.email,
      phone: p.phone || '',
      status: p.status
    });
    setSelected(p);
    setEditMode(true);
    setModalOpen(true);
  };

  const openDetail = (p) => {
    setSelected(p);
    setDetailOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.universityId || !form.email) {
      return showToast('Completa los campos requeridos.', 'error');
    }
    try {
      if (editMode) {
        const updated = await api.updatePatient(selected.id, form);
        setPatients(prev => prev.map(p => p.id === selected.id ? updated : p));
        showToast('Paciente actualizado correctamente.', 'success');
      } else {
        const created = await api.createPatient(form);
        setPatients(prev => [...prev, created]);
        showToast('Paciente registrado exitosamente.', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div>
      <PageHeader
        title="Pacientes"
        subtitle={`${patients.filter(p => p.status === 'ACTIVE').length} pacientes activos · ${patients.length} en total`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Icon name="add" size={16} style={{ marginRight: 4 }} /> Nuevo paciente
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Icon name="search" size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Buscar por nombre, matrícula o email…" style={{ paddingLeft: 34 }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ flex: '0 0 160px' }} value={filterStatus} onChange={e => setFilter(e.target.value)}>
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={5} rows={5} /> : filtered.length === 0 ? (
            <EmptyState icon="person_search" title="Sin resultados" message="No hay pacientes que coincidan con tu búsqueda." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Matrícula</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th style={{ width: 140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {p.firstName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{getFullName(p)}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 14, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{p.universityId}</td>
                    <td style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p.phone || '—'}</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" title="Ver detalle" onClick={() => openDetail(p)}>
                          <Icon name="visibility" size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => openEdit(p)}>
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editMode ? 'Editar paciente' : 'Nuevo paciente'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Nombres" required>
            <FormInput name="firstName" value={form.firstName} onChange={fc} placeholder="Ej. María" />
          </FormGroup>
          <FormGroup label="Apellidos" required>
            <FormInput name="lastName" value={form.lastName} onChange={fc} placeholder="Ej. García" />
          </FormGroup>
        </div>
        <FormGroup label="Número de Matrícula / Identificación" required>
          <FormInput name="universityId" value={form.universityId} onChange={fc} placeholder="Ej. MAT-U12345" disabled={editMode} />
        </FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Correo electrónico" required>
            <FormInput name="email" type="email" value={form.email} onChange={fc} placeholder="correo@uni.edu.co" />
          </FormGroup>
          <FormGroup label="Teléfono">
            <FormInput name="phone" value={form.phone} onChange={fc} placeholder="300 000 0000" />
          </FormGroup>
        </div>
        {editMode && (
          <FormGroup label="Estado">
            <FormSelect name="status" value={form.status} onChange={fc}>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </FormSelect>
          </FormGroup>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle del paciente"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>
            <button className="btn btn-primary" onClick={() => { setDetailOpen(false); openEdit(selected); }}>Editar</button>
          </div>
        }>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
                {selected.firstName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{getFullName(selected)}</div>
                <Badge status={selected.status} />
              </div>
            </div>
            {[
              { icon: 'badge', label: 'Matrícula / Identificación', val: selected.universityId },
              { icon: 'email', label: 'Correo', val: selected.email },
              { icon: 'phone', label: 'Teléfono', val: selected.phone || '—' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name={r.icon} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>{r.val}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
