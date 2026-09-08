import React, { useState, useMemo } from 'react';
import ChartCard from '../components/ChartCard';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  STREET_LIGHTS, ENERGY_CONSUMPTION, FAULT_CATEGORIES, LOCATION_DATA, ALERTS,
} from './slData';
import './StreetLightMonitoring.css';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const STATUS_FILTERS = ['All', 'Working', 'Non-Working', 'ON', 'OFF', 'Fault', 'Offline'];
const PIE_COLORS = ['#22c55e', '#ef4444'];

/* ─────────────────────────────────────────
   SMALL REUSABLE PIECES
───────────────────────────────────────── */
function Pill({ color, children }) {
  return (
    <span className={`sl-pill sl-pill--${color}`}>
      <span className="sl-pill__dot" />
      {children}
    </span>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="sl-section-heading">
      <span className="sl-section-icon">{icon}</span>
      <div>
        <div className="sl-section-title">{title}</div>
        {subtitle && <div className="sl-section-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  return (
    <div className="sl-progress">
      <div className="sl-progress__fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="sl-tooltip">
      <div className="sl-tooltip__label">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="sl-tooltip__row">
          <span className="sl-tooltip__dot" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* status → pill color */
function statusColor(s) {
  if (s === 'working') return 'green';
  if (s === 'fault')   return 'red';
  if (s === 'warning') return 'yellow';
  if (s === 'offline') return 'gray';
  return 'blue';
}

/* ─────────────────────────────────────────
   LIGHT NETWORK CARD
───────────────────────────────────────── */
function LightCard({ light, onClick }) {
  const sc = statusColor(light.status);
  const isOn = light.state === 'ON';
  return (
    <div
      className={`sl-light-card sl-light-card--${sc}`}
      onClick={() => onClick(light)}
      title="Click for details"
    >
      <div className="sl-light-card__top">
        <span className={`sl-light-card__bulb ${isOn ? 'sl-light-card__bulb--on' : ''}`}>💡</span>
        <span className="sl-light-card__id">{light.id}</span>
        <Pill color={sc}>{light.status}</Pill>
      </div>
      <div className="sl-light-card__loc">📍 {light.location}</div>
      <div className="sl-light-card__row">
        <span className={`sl-light-card__state sl-light-card__state--${isOn ? 'on' : 'off'}`}>
          {light.state}
        </span>
        <span className="sl-light-card__power">{light.power > 0 ? `${light.power} W` : '— W'}</span>
      </div>
      {light.fault !== 'None' && (
        <div className="sl-light-card__fault">⚠ {light.fault}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   DETAIL MODAL
───────────────────────────────────────── */
function LightModal({ light, onClose }) {
  if (!light) return null;
  const sc = statusColor(light.status);
  return (
    <div className="sl-modal-overlay" onClick={onClose}>
      <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sl-modal__header">
          <div className="sl-modal__title">💡 {light.id} — Details</div>
          <button className="sl-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="sl-modal__body">
          {[
            ['Location',      light.location],
            ['Status',        <Pill color={sc}>{light.status}</Pill>],
            ['State',         <span className={`sl-light-card__state sl-light-card__state--${light.state === 'ON' ? 'on' : 'off'}`}>{light.state}</span>],
            ['Power',         `${light.power} W`],
            ['Voltage',       `${light.voltage} V`],
            ['Fault',         light.fault],
            ['Communication', light.communication],
            ['Last Updated',  light.lastUpdated],
          ].map(([k, v]) => (
            <div key={k} className="sl-modal__row">
              <span className="sl-modal__key">{k}</span>
              <span className="sl-modal__val">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function StreetLightMonitoring() {
  const [filter,      setFilter]      = useState('All');
  const [search,      setSearch]      = useState('');
  const [activeLight, setActiveLight] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  /* derived counts */
  const total      = 120;
  const working    = 108;
  const nonWorking = 12;
  const lightsOn   = 96;
  const lightsOff  = 24;

  const pieData = [
    { name: 'Working',     value: working },
    { name: 'Non-Working', value: nonWorking },
  ];

  /* filter + search the 24 sample cards */
  const visibleLights = useMemo(() => {
    let list = STREET_LIGHTS;
    if (filter === 'Working')     list = list.filter(l => l.status === 'working');
    else if (filter === 'Non-Working') list = list.filter(l => l.status === 'fault');
    else if (filter === 'ON')     list = list.filter(l => l.state === 'ON');
    else if (filter === 'OFF')    list = list.filter(l => l.state === 'OFF');
    else if (filter === 'Fault')  list = list.filter(l => l.status === 'fault');
    else if (filter === 'Offline')list = list.filter(l => l.status === 'offline');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.id.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search]);

  function handleRefresh() {
    setLastUpdated(new Date().toLocaleTimeString());
  }

  return (
    <div className="sl-root">

      {/* ══ PAGE HEADER ══ */}
      <div className="sl-page-header">
        <div className="sl-page-header__left">
          <h1 className="sl-page-title">
            <span className="sl-page-title__icon">💡</span>
            Street Light Monitoring
          </h1>
          <p className="sl-page-desc">
            Monitor street-light status, faults, energy usage, and network health.
          </p>
        </div>
        <div className="sl-page-header__right">
          <div className="sl-live-chip">
            <span className="sl-live-dot" />
            All Systems Operational
          </div>
          <div className="sl-header-badge">
            <span className="sl-header-badge__label">Last Updated</span>
            <span className="sl-header-badge__value">{lastUpdated}</span>
          </div>
          <div className="sl-header-badge">
            <span className="sl-header-badge__label">Network</span>
            <span className="sl-header-badge__value">Connected</span>
          </div>
          <div className="sl-header-badge">
            <span className="sl-header-badge__label">Total Lights</span>
            <span className="sl-header-badge__value">120</span>
          </div>
        </div>
      </div>

      {/* ══ SECTION 1: SUMMARY CARDS ══ */}
      <section className="sl-section">
        <SectionHeading icon="📊" title="Network Summary" subtitle="Real-time overview of the entire street-light network" />
        <div className="sl-summary-grid">

          <div className="sl-summary-card sl-summary-card--total">
            <div className="sl-summary-card__accent" style={{ background: '#6366f1' }} />
            <div className="sl-summary-card__head">
              <div className="sl-summary-card__icon" style={{ background: '#ede9fe' }}>🏙️</div>
              <Pill color="blue">100% Monitored</Pill>
            </div>
            <div className="sl-summary-card__num">120</div>
            <div className="sl-summary-card__label">Total Street Lights</div>
            <div className="sl-summary-card__sub">Installed Units</div>
            <ProgressBar value={120} max={120} color="#6366f1" />
          </div>

          <div className="sl-summary-card sl-summary-card--working">
            <div className="sl-summary-card__accent" style={{ background: '#22c55e' }} />
            <div className="sl-summary-card__head">
              <div className="sl-summary-card__icon" style={{ background: '#dcfce7' }}>✅</div>
              <Pill color="green">Operational</Pill>
            </div>
            <div className="sl-summary-card__num" style={{ color: '#16a34a' }}>108</div>
            <div className="sl-summary-card__label">Working Lights</div>
            <div className="sl-summary-card__sub">90% of Total</div>
            <ProgressBar value={108} max={120} color="#22c55e" />
          </div>

          <div className="sl-summary-card sl-summary-card--fault">
            <div className="sl-summary-card__accent" style={{ background: '#ef4444' }} />
            <div className="sl-summary-card__head">
              <div className="sl-summary-card__icon" style={{ background: '#fee2e2' }}>⚠️</div>
              <Pill color="red">Needs Attention</Pill>
            </div>
            <div className="sl-summary-card__num" style={{ color: '#dc2626' }}>12</div>
            <div className="sl-summary-card__label">Non-Working Lights</div>
            <div className="sl-summary-card__sub">10% of Total</div>
            <ProgressBar value={12} max={120} color="#ef4444" />
          </div>

          <div className="sl-summary-card sl-summary-card--on">
            <div className="sl-summary-card__accent" style={{ background: '#f59e0b' }} />
            <div className="sl-summary-card__head">
              <div className="sl-summary-card__icon" style={{ background: '#fef3c7' }}>💡</div>
              <Pill color="yellow">Active Now</Pill>
            </div>
            <div className="sl-summary-card__num" style={{ color: '#d97706' }}>96</div>
            <div className="sl-summary-card__label">Lights Currently ON</div>
            <div className="sl-summary-card__sub">80% of Total</div>
            <ProgressBar value={96} max={120} color="#f59e0b" />
          </div>
        </div>
      </section>

      {/* ══ SECTION 2: STATUS OVERVIEW ══ */}
      <section className="sl-section">
        <SectionHeading icon="📈" title="Street Light Status Overview" subtitle="Distribution of working, non-working, ON and OFF lights" />
        <div className="sl-overview-grid">

          <ChartCard title="Working vs Non-Working" subtitle="Out of 120 total lights">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} lights`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="sl-card sl-state-card">
            <div className="sl-state-card__title">ON / OFF Distribution</div>
            <div className="sl-state-rows">
              {[
                { label: 'Lights ON',      value: lightsOn,  max: total, color: '#22c55e', icon: '🟢' },
                { label: 'Lights OFF',     value: lightsOff, max: total, color: '#94a3b8', icon: '⚫' },
                { label: 'Working',        value: working,   max: total, color: '#3b82f6', icon: '✅' },
                { label: 'Non-Working',    value: nonWorking,max: total, color: '#ef4444', icon: '❌' },
              ].map(({ label, value, max, color, icon }) => (
                <div key={label} className="sl-state-row">
                  <span className="sl-state-row__icon">{icon}</span>
                  <span className="sl-state-row__label">{label}</span>
                  <div className="sl-state-row__bar-wrap">
                    <div className="sl-state-row__bar" style={{ width: `${(value / max) * 100}%`, background: color }} />
                  </div>
                  <span className="sl-state-row__val">{value}</span>
                  <span className="sl-state-row__pct">{Math.round((value / max) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 3: NETWORK GRID ══ */}
      <section className="sl-section">
        <SectionHeading icon="🗺️" title="Street Light Network" subtitle="Live status of monitored units — click any card for details" />

        {/* Filter + Search bar */}
        <div className="sl-controls">
          <div className="sl-filter-row">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                className={`sl-filter-btn ${filter === f ? 'sl-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            className="sl-search"
            placeholder="🔍  Search by ID or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {visibleLights.length === 0 ? (
          <div className="sl-empty">No lights match the current filter.</div>
        ) : (
          <div className="sl-network-grid">
            {visibleLights.map((l) => (
              <LightCard key={l.id} light={l} onClick={setActiveLight} />
            ))}
          </div>
        )}
      </section>

      {/* ══ SECTION 4: DETAILED TABLE ══ */}
      <section className="sl-section">
        <SectionHeading icon="📋" title="Street Light Status Details" subtitle="Full parameter table for all monitored units" />
        <div className="sl-card">
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  {['Light ID','Location','Status','State','Power','Voltage','Fault','Communication','Last Updated'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STREET_LIGHTS.map((l) => {
                  const sc = statusColor(l.status);
                  const isFault = l.status === 'fault' || l.status === 'offline';
                  return (
                    <tr
                      key={l.id}
                      className={isFault ? 'sl-table__row--fault' : ''}
                      onClick={() => setActiveLight(l)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>💡 {l.id}</strong></td>
                      <td>📍 {l.location}</td>
                      <td><Pill color={sc}>{l.status}</Pill></td>
                      <td>
                        <span className={`sl-state-badge sl-state-badge--${l.state === 'ON' ? 'on' : 'off'}`}>
                          {l.state}
                        </span>
                      </td>
                      <td>{l.power > 0 ? `${l.power} W` : '—'}</td>
                      <td>{l.voltage > 0 ? `${l.voltage} V` : '—'}</td>
                      <td className={l.fault !== 'None' ? 'sl-table__fault-cell' : ''}>{l.fault}</td>
                      <td>
                        <span className={`sl-comm-badge sl-comm-badge--${l.communication === 'Connected' ? 'ok' : 'warn'}`}>
                          {l.communication}
                        </span>
                      </td>
                      <td className="sl-table__time">{l.lastUpdated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ SECTION 5: ENERGY CONSUMPTION CHART ══ */}
      <section className="sl-section">
        <SectionHeading icon="⚡" title="Street Light Energy Consumption" subtitle="Daily energy usage over the last 7 days (kWh)" />
        <ChartCard title="Weekly Energy Consumption" subtitle="kWh consumed by street lights per day">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ENERGY_CONSUMPTION} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" kWh" domain={[0, 12]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="kwh" fill="#6366f1" radius={[6, 6, 0, 0]} name="Energy (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ══ SECTION 6: FAULT MONITORING ══ */}
      <section className="sl-section">
        <SectionHeading icon="🔧" title="Fault & Maintenance Monitoring" subtitle="Active faults by category and severity" />
        <div className="sl-fault-grid">

          {/* Fault summary cards */}
          <div className="sl-fault-summary">
            {[
              { label: 'Total Faults',    value: 12, color: '#ef4444', bg: '#fee2e2', icon: '🔴' },
              { label: 'Critical Faults', value: 3,  color: '#dc2626', bg: '#fee2e2', icon: '🚨' },
              { label: 'Warnings',        value: 5,  color: '#f59e0b', bg: '#fef3c7', icon: '⚠️' },
              { label: 'Resolved Today',  value: 7,  color: '#22c55e', bg: '#dcfce7', icon: '✅' },
            ].map(({ label, value, color, bg, icon }) => (
              <div key={label} className="sl-fault-stat" style={{ borderTop: `4px solid ${color}` }}>
                <div className="sl-fault-stat__icon" style={{ background: bg }}>{icon}</div>
                <div className="sl-fault-stat__num" style={{ color }}>{value}</div>
                <div className="sl-fault-stat__label">{label}</div>
              </div>
            ))}
          </div>

          {/* Fault categories */}
          <div className="sl-card">
            <div className="sl-fault-cat-title">Fault Categories</div>
            <div className="sl-fault-cats">
              {FAULT_CATEGORIES.map(({ name, count, color }) => (
                <div key={name} className="sl-fault-cat-row">
                  <span className="sl-fault-cat-dot" style={{ background: color }} />
                  <span className="sl-fault-cat-name">{name}</span>
                  <div className="sl-fault-cat-bar-wrap">
                    <div className="sl-fault-cat-bar" style={{ width: `${(count / 12) * 100}%`, background: color }} />
                  </div>
                  <span className="sl-fault-cat-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 7: LOCATION-WISE ══ */}
      <section className="sl-section">
        <SectionHeading icon="📍" title="Location-wise Street Light Status" subtitle="Breakdown of light status per road / area" />
        <div className="sl-card">
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  {['Location','Total','Working','Non-Working','ON','OFF','Faults','Health'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LOCATION_DATA.map((row) => (
                  <tr key={row.location}>
                    <td><strong>📍 {row.location}</strong></td>
                    <td>{row.total}</td>
                    <td><span className="sl-loc-num sl-loc-num--green">{row.working}</span></td>
                    <td><span className="sl-loc-num sl-loc-num--red">{row.nonWorking}</span></td>
                    <td><span className="sl-loc-num sl-loc-num--yellow">{row.on}</span></td>
                    <td>{row.off}</td>
                    <td><span className="sl-loc-num sl-loc-num--red">{row.faults}</span></td>
                    <td>
                      <div className="sl-loc-health">
                        <div className="sl-loc-health__bar" style={{ width: `${Math.round((row.working / row.total) * 100)}%` }} />
                        <span>{Math.round((row.working / row.total) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ SECTION 8: ALERTS ══ */}
      <section className="sl-section">
        <SectionHeading icon="🔔" title="Street Light Alerts" subtitle="Active notifications and recent events" />
        <div className="sl-card">
          <div className="sl-alerts-list">
            {ALERTS.map((a) => (
              <div key={a.id} className={`sl-alert sl-alert--${a.type}`}>
                <span className="sl-alert__icon">{a.icon}</span>
                <div className="sl-alert__body">
                  <div className="sl-alert__title">{a.title}</div>
                  <div className="sl-alert__desc">{a.desc}</div>
                  <div className="sl-alert__meta">
                    <span>🔦 {a.lightId}</span>
                    <span>📍 {a.location}</span>
                    <span>🕐 {a.time}</span>
                  </div>
                </div>
                <span className={`sl-alert__badge sl-alert__badge--${a.resolved ? 'resolved' : a.type}`}>
                  {a.resolved ? 'Resolved' : a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                </span>
              </div>
            ))}
          </div>
          <button className="sl-view-all-btn">View All Alerts →</button>
        </div>
      </section>

      {/* ══ SECTION 9: QUICK ACTIONS ══ */}
      <section className="sl-section">
        <SectionHeading icon="⚙️" title="Quick Actions" subtitle="Filter, refresh, and export the street-light network" />
        <div className="sl-actions">
          {[
            { label: '⚠️  View Faulty Lights',   action: () => { setFilter('Fault');   window.scrollTo({ top: 0, behavior: 'smooth' }); } },
            { label: '📴  View Offline Lights',  action: () => { setFilter('Offline'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
            { label: '✅  View Working Lights',  action: () => { setFilter('Working'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
            { label: '🔄  Refresh Status',       action: handleRefresh },
            { label: '📥  Export Report',        action: () => alert('Export feature will be available after backend integration.') },
          ].map(({ label, action }) => (
            <button key={label} className="sl-action-btn" onClick={action}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Detail modal */}
      <LightModal light={activeLight} onClose={() => setActiveLight(null)} />
    </div>
  );
}
