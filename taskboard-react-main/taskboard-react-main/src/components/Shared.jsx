import React, { useEffect } from 'react';

/* ─── Icons (SVG / Heroicons-style) ───────────────────── */
const _IC = {
  dashboard:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  people:        'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  medical_services:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  category:      'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
  meeting_room:  'M8 21V5a2 2 0 012-2h4a2 2 0 012 2v16M3 21h18M13 12h.01',
  event_available:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  assignment:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  bar_chart:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  local_hospital:'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
  add:           'M12 4v16m8-8H4',
  edit:          'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  visibility:    'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  close:         'M6 18L18 6M6 6l12 12',
  search:        'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  delete_outline:'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  arrow_forward: 'M13 7l5 5m0 0l-5 5m5-5H6',
  check:         'M5 13l4 4L19 7',
  filter_alt_off:'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4zM18 18L6 6',
  menu:          'M4 6h16M4 12h16M4 18h16',
  check_circle:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error:         'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  info:          'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:       'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  cancel:        'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  lock:          'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  add_circle_outline:'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
  schedule:      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar_today:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  calendar_month:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  event:         'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  event_busy:    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM10 13l4 4m0-4l-4 4',
  event_note:    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 14h6M9 17h4',
  pending:       'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  person:        'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  person_search: 'M10 9a3 3 0 100 6 3 3 0 000-6zm-7 9a7 7 0 1114 0H3z',
  person_off:    'M13.5 6.5a4 4 0 11-5 5.916M20 20l-4.35-4.35M3 20a7 7 0 0110.292-6.292M21 21l-1-1',
  badge:         'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0',
  email:         'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone:         'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  notes:         'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  location_on:   'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  build:         'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  percent:       'M15.5 5l-7 14M5 9a2 2 0 104 0 2 2 0 00-4 0zM15 15a2 2 0 104 0 2 2 0 00-4 0z',
  inbox:         'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
  wb_sunny:      'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  dark_mode:     'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
};

export function Icon({ name, size = 20, style = {} }) {
  const d = _IC[name] || 'M4 4h16v16H4z';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      style={{ display:'inline-block', flexShrink:0, verticalAlign:'middle', ...style }}>
      <path d={d} />
    </svg>
  );
}

/* ─── Badge ───────────────────────────────────────────── */
const BADGE_MAP = {
  SCHEDULED:   { label: 'Programada',     color: '#1d4ed8', bg: '#dbeafe' },
  CONFIRMED:   { label: 'Confirmada',     color: '#047857', bg: '#d1fae5' },
  COMPLETED:   { label: 'Completada',     color: '#065f46', bg: '#a7f3d0' },
  CANCELLED:   { label: 'Cancelada',      color: '#6b7280', bg: '#f3f4f6' },
  NO_SHOW:     { label: 'No asistió',     color: '#b45309', bg: '#fef3c7' },
  ACTIVE:      { label: 'Activo',         color: '#047857', bg: '#d1fae5' },
  INACTIVE:    { label: 'Inactivo',       color: '#6b7280', bg: '#f3f4f6' },
  AVAILABLE:   { label: 'Disponible',     color: '#047857', bg: '#d1fae5' },
  UNDER_MAINTENANCE: { label: 'Mantenimiento',  color: '#b45309', bg: '#fef3c7' },
};

export function Badge({ status }) {
  const cfg = BADGE_MAP[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
      color: cfg.color, background: cfg.bg,
    }}>
      {cfg.label}
    </span>
  );
}

/* ─── Modal ───────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  const maxW = { sm: 400, md: 520, lg: 680, xl: 860 }[size] || 520;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: maxW }}>
        <div className="modal-header">
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
          <button className="btn-icon" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ──────────────────────────────────── */
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </div>
      }>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
    </Modal>
  );
}

/* ─── Toast ───────────────────────────────────────────── */
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} style={{ pointerEvents: 'all' }}>
          <Icon name={t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'} size={18}
            style={{ color: t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--accent)', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{t.message}</span>
          <button className="btn-icon" style={{ pointerEvents: 'all' }} onClick={() => removeToast(t.id)}>
            <Icon name="close" size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Skeleton Table ──────────────────────────────────── */
const SKW = [80, 65, 75, 55, 70, 60, 85, 50, 72, 58];
export function SkeletonTable({ cols = 5, rows = 5 }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>{Array.from({ length: cols }).map((_, i) => (
          <th key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ width: `${SKW[i % SKW.length]}%`, height: 12 }} />
          </th>
        ))}</tr>
      </thead>
      <tbody>{Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>{Array.from({ length: cols }).map((_, c) => (
          <td key={c} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ width: `${SKW[(r * cols + c) % SKW.length]}%`, height: 12 }} />
          </td>
        ))}</tr>
      ))}</tbody>
    </table>
  );
}

/* ─── Empty State ─────────────────────────────────────── */
export function EmptyState({ icon = 'inbox', title = 'Sin registros', message = 'No hay datos para mostrar.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)' }}>
      <Icon name={icon} size={48} style={{ opacity: 0.35, marginBottom: 12, display: 'block' }} />
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}

/* ─── Bar Chart ───────────────────────────────────────── */
export function BarChart({ data, height = 180, color = 'var(--accent)', formatValue }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height, gap: 6, paddingTop: 24 }}>
      {data.map((d, i) => {
        const barH = Math.max(((d.value / max) * (height - 44)), 4);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{formatValue ? formatValue(d.value) : d.value}</span>
            <div style={{ width: '100%', height: barH, background: color, borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', opacity: 0.85 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── KPI Card ────────────────────────────────────────── */
export function KPICard({ icon, label, value, sub, accentColor = 'var(--accent)' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: accentColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, flexShrink: 0 }}>
          <Icon name={icon} size={18} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Page Header ─────────────────────────────────────── */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

/* ─── Form helpers ────────────────────────────────────── */
export function FormGroup({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function FormInput({ ...props }) {
  return <input className="form-input" {...props} />;
}

export function FormSelect({ children, ...props }) {
  return <select className="form-select" {...props}>{children}</select>;
}

export function FormTextarea({ ...props }) {
  return <textarea className="form-input" rows={3} style={{ resize: 'vertical' }} {...props} />;
}
