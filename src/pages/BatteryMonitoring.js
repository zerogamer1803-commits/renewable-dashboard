import React, { useState, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
import { apiFetch } from '../api';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import './BatteryMonitoring.css';

/* ─────────────────────────────────────────
   REUSABLE COMPONENTS
───────────────────────────────────────── */
function StatusPill({ color, children }) {
  return (
    <span className={`bm-pill bm-pill--${color}`}>
      <span className="bm-pill__dot" />
      {children}
    </span>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="bm-section-heading">
      <span className="bm-section-icon">{icon}</span>
      <div>
        <div className="bm-section-title">{title}</div>
        {subtitle && <div className="bm-section-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bm-tooltip">
      <div className="bm-tooltip__label">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="bm-tooltip__row">
          <span className="bm-tooltip__dot" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <strong>{p.value}{unit}</strong>
        </div>
      ))}
    </div>
  );
}

function BatteryVisual({ percent }) {
  const color = percent > 60 ? '#22c55e' : percent > 30 ? '#f59e0b' : '#ef4444';
  const segments = 10;
  const filled  = Math.round((percent / 100) * segments);
  return (
    <div className="bm-batt-visual">
      <div className="bm-batt-visual__shell">
        <div className="bm-batt-visual__body">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="bm-batt-visual__seg"
              style={{
                background: i < filled ? color : '#e2e8f0',
                opacity: i < filled ? 0.85 + i * 0.015 : 1,
              }}
            />
          ))}
        </div>
        <div className="bm-batt-visual__nub" />
      </div>
      <div className="bm-batt-visual__pct" style={{ color }}>
        {percent}<span>%</span>
      </div>
      <div className="bm-batt-visual__label">Battery Level</div>
    </div>
  );
}

function ParamCard({ icon, iconBg, label, value, unit, pill, pillColor, sub }) {
  return (
    <div className="bm-param-card">
      <div className="bm-param-card__head">
        <div className="bm-param-card__icon" style={{ background: iconBg }}>{icon}</div>
        {pill && <StatusPill color={pillColor}>{pill}</StatusPill>}
      </div>
      <div className="bm-param-card__value">
        {value}<span className="bm-param-card__unit">{unit}</span>
      </div>
      <div className="bm-param-card__label">{label}</div>
      {sub && <div className="bm-param-card__sub">{sub}</div>}
    </div>
  );
}

function StatusRow({ icon, label, value, pillColor }) {
  return (
    <div className="bm-status-row">
      <span className="bm-status-row__icon">{icon}</span>
      <span className="bm-status-row__label">{label}</span>
      <StatusPill color={pillColor}>{value}</StatusPill>
    </div>
  );
}

/* ─────────────────────────────────────────
   DEFAULT DATA
───────────────────────────────────────── */
const DEFAULT_BATTERY = {
  battery_id: '—', capacity: 0, stored_energy: 0, battery_level: 0,
  voltage: 0, current: 0, temperature: 0, health: 0,
  status: 'Unknown', charging_power: 0,
  energy_received_today: 0, energy_supplied_today: 0,
  charge_cycles: 0, last_full_charge: null, timestamp: null,
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function BatteryMonitoring() {
  const [battery,  setBattery]  = useState(DEFAULT_BATTERY);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [batRes, histRes] = await Promise.all([
          apiFetch('/api/battery/'),
          apiFetch('/api/battery/history/'),
        ]);
        if (!cancelled) {
          const bat = batRes.data?.[0] || DEFAULT_BATTERY;
          setBattery(bat);

          /* Filter history for this battery, last 24 records */
          const filtered = (histRes.data || [])
            .filter(h => h.battery_id === bat.battery_id)
            .slice(0, 24)
            .reverse()
            .map((h, i) => ({
              time:  h.timestamp ? h.timestamp.slice(11, 16) : `${i}:00`,
              level: h.battery_level,
              temp:  h.temperature,
            }));
          setHistory(filtered);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError('Could not load battery data. Showing last known values.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const levelHistory = history.map(h => ({ time: h.time, level: h.level }));
  const tempHistory  = history.map(h => ({ time: h.time, temp:  h.temp  }));

  const statusColor = battery.status === 'Charging'    ? 'blue'
                    : battery.status === 'Discharging' ? 'yellow'
                    : battery.status === 'Full'        ? 'green'
                    : 'gray';

  const tempStatus  = battery.temperature > 40 ? 'red'
                    : battery.temperature > 35 ? 'yellow'
                    : 'green';

  const voltStatus  = battery.voltage > 58 ? 'red' : 'green';
  const healthStatus = battery.health < 70 ? 'red' : battery.health < 85 ? 'yellow' : 'green';

  const available = +(battery.capacity - battery.stored_energy).toFixed(2);

  const lastCharge = battery.last_full_charge
    ? new Date(battery.last_full_charge).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
    : '—';

  return (
    <div className="bm-root">

      {/* ══ PAGE HEADER ══ */}
      <div className="bm-page-header">
        <div className="bm-page-header__left">
          <h1 className="bm-page-title">
            <span className="bm-page-title__icon">🔋</span>
            Battery Monitoring
          </h1>
          <p className="bm-page-desc">
            Monitor battery storage, temperature, charging status, voltage, current, and battery health.
          </p>
        </div>
        <div className="bm-page-header__right">
          <div className="bm-live-chip">
            <span className="bm-live-dot" />
            {loading ? 'Loading…' : 'System Normal'}
          </div>
          <div className="bm-header-badge">
            <span className="bm-header-badge__label">Last Updated</span>
            <span className="bm-header-badge__value">Just now</span>
          </div>
          <div className="bm-header-badge">
            <span className="bm-header-badge__label">Battery ID</span>
            <span className="bm-header-badge__value">{battery.battery_id}</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 15 }}>
          Loading battery data…
        </div>
      )}

      {/* ══ SECTION 1: BATTERY OVERVIEW ══ */}
      <section className="bm-section">
        <SectionHeading icon="🔋" title="Battery Overview" subtitle="Current storage level, capacity, and charging state" />
        <div className="bm-overview-grid">

          <div className="bm-card bm-overview-visual">
            <BatteryVisual percent={battery.battery_level} />
            <div className="bm-overview-visual__stats">
              <div className="bm-overview-stat">
                <span className="bm-overview-stat__label">Stored Energy</span>
                <span className="bm-overview-stat__value">{battery.stored_energy} <small>kWh</small></span>
              </div>
              <div className="bm-overview-stat bm-overview-stat--sep">
                <span className="bm-overview-stat__label">Total Capacity</span>
                <span className="bm-overview-stat__value">{battery.capacity} <small>kWh</small></span>
              </div>
              <div className="bm-overview-stat bm-overview-stat--sep">
                <span className="bm-overview-stat__label">Available</span>
                <span className="bm-overview-stat__value">{available} <small>kWh</small></span>
              </div>
            </div>
            <div className="bm-overview-visual__footer">
              <StatusPill color={statusColor}>{battery.status}</StatusPill>
              <span className="bm-overview-visual__power">Charging Power: <strong>{battery.charging_power} kW</strong></span>
            </div>
          </div>

          <div className="bm-params-grid">
            <ParamCard
              icon="⚡" iconBg="#fef3c7"
              label="Battery Voltage"
              value={battery.voltage} unit=" V"
              pill={voltStatus === 'red' ? 'High' : 'Normal'} pillColor={voltStatus}
              sub="Nominal: 48 V"
            />
            <ParamCard
              icon="🔌" iconBg="#dbeafe"
              label="Battery Current"
              value={battery.current} unit=" A"
              pill={battery.status} pillColor={statusColor}
              sub="Max: 40 A"
            />
            <ParamCard
              icon="🌡️" iconBg="#ffedd5"
              label="Battery Temperature"
              value={battery.temperature} unit="°C"
              pill={tempStatus === 'red' ? 'High' : 'Normal'} pillColor={tempStatus}
              sub="Safe: 20–40°C"
            />
            <ParamCard
              icon="❤️" iconBg="#dcfce7"
              label="Battery Health"
              value={battery.health} unit="%"
              pill={healthStatus === 'red' ? 'Poor' : healthStatus === 'yellow' ? 'Fair' : 'Good'} pillColor={healthStatus}
              sub={`Cycle count: ${battery.charge_cycles}`}
            />
          </div>
        </div>
      </section>

      {/* ══ SECTION 2: CHARGING / DISCHARGING STATUS ══ */}
      <section className="bm-section">
        <SectionHeading icon="🔄" title="Charging / Discharging Status" subtitle="Current energy flow direction and power levels" />
        <div className="bm-charge-grid">

          <div className="bm-card bm-flow-card">
            <div className="bm-flow-card__title">Energy Flow Diagram</div>
            <div className="bm-flow-layout">
              <div className="bm-flow-sources">
                <div className="bm-flow-node bm-flow-node--solar">
                  <div className="bm-flow-node__icon">☀️</div>
                  <div className="bm-flow-node__label">Solar Energy</div>
                  <div className="bm-flow-node__val">—</div>
                </div>
                <div className="bm-flow-node bm-flow-node--foot">
                  <div className="bm-flow-node__icon">👣</div>
                  <div className="bm-flow-node__label">Footstep Energy</div>
                  <div className="bm-flow-node__val">—</div>
                </div>
              </div>
              <div className="bm-flow-arrows bm-flow-arrows--in">
                <div className="bm-flow-arrow-line"><div className="bm-flow-arrow-line__fill" /><span>›</span></div>
                <div className="bm-flow-arrow-line"><div className="bm-flow-arrow-line__fill" /><span>›</span></div>
              </div>
              <div className="bm-flow-battery">
                <div className="bm-flow-battery__icon">🔋</div>
                <div className="bm-flow-battery__label">Battery</div>
                <div className="bm-flow-battery__level">{battery.battery_level}%</div>
                <StatusPill color={statusColor}>{battery.status}</StatusPill>
              </div>
              <div className="bm-flow-arrows bm-flow-arrows--out">
                <div className="bm-flow-arrow-line"><div className="bm-flow-arrow-line__fill bm-flow-arrow-line__fill--out" /><span>›</span></div>
              </div>
              <div className="bm-flow-node bm-flow-node--lights">
                <div className="bm-flow-node__icon">💡</div>
                <div className="bm-flow-node__label">Street Lights</div>
                <div className="bm-flow-node__val">powered</div>
              </div>
            </div>
          </div>

          <div className="bm-card bm-charge-stats">
            <div className="bm-charge-stats__title">Charging Details</div>
            <div className="bm-charge-stat-list">
              {[
                { icon: '⚡', label: 'Charging Power',          value: `${battery.charging_power} kW` },
                { icon: '📥', label: 'Energy Received Today',   value: `${battery.energy_received_today} kWh` },
                { icon: '📤', label: 'Energy Supplied Today',   value: `${battery.energy_supplied_today} kWh` },
                { icon: '🔁', label: 'Charge Cycles (Total)',   value: battery.charge_cycles },
                { icon: '📅', label: 'Last Full Charge',        value: lastCharge },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bm-charge-stat">
                  <span className="bm-charge-stat__icon">{icon}</span>
                  <div className="bm-charge-stat__body">
                    <span className="bm-charge-stat__label">{label}</span>
                    <span className="bm-charge-stat__value">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 3: HISTORY CHARTS ══ */}
      <section className="bm-section">
        <SectionHeading icon="📈" title="Battery History" subtitle="Level and temperature over the last 24 hours" />
        <div className="bm-chart-grid">
          <ChartCard title="Battery Level History" subtitle="Last 24 hours (%)">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={levelHistory.length ? levelHistory : [{ time: '—', level: 0 }]}>
                <defs>
                  <linearGradient id="bmLevelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'Low',  fontSize: 10, fill: '#ef4444' }} />
                <ReferenceLine y={90} stroke="#3b82f6" strokeDasharray="4 3" label={{ value: 'Full', fontSize: 10, fill: '#3b82f6' }} />
                <Area type="monotone" dataKey="level" stroke="#22c55e" strokeWidth={2.5} fill="url(#bmLevelGrad)" name="Battery Level" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Temperature History" subtitle="Last 24 hours (°C)">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={tempHistory.length ? tempHistory : [{ time: '—', temp: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis domain={[15, 45]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="°C" />
                <Tooltip content={<CustomTooltip unit="°C" />} />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'Warning', fontSize: 10, fill: '#ef4444' }} />
                <ReferenceLine y={20} stroke="#3b82f6" strokeDasharray="4 3" label={{ value: 'Min',     fontSize: 10, fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2.5} dot={false} name="Temperature" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* ══ SECTION 4: ENERGY FLOW CHART (static weekly context) ══ */}
      <section className="bm-section">
        <SectionHeading icon="📊" title="Battery Energy Flow" subtitle="Energy received, stored, and supplied — last 7 days (kWh)" />
        <ChartCard title="Weekly Energy Flow" subtitle="Received vs Stored vs Supplied (kWh)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { label: 'Mon', received: 18.4, stored: 14.2, supplied: 9.8 },
                { label: 'Tue', received: 15.6, stored: 11.8, supplied: 8.4 },
                { label: 'Wed', received: 21.2, stored: 16.5, supplied: 11.2 },
                { label: 'Thu', received: 17.8, stored: 13.4, supplied: 9.6 },
                { label: 'Fri', received: 23.1, stored: 18.2, supplied: 12.4 },
                { label: 'Sat', received: 14.2, stored: 10.6, supplied: 7.8 },
                { label: 'Sun', received: 19.6, stored: 15.1, supplied: 10.4 },
              ]}
              barCategoryGap="28%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" kWh" />
              <Tooltip content={<CustomTooltip unit=" kWh" />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="received" fill="#3b82f6" radius={[5, 5, 0, 0]} name="Energy Received" />
              <Bar dataKey="stored"   fill="#22c55e" radius={[5, 5, 0, 0]} name="Energy Stored" />
              <Bar dataKey="supplied" fill="#f59e0b" radius={[5, 5, 0, 0]} name="Supplied to Lights" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ══ SECTION 5: STATUS + ALERTS ══ */}
      <section className="bm-section">
        <SectionHeading icon="📡" title="System Status & Alerts" subtitle="Live health check and active notifications" />
        <div className="bm-status-alerts-grid">

          <div className="bm-card bm-status-panel">
            <div className="bm-status-panel__title">Battery Status Panel</div>
            <div className="bm-status-panel__overall">
              <span className="bm-status-panel__overall-icon">✅</span>
              <div>
                <div className="bm-status-panel__overall-label">Overall Status</div>
                <div className="bm-status-panel__overall-value">Operational</div>
              </div>
              <StatusPill color="green">All Systems Normal</StatusPill>
            </div>
            <div className="bm-status-divider" />
            <div className="bm-status-list">
              <StatusRow icon="🔋" label="Battery"     value={battery.health >= 70 ? 'Healthy' : 'Degraded'} pillColor={healthStatus} />
              <StatusRow icon="🌡️" label="Temperature" value={battery.temperature > 40 ? 'High' : 'Normal'}  pillColor={tempStatus} />
              <StatusRow icon="⚡" label="Voltage"     value={battery.voltage > 58 ? 'High' : 'Normal'}      pillColor={voltStatus} />
              <StatusRow icon="🔌" label="Charging"    value={battery.status}                                 pillColor={statusColor} />
              <StatusRow icon="❤️" label="Health"      value={battery.health >= 85 ? 'Good' : battery.health >= 70 ? 'Fair' : 'Poor'} pillColor={healthStatus} />
            </div>
            <div className="bm-status-divider" />
            <div className="bm-status-thresholds">
              <div className="bm-status-panel__title" style={{ marginBottom: 10 }}>Alert Thresholds</div>
              {[
                { label: 'Low Battery',   threshold: '< 20%',       current: `${battery.battery_level}%`,  ok: battery.battery_level >= 20 },
                { label: 'High Temp',     threshold: '> 40°C',      current: `${battery.temperature}°C`,   ok: battery.temperature <= 40 },
                { label: 'Overvoltage',   threshold: '> 58 V',      current: `${battery.voltage} V`,       ok: battery.voltage <= 58 },
                { label: 'Battery Fault', threshold: 'Health < 70%',current: `${battery.health}%`,         ok: battery.health >= 70 },
              ].map(({ label, threshold, current, ok }) => (
                <div key={label} className="bm-threshold-row">
                  <span className={`bm-threshold-dot bm-threshold-dot--${ok ? 'ok' : 'warn'}`} />
                  <span className="bm-threshold-label">{label}</span>
                  <span className="bm-threshold-threshold">{threshold}</span>
                  <span className="bm-threshold-current">{current}</span>
                  <span className={`bm-threshold-status bm-threshold-status--${ok ? 'ok' : 'warn'}`}>
                    {ok ? 'OK' : 'ALERT'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bm-card bm-alerts-panel">
            <div className="bm-alerts-panel__title">Battery Alerts</div>
            <div className="bm-alerts-panel__no-critical">
              <span className="bm-alerts-panel__check">✅</span>
              <div>
                <div className="bm-alerts-panel__no-critical-title">No Critical Alerts</div>
                <div className="bm-alerts-panel__no-critical-sub">All battery parameters are within safe operating range.</div>
              </div>
            </div>
            <div className="bm-status-divider" />
            <div className="bm-alerts-panel__subtitle">Warning Conditions Monitored</div>
            <div className="bm-warn-tags">
              {['Low Battery', 'High Temperature', 'Overvoltage', 'Battery Fault'].map((w) => (
                <span key={w} className="bm-warn-tag">{w}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
