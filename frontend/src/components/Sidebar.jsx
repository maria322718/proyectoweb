import React from 'react';
import { Icon } from './Shared';

const NAV = [
  { id: 'dashboard',    icon: 'dashboard',        label: 'Dashboard' },
  { id: 'patients',     icon: 'people',           label: 'Pacientes' },
  { id: 'doctors',      icon: 'medical_services', label: 'Doctores' },
  { id: 'catalog',      icon: 'category',         label: 'Catálogo' },
  { id: 'rooms',        icon: 'meeting_room',     label: 'Consultorios' },
  { id: 'availability', icon: 'event_available',  label: 'Disponibilidad' },
  { id: 'appointments', icon: 'assignment',       label: 'Citas' },
  { id: 'reports',      icon: 'bar_chart',        label: 'Reportes' },
];

export default function Sidebar({ current, onNavigate, mobileOpen, onOverlayClick }) {
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay visible" onClick={onOverlayClick} />}
      <nav className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#006494', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="local_hospital" size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.01em' }}>UMO</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Consultorios</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', position: 'relative' }}>
          {NAV.map(item => {
            const active = current === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(0,100,148,0.35)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: 'inherit',
                  marginBottom: 2, transition: 'all 0.15s', textAlign: 'left',
                  position: 'relative'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {active && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, background: '#006494', borderRadius: '0 3px 3px 0' }} />}
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#006494', boxShadow: '0 0 6px #006494' }} />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Universidad — Sistema Médico</div>
        </div>
      </nav>
    </>
  );
}
