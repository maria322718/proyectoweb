// UMO — Doctors View
const { useState, useContext, useEffect } = React;

function ViewDoctors() {
  const ctx = useContext(window.AppCtx);
  const { doctors, setDoctors, showToast } = ctx;
  const { specialties } = ctx;
  const { Badge, Modal, PageHeader, FormGroup, FormInput, FormSelect, SkeletonTable, EmptyState, Icon } = window;

  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [schedOpen, setSchedOpen]   = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [selected, setSelected]     = useState(null);
  const emptyForm = { name:'', email:'', specialtyId:'1', status:'ACTIVE' };
  const [form, setForm]             = useState(emptyForm);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 850); return () => clearTimeout(t); }, []);

  const getSpec = id => specialties.find(s => s.id === Number(id));

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    getSpec(d.specialtyId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => { setForm(emptyForm); setEditMode(false); setModalOpen(true); };
  const openEdit = (d) => {
    setForm({ name: d.name, email: d.email, specialtyId: String(d.specialtyId), status: d.status });
    setSelected(d); setEditMode(true); setModalOpen(true);
  };
  const openSched = (d) => { setSelected(d); setSchedOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.email) return showToast('Completa los campos requeridos.', 'error');
    if (editMode) {
      setDoctors(prev => prev.map(d => d.id === selected.id ? { ...d, ...form, specialtyId: Number(form.specialtyId) } : d));
      showToast('Doctor actualizado correctamente.', 'success');
    } else {
      setDoctors(prev => [...prev, { id: Date.now(), ...form, specialtyId: Number(form.specialtyId) }]);
      showToast('Doctor registrado exitosamente.', 'success');
    }
    setModalOpen(false);
  };

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
  const schedData = selected ? (window.umoData.schedules[selected.id] || {}) : {};

  return (
    <div>
      <PageHeader
        title="Doctores"
        subtitle={`${doctors.filter(d=>d.status==='ACTIVE').length} doctores activos`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Icon name="add" size={16} /> Nuevo doctor
          </button>
        }
      />

      <div style={{ position:'relative', marginBottom:20, maxWidth:340 }}>
        <Icon name="search" size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
        <input className="form-input" style={{ paddingLeft:34 }} placeholder="Buscar por nombre o especialidad…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={4} rows={4} /> : filtered.length === 0 ? (
            <EmptyState icon="medical_services" title="Sin doctores" message="No hay doctores que coincidan con tu búsqueda." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                  <th style={{ width:180 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const spec = getSpec(d.specialtyId);
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'#7c3aed18', color:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
                            {d.name.replace('Dr. ','').replace('Dra. ','').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{d.name}</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{d.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--bg)', padding:'4px 10px', borderRadius:6, fontSize:13 }}>
                          <span style={{ fontSize:10, fontWeight:700, color:'var(--accent)', background:'var(--accent-light)', padding:'1px 5px', borderRadius:4 }}>
                            {spec?.code}
                          </span>
                          <span style={{ color:'var(--text-secondary)' }}>{spec?.name}</span>
                        </div>
                      </td>
                      <td><Badge status={d.status} /></td>
                      <td>
                        <div style={{ display:'flex', gap:4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openSched(d)}>
                            <Icon name="calendar_month" size={14} /> Horarios
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>
                            <Icon name="edit" size={14} />
                          </button>
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

      {/* Doctor Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editMode ? 'Editar doctor' : 'Nuevo doctor'}
        footer={
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        }>
        <FormGroup label="Nombre completo" required>
          <FormInput name="name" value={form.name} onChange={fc} placeholder="Ej. Dr. Juan Martínez" />
        </FormGroup>
        <FormGroup label="Correo electrónico" required>
          <FormInput name="email" type="email" value={form.email} onChange={fc} placeholder="doctor@uni.edu.co" />
        </FormGroup>
        <FormGroup label="Especialidad" required>
          <FormSelect name="specialtyId" value={form.specialtyId} onChange={fc}>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FormSelect>
        </FormGroup>
        {editMode && (
          <FormGroup label="Estado">
            <FormSelect name="status" value={form.status} onChange={fc}>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </FormSelect>
          </FormGroup>
        )}
      </Modal>

      {/* Schedule Modal */}
      <Modal isOpen={schedOpen} onClose={() => setSchedOpen(false)} title={`Horario — ${selected?.name}`} size="lg"
        footer={
          <div style={{ display:'flex', gap:8, justifyContent:'space-between', width:'100%' }}>
            <button className="btn btn-secondary" onClick={() => showToast('Función de agregar horarios próximamente.', 'info')}>
              <Icon name="add" size={14} /> Agregar horario
            </button>
            <button className="btn btn-primary" onClick={() => setSchedOpen(false)}>Cerrar</button>
          </div>
        }>
        {selected && (
          <div>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Slots disponibles por día de la semana</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
              {DAYS.map(day => {
                const slots = schedData[day] || [];
                return (
                  <div key={day}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-secondary)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'center' }}>{day.slice(0,3)}</div>
                    {slots.length === 0
                      ? <div style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center', padding:'8px 0' }}>—</div>
                      : slots.map(slot => (
                        <div key={slot} style={{ padding:'4px 6px', marginBottom:4, fontSize:12, fontWeight:600, background:'var(--accent-light)', color:'var(--accent)', borderRadius:6, textAlign:'center' }}>
                          {slot}
                        </div>
                      ))
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

window.ViewDoctors = ViewDoctors;
