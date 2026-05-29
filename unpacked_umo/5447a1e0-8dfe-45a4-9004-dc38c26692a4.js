// UMO — Rooms View
const { useState, useContext, useEffect } = React;

function ViewRooms() {
  const ctx = useContext(window.AppCtx);
  const { rooms, setRooms, showToast } = ctx;
  const { Badge, Modal, PageHeader, FormGroup, FormInput, FormSelect, SkeletonTable, EmptyState, Icon } = window;

  const [loading, setLoading]  = useState(true);
  const [modalOpen, setModal]  = useState(false);
  const [editMode, setEdit]    = useState(false);
  const [selected, setSelected] = useState(null);
  const emptyForm = { name:'', location:'', status:'AVAILABLE' };
  const [form, setForm]        = useState(emptyForm);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const openNew  = () => { setForm(emptyForm); setEdit(false); setModal(true); };
  const openEdit = (r) => {
    setForm({ name: r.name, location: r.location, status: r.status });
    setSelected(r); setEdit(true); setModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.location) return showToast('Completa los campos requeridos.', 'error');
    if (editMode) {
      setRooms(prev => prev.map(r => r.id === selected.id ? { ...r, ...form } : r));
      showToast('Consultorio actualizado.', 'success');
    } else {
      setRooms(prev => [...prev, { id: Date.now(), ...form }]);
      showToast('Consultorio registrado exitosamente.', 'success');
    }
    setModal(false);
  };

  const fc = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const STATUS_ICON = { AVAILABLE:'check_circle', MAINTENANCE:'build', INACTIVE:'cancel' };
  const STATUS_COLOR = { AVAILABLE:'var(--success)', MAINTENANCE:'var(--warning)', INACTIVE:'var(--text-muted)' };

  const stats = {
    available:   rooms.filter(r => r.status === 'AVAILABLE').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
    inactive:    rooms.filter(r => r.status === 'INACTIVE').length,
  };

  return (
    <div>
      <PageHeader
        title="Consultorios"
        subtitle={`${rooms.length} consultorios registrados`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Icon name="add" size={16} /> Nuevo consultorio
          </button>
        }
      />

      {/* Status summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Disponibles',     count: stats.available,   status:'AVAILABLE',   color:'var(--success)' },
          { label:'Mantenimiento',   count: stats.maintenance, status:'MAINTENANCE', color:'var(--warning)' },
          { label:'Inactivos',       count: stats.inactive,    status:'INACTIVE',    color:'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px' }}>
            <Icon name={STATUS_ICON[s.status]} size={22} style={{ color: s.color, flexShrink:0 }} />
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{s.count}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-wrapper">
          {loading ? <SkeletonTable cols={4} rows={4} /> : rooms.length === 0 ? (
            <EmptyState icon="meeting_room" title="Sin consultorios" message="Registra el primer consultorio." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Consultorio</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th style={{ width:100 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Icon name="meeting_room" size={18} style={{ color: STATUS_COLOR[r.status] }} />
                        </div>
                        <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{r.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, color:'var(--text-secondary)' }}>
                        <Icon name="location_on" size={14} style={{ color:'var(--text-muted)' }} />
                        {r.location}
                      </div>
                    </td>
                    <td><Badge status={r.status} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>
                        <Icon name="edit" size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModal(false)}
        title={editMode ? 'Editar consultorio' : 'Nuevo consultorio'}
        footer={
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        }>
        <FormGroup label="Nombre del consultorio" required>
          <FormInput name="name" value={form.name} onChange={fc} placeholder="Ej. Consultorio 401" />
        </FormGroup>
        <FormGroup label="Ubicación" required>
          <FormInput name="location" value={form.location} onChange={fc} placeholder="Ej. Edificio B, Piso 4" />
        </FormGroup>
        <FormGroup label="Estado">
          <FormSelect name="status" value={form.status} onChange={fc}>
            <option value="AVAILABLE">Disponible</option>
            <option value="MAINTENANCE">En mantenimiento</option>
            <option value="INACTIVE">Inactivo</option>
          </FormSelect>
        </FormGroup>
      </Modal>
    </div>
  );
}

window.ViewRooms = ViewRooms;
