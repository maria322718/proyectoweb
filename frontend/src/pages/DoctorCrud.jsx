import React, { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../App';
import { Badge, Modal, PageHeader, FormGroup, FormInput, FormSelect, SkeletonTable, EmptyState, Icon } from '../components/Shared';
import { api } from '../services/api';
import ScheduleConfig from './ScheduleConfig';

export default function DoctorCrud() {
  const ctx = useContext(AppCtx);
  const { doctors, setDoctors, specialties, setSpecialties, showToast } = ctx;

  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [schedOpen, setSchedOpen]   = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [selected, setSelected]     = useState(null);

  const emptyForm = { firstName: '', lastName: '', licenseNumber: '', specialtyId: '', active: true };
  const [form, setForm]             = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const docs = await api.getDoctors();
      setDoctors(docs);
      
      const specs = await api.getSpecialties();
      setSpecialties(specs);

      // Si hay especialidades, preseleccionar la primera en el formulario vacío
      if (specs.length > 0) {
        setForm(prev => ({ ...prev, specialtyId: String(specs[0].id) }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFullName = (d) => {
    if (!d) return '';
    return `${d.firstName} ${d.lastName}`;
  };

  const filtered = doctors.filter(d => {
    const fullName = getFullName(d).toLowerCase();
    const specialtyName = d.specialtyName ? d.specialtyName.toLowerCase() : '';
    const matchSearch = fullName.includes(search.toLowerCase()) ||
                        specialtyName.includes(search.toLowerCase()) ||
                        d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const openNew = () => {
    setForm(emptyForm);
    if (specialties.length > 0) {
      setForm(prev => ({ ...prev, specialtyId: String(specialties[0].id) }));
    }
    setEditMode(false);
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setForm({
      firstName: d.firstName,
      lastName: d.lastName,
      licenseNumber: d.licenseNumber,
      specialtyId: String(d.specialtyId),
      active: d.active
    });
    setSelected(d);
    setEditMode(true);
    setModalOpen(true);
  };

  const openSched = (d) => {
    setSelected(d);
    setSchedOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.licenseNumber || !form.specialtyId) {
      return showToast('Completa los campos requeridos.', 'error');
    }
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        licenseNumber: form.licenseNumber,
        specialtyId: Number(form.specialtyId),
        active: form.active === 'true' || form.active === true
      };

      if (editMode) {
        const updated = await api.updateDoctor(selected.id, payload);
        setDoctors(prev => prev.map(d => d.id === selected.id ? updated : d));
        showToast('Doctor actualizado correctamente.', 'success');
      } else {
        const created = await api.createDoctor(payload);
        setDoctors(prev => [...prev, created]);
        showToast('Doctor registrado exitosamente.', 'success');
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
        title="Doctores"
        subtitle={`${doctors.filter(d => d.active).length} doctores activos · ${doctors.length} en total`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Icon name="add" size={16} style={{ marginRight: 4 }} /> Nuevo doctor
          </button>
        }
      />

      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 340 }}>
        <Icon name="search" size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Buscar por nombre, licencia o especialidad…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={4} rows={4} /> : filtered.length === 0 ? (
            <EmptyState icon="medical_services" title="Sin doctores" message="No hay doctores que coincidan con tu búsqueda." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Especialidad</th>
                  <th>Licencia</th>
                  <th>Estado</th>
                  <th style={{ width: 180 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#7c3aed18', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {d.firstName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{getFullName(d)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {d.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg)', padding: '4px 10px', borderRadius: 6, fontSize: 13 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', padding: '1px 5px', borderRadius: 4 }}>
                          {d.specialtyName ? d.specialtyName.substring(0, 3).toUpperCase() : 'MED'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{d.specialtyName || 'Medicina'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.licenseNumber}</td>
                    <td><Badge status={d.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openSched(d)}>
                          <Icon name="calendar_month" size={14} style={{ marginRight: 4 }} /> Horarios
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>
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

      {/* Doctor Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editMode ? 'Editar doctor' : 'Nuevo doctor'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Nombres" required>
            <FormInput name="firstName" value={form.firstName} onChange={fc} placeholder="Ej. Andrés" />
          </FormGroup>
          <FormGroup label="Apellidos" required>
            <FormInput name="lastName" value={form.lastName} onChange={fc} placeholder="Ej. Mora" />
          </FormGroup>
        </div>
        <FormGroup label="Licencia Médica" required>
          <FormInput name="licenseNumber" value={form.licenseNumber} onChange={fc} placeholder="Ej. REG-88392" disabled={editMode} />
        </FormGroup>
        <FormGroup label="Especialidad" required>
          <FormSelect name="specialtyId" value={form.specialtyId} onChange={fc}>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FormSelect>
        </FormGroup>
        {editMode && (
          <FormGroup label="Estado">
            <FormSelect name="active" value={form.active} onChange={fc}>
              <option value={true}>Activo</option>
              <option value={false}>Inactivo</option>
            </FormSelect>
          </FormGroup>
        )}
      </Modal>

      {/* Schedule Management Modal */}
      <ScheduleConfig isOpen={schedOpen} onClose={() => setSchedOpen(false)} doctor={selected} showToast={showToast} />
    </div>
  );
}
