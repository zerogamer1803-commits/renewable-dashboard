import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import EnergyMonitoring from './pages/EnergyMonitoring';
import BatteryMonitoring from './pages/BatteryMonitoring';
import StreetLightMonitoring from './pages/StreetLightMonitoring';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import './styles/layout.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Sidebar isOpen={sidebarOpen} />
        <div className="main-area">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/energy" element={<EnergyMonitoring />} />
              <Route path="/battery" element={<BatteryMonitoring />} />
              <Route path="/streetlight" element={<StreetLightMonitoring />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/alerts" element={<Alerts />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
