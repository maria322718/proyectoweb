// UMO — Main App
const { useState, useEffect } = React;

/* ─── Sidebar nav items ──────────────────────────────── */
const NAV = [
  { id:'dashboard',     icon:'dashboard',       label:'Dashboard' },
  { id:'patients',      icon:'people',          label:'Pacientes' },
  { id:'doctors',       icon:'medical_services',label:'Doctores' },
  { id:'catalog',       icon:'category',        label:'Catálogo' },
  { id:'rooms',         icon:'meeting_room',    label:'Consultorios' },
  { id:'availability',  icon:'event_available', label:'Disponibilidad' },
  { id:'appointments',  icon:'assignment',      label:'Citas' },
  { id:'reports',       icon:'bar_chart',       label:'Reportes' },
];

/* ─── Sidebar ─────────────────────────────────────────── */
function Sidebar({ current, onNavigate, mobileOpen, onOverlayClick }) {
  const { Icon } = window;
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay visible" onClick={onOverlayClick} />}
      <nav className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:8, background:'#006494', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="local_hospital" size={18} style={{ color:'#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:'#fff', letterSpacing:'-0.01em' }}>UMO</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Consultorios</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>
          {NAV.map(item => {
            const active = current === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                style={{
                  display:'flex', alignItems:'center', gap:10, width:'100%',
                  padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer',
                  background: active ? 'rgba(0,100,148,0.35)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize:13, fontWeight: active ? 600 : 400, fontFamily:'inherit',
                  marginBottom:2, transition:'all 0.15s', textAlign:'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}
              >
                {active && <div style={{ position:'absolute', left:0, width:3, height:32, background:'#006494', borderRadius:'0 3px 3px 0' }} />}
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {active && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#006494', boxShadow:'0 0 6px #006494' }} />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>Universidad — Sistema Médico</div>
        </div>
      </nav>
    </>
  );
}

/* ─── Top Bar ─────────────────────────────────────────── */
function TopBar({ darkMode, toggleDark, currentView, onMenuClick }) {
  const { Icon } = window;
  const label = NAV.find(n => n.id === currentView)?.label || 'Dashboard';
  return (
    <header className="topbar">
      <button className="btn-icon mobile-menu" onClick={onMenuClick}>
        <Icon name="menu" size={22} />
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{label}</span>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
        <button className="btn-icon" onClick={toggleDark} title="Cambiar tema" style={{ position:'relative' }}>
          <Icon name={darkMode ? 'wb_sunny' : 'dark_mode'} size={20} />
        </button>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontSize:13, fontWeight:700 }}>
          A
        </div>
      </div>
    </header>
  );
}

/* ─── App ─────────────────────────────────────────────── */
function App() {
  const { ToastContainer, AppCtx } = window;

  const [view, setView]         = useState('dashboard');
  const [darkMode, setDark]     = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);
  const [toasts, setToasts]     = useState([]);
  const [prefillAppt, setPrefill] = useState(null);

  // Data state
  const [patients,         setPatients]         = useState(window.umoData.patients);
  const [doctors,          setDoctors]           = useState(window.umoData.doctors);
  const [rooms,            setRooms]             = useState(window.umoData.rooms);
  const [appointments,     setAppointments]      = useState(window.umoData.appointments);
  const [specialties,      setSpecialties]       = useState(window.umoData.specialties);
  const [appointmentTypes, setAppointmentTypes]  = useState(window.umoData.appointmentTypes);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Toast system
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  const navigate = (id) => { setView(id); setSidebar(false); };

  const ctx = {
    view, setView: navigate,
    darkMode, setDarkMode: setDark,
    patients,         setPatients,
    doctors,          setDoctors,
    rooms,            setRooms,
    appointments,     setAppointments,
    specialties,      setSpecialties,
    appointmentTypes, setAppointmentTypes,
    showToast,
    prefillAppt, setPrefillAppt: setPrefill,
  };

  const ViewMap = {
    dashboard:    window.ViewDashboard,
    patients:     window.ViewPatients,
    doctors:      window.ViewDoctors,
    catalog:      window.ViewCatalog,
    rooms:        window.ViewRooms,
    availability: window.ViewAvailability,
    appointments: window.ViewAppointments,
    reports:      window.ViewReports,
  };
  const CurrentView = ViewMap[view] || window.ViewDashboard;

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app-layout">
        <Sidebar current={view} onNavigate={navigate} mobileOpen={sidebarOpen} onOverlayClick={() => setSidebar(false)} />
        <TopBar darkMode={darkMode} toggleDark={() => setDark(d => !d)} currentView={view} onMenuClick={() => setSidebar(s => !s)} />
        <main className="main-content">
          <CurrentView />
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AppCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
