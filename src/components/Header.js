import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/energy': 'Energy Monitoring',
  '/battery': 'Battery Monitoring',
  '/streetlight': 'Street Light Monitoring',
  '/analytics': 'Analytics',
  '/alerts': 'Alerts',
};

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="header">
      <div className="header-left">
        <button className="toggle-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          ☰
        </button>
        <div className="header-breadcrumb">
          RenewGrid / <strong>{title}</strong>
        </div>
      </div>

      <div className="header-right">
        <div className="header-time">
          {time.toLocaleDateString()} &nbsp;
          {time.toLocaleTimeString()}
        </div>
        <div className="header-status">
          <span className="status-dot" />
          System Online
        </div>
        <div className="header-avatar" title="Admin">A</div>
      </div>
    </header>
  );
}
