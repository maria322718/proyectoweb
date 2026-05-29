// UMO — Catalog View (Specialties + Appointment Types)
const { useState, useContext } = React;

function ViewCatalog() {
  const ctx = useContext(window.AppCtx);
  const { specialties, setSpecialties, appointmentTypes, setAppointmentTypes, showToast } = ctx;
  const { Modal, PageHeader, FormGroup, FormInput, FormSelect, EmptyState, Icon } = window;

  const [specModal, setSpecModal]   = useState(false);
  const [typeModal, setTypeModal]   = useState(false);
  const [specForm, setSpecForm]     = useState({ name:'', code:'' });
  const [typeForm, setTypeForm]     = useState({ name:'', duration:'30' });

  const saveSpec = () => {
    if (!specForm.name || !specForm.code) return showToast('Completa todos los campos.', 'error');
    setSpecialties(prev => [...prev, { id: Date.now(), name: specForm.name, code: specForm.code.toUpperCase() }]);
    showToast('Especialidad agregada.', 'success');
    setSpecModal(false); setSpecForm({ name:'', code:'' });
  };

  const saveType = () => {
    if (!typeForm.name) return showToast('Ingresa el nombre del tipo de cita.', 'error');
    setAppointmentTypes(prev => [...prev, { id: Date.now(), name: typeForm.name, duration: Number(typeForm.duration) }]);
    showToast('Tipo de cita agregado.', 'success');
    setTypeModal(false); setTypeForm({ name:'', duration:'30' });
  };

  const removeSpec = (id) => {
    setSpecialties(prev => prev.filter(s => s.id !== id));
    showToast('Especialidad eliminada.', 'success');
  };

  const removeType = (id) => {
    setAppointmentTypes(prev => prev.filter(t => t.id !== id));
    showToast('Tipo de cita eliminado.', 'success');
  };

  const SPEC_COLORS = ['#006494','#7c3aed','#0d9488','#b45309','#be185d','#1d4ed8'];

  return (
    <div>
      <PageHeader
        title="Catálogo"
        subtitle="Gestión de especialidades médicas y tipos de cita"
      />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>

        {/* Specialties */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)', margin:0 }}>Especialidades</h2>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:'3px 0 0 0' }}>{specialties.length} registradas</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setSpecModal(true)}>
              <Icon name="add" size={14} /> Agregar
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {specialties.length === 0
              ? <EmptyState icon="local_hospital" title="Sin especialidades" message="Agrega la primera especialidad." />
              : specialties.map((s, i) => (
                <div key={s.id} className="card" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background: SPEC_COLORS[i % SPEC_COLORS.length] + '18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:12, fontWeight:800, color: SPEC_COLORS[i % SPEC_COLORS.length] }}>{s.code}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{s.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>Código: {s.code}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => removeSpec(s.id)}>
                    <Icon name="delete_outline" size={16} />
                  </button>
                </div>
              ))
            }
          </div>
        </div>

        {/* Appointment Types */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)', margin:0 }}>Tipos de cita</h2>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:'3px 0 0 0' }}>{appointmentTypes.length} configurados</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setTypeModal(true)}>
              <Icon name="add" size={14} /> Agregar
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {appointmentTypes.length === 0
              ? <EmptyState icon="event_note" title="Sin tipos de cita" message="Agrega el primer tipo de cita." />
              : appointmentTypes.map(t => (
                <div key={t.id} className="card" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'var(--success-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name="schedule" size={18} style={{ color:'var(--success)' }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>Duración: {t.duration} min</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ background:'var(--bg)', padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:600, color:'var(--text-secondary)' }}>
                      {t.duration} min
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => removeType(t.id)}>
                      <Icon name="delete_outline" size={16} />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* New Specialty Modal */}
      <Modal isOpen={specModal} onClose={() => setSpecModal(false)} title="Nueva especialidad" size="sm"
        footer={
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setSpecModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveSpec}>Guardar</button>
          </div>
        }>
        <FormGroup label="Nombre de la especialidad" required>
          <FormInput value={specForm.name} onChange={e => setSpecForm(p => ({...p, name: e.target.value}))} placeholder="Ej. Dermatología" />
        </FormGroup>
        <FormGroup label="Código corto" required>
          <FormInput value={specForm.code} onChange={e => setSpecForm(p => ({...p, code: e.target.value}))} placeholder="Ej. DER" maxLength={5} />
        </FormGroup>
      </Modal>

      {/* New Appointment Type Modal */}
      <Modal isOpen={typeModal} onClose={() => setTypeModal(false)} title="Nuevo tipo de cita" size="sm"
        footer={
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setTypeModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveType}>Guardar</button>
          </div>
        }>
        <FormGroup label="Nombre del tipo" required>
          <FormInput value={typeForm.name} onChange={e => setTypeForm(p => ({...p, name: e.target.value}))} placeholder="Ej. Control de seguimiento" />
        </FormGroup>
        <FormGroup label="Duración (minutos)" required>
          <FormSelect value={typeForm.duration} onChange={e => setTypeForm(p => ({...p, duration: e.target.value}))}>
            {[15,20,30,45,60,90].map(d => <option key={d} value={d}>{d} minutos</option>)}
          </FormSelect>
        </FormGroup>
      </Modal>
    </div>
  );
}

window.ViewCatalog = ViewCatalog;
