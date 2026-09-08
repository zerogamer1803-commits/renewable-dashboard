import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '⚡', label: 'Dashboard' },
  { to: '/energy', icon: '☀️', label: 'Energy Monitoring' },
  { to: '/battery', icon: '🔋', label: 'Battery Monitoring' },
  { to: '/streetlight', icon: '💡', label: 'Street Lights' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/alerts', icon: '🔔', label: 'Alerts' },
];

export default function Sidebar({ isOpen }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🌿</div>
        <div className="logo-text">
          RenewGrid
          <span>Energy Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>v1.0.0 · RenewGrid</div>
      </div>
    </aside>
  );
}
