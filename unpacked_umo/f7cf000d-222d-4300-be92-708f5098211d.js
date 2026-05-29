// UMO — Patients View
const { useState, useContext, useEffect } = React;

function ViewPatients() {
  const ctx = useContext(window.AppCtx);
  const { patients, setPatients, showToast } = ctx;
  const { Badge, Modal, PageHeader, FormGroup, FormInput, FormSelect, SkeletonTable, EmptyState, Icon } = window;

  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('ALL');
  const [modalOpen, setModalOpen]   = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [editMode, setEditMode]     = useState(false);
  const emptyForm = { name:'', identification:'', email:'', phone:'', status:'ACTIVE' };
  const [form, setForm]             = useState(emptyForm);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.identification.includes(search) ||
                        p.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openNew = () => { setForm(emptyForm); setEditMode(false); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, identification: p.identification, email: p.email, phone: p.phone, status: p.status });
    setSelected(p); setEditMode(true); setModalOpen(true);
  };
  const openDetail = (p) => { setSelected(p); setDetailOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.identification || !form.email) return showToast('Completa los campos requeridos.', 'error');
    if (editMode) {
      setPatients(prev => prev.map(p => p.id === selected.id ? { ...p, ...form } : p));
      showToast('Paciente actualizado correctamente.', 'success');
    } else {
      const newP = { id: Date.now(), ...form };
      setPatients(prev => [...prev, newP]);
      showToast('Paciente registrado exitosamente.', 'success');
    }
    setModalOpen(false);
  };

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div>
      <PageHeader
        title="Pacientes"
        subtitle={`${patients.filter(p=>p.status==='ACTIVE').length} pacientes activos · ${patients.length} en total`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Icon name="add" size={16} /> Nuevo paciente
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 240px' }}>
          <Icon name="search" size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input className="form-input" placeholder="Buscar por nombre, ID o email…" style={{ paddingLeft:34 }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ flex:'0 0 160px' }} value={filterStatus} onChange={e => setFilter(e.target.value)}>
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
        </select>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={5} rows={5} /> : filtered.length === 0 ? (
            <EmptyState icon="person_search" title="Sin resultados" message="No hay pacientes que coincidan con tu búsqueda." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Identificación</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th style={{ width:140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-light)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{p.name}</div>
                          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:14, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' }}>{p.identification}</td>
                    <td style={{ fontSize:14, color:'var(--text-secondary)' }}>{p.phone}</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
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
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        }>
        <FormGroup label="Nombre completo" required>
          <FormInput name="name" value={form.name} onChange={fc} placeholder="Ej. María García" />
        </FormGroup>
        <FormGroup label="Número de identificación" required>
          <FormInput name="identification" value={form.identification} onChange={fc} placeholder="CC / TI / CE" />
        </FormGroup>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
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
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>
            <button className="btn btn-primary" onClick={() => { setDetailOpen(false); openEdit(selected); }}>Editar</button>
          </div>
        }>
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--accent-light)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700 }}>
                {selected.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>{selected.name}</div>
                <Badge status={selected.status} />
              </div>
            </div>
            {[
              { icon:'badge',  label:'Identificación', val: selected.identification },
              { icon:'email',  label:'Correo',         val: selected.email },
              { icon:'phone',  label:'Teléfono',       val: selected.phone },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <Icon name={r.icon} size={16} style={{ color:'var(--text-muted)', flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{r.label}</div>
                  <div style={{ fontSize:14, color:'var(--text)' }}>{r.val}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

window.ViewPatients = ViewPatients;
