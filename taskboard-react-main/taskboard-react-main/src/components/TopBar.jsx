import React from 'react';
import { Icon } from './Shared';

const TITLE_MAP = {
  dashboard:    'Dashboard',
  patients:     'Pacientes',
  doctors:      'Doctores',
  catalog:      'Catálogo',
  rooms:        'Consultorios',
  availability: 'Disponibilidad',
  appointments: 'Citas',
  reports:      'Reportes',
};

export default function TopBar({ darkMode, toggleDark, currentView, onMenuClick }) {
  const label = TITLE_MAP[currentView] || 'Dashboard';
  
  return (
    <header className="topbar">
      <button className="btn-icon mobile-menu" onClick={onMenuClick}>
        <Icon name="menu" size={22} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{label}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        <button className="btn-icon" onClick={toggleDark} title="Cambiar tema" style={{ position: 'relative' }}>
          <Icon name={darkMode ? 'wb_sunny' : 'dark_mode'} size={20} />
        </button>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
          A
        </div>
      </div>
    </header>
  );
}
