import React, { useState, useEffect, createContext } from 'react';
import DashboardView from './pages/DashboardView';
import PatientCrud from './pages/PatientCrud';
import DoctorCrud from './pages/DoctorCrud';
import CatalogView from './pages/CatalogView';
import OfficeCrud from './pages/OfficeCrud';
import AvailabilityView from './pages/AvailabilityView';
import AppointmentCrud from './pages/AppointmentCrud';
import ReportsView from './pages/ReportsView';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ToastContainer } from './components/Shared';
import { api } from './services/api';

export const AppCtx = createContext();

export default function App() {
  const [view, setView]           = useState('dashboard');
  const [darkMode, setDarkMode]   = useState(() => {
    return localStorage.getItem('umo-theme') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts]       = useState([]);
  const [prefillAppt, setPrefillAppt] = useState(null);

  // Shared application data state
  const [patients, setPatients]                 = useState([]);
  const [doctors, setDoctors]                   = useState([]);
  const [rooms, setRooms]                       = useState([]); // Rooms corresponds to Offices
  const [appointments, setAppointments]         = useState([]);
  const [specialties, setSpecialties]           = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [loading, setLoading]                   = useState(true);

  // Sync dark mode HTML attributes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('umo-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('umo-theme', 'light');
    }
  }, [darkMode]);

  // Initial catalog load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [pts, docs, rms, appts, specs, types] = await Promise.all([
          api.getPatients(),
          api.getDoctors(),
          api.getOffices(),
          api.getAppointments(),
          api.getSpecialties(),
          api.getAppointmentTypes()
        ]);

        setPatients(pts || []);
        setDoctors(docs || []);
        setRooms(rms || []);
        setAppointments(appts || []);
        setSpecialties(specs || []);
        setAppointmentTypes(types || []);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Toast notifications manager
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigate = (newView) => {
    setView(newView);
    setSidebarOpen(false);
  };

  // Expose state and operations inside context
  const ctx = {
    view,
    setView: navigate,
    darkMode,
    setDarkMode,
    patients,
    setPatients,
    doctors,
    setDoctors,
    rooms, // support both names
    setRooms,
    offices: rooms,
    setOffices: setRooms,
    appointments,
    setAppointments,
    specialties,
    setSpecialties,
    appointmentTypes,
    setAppointmentTypes,
    showToast,
    prefillAppt,
    setPrefillAppt,
    loading,
    setLoading
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView />;
      case 'patients':
        return <PatientCrud />;
      case 'doctors':
        return <DoctorCrud />;
      case 'catalog':
        return <CatalogView />;
      case 'rooms':
        return <OfficeCrud />;
      case 'availability':
        return <AvailabilityView />;
      case 'appointments':
        return <AppointmentCrud />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app-layout">
        <Sidebar
          current={view}
          onNavigate={navigate}
          mobileOpen={sidebarOpen}
          onOverlayClick={() => setSidebarOpen(false)}
        />
        <TopBar
          darkMode={darkMode}
          toggleDark={() => setDarkMode(d => !d)}
          currentView={view}
          onMenuClick={() => setSidebarOpen(s => !s)}
        />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AppCtx.Provider>
  );
}
