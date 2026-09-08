import React, { useState, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
import { apiFetch } from '../api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

/* ─────────────────────────────────────────
   STATIC CHART DATA (visual context only)
───────────────────────────────────────── */
const ENERGY_DATA = [
  { time: '06:00', solar: 1.2, footstep: 0.4 },
  { time: '08:00', solar: 4.1, footstep: 0.9 },
  { time: '10:00', solar: 7.8, footstep: 1.6 },
  { time: '12:00', solar: 10.2, footstep: 2.1 },
  { time: '14:00', solar: 9.5, footstep: 1.9 },
  { time: '16:00', solar: 6.3, footstep: 1.4 },
  { time: '18:00', solar: 2.8, footstep: 1.0 },
  { time: '20:00', solar: 0.4, footstep: 0.6 },
];

const WEEKLY_DATA = [
  { day: 'Mon', energy: 14.2 },
  { day: 'Tue', energy: 12.8 },
  { day: 'Wed', energy: 17.5 },
  { day: 'Thu', energy: 15.1 },
  { day: 'Fri', energy: 18.9 },
  { day: 'Sat', energy: 11.4 },
  { day: 'Sun', energy: 9.7 },
];

const PIE_COLORS = ['#f59e0b', '#3b82f6'];

const QUICK_STATUS = [
  { icon: '☀️',  label: 'Solar Generator',    value: 'Online',      pill: 'green'  },
  { icon: '👣',  label: 'Footstep Generator', value: 'Online',      pill: 'green'  },
  { icon: '🔋',  label: 'Battery',            value: 'Normal',      pill: 'green'  },
  { icon: '💡',  label: 'Street Lights',      value: 'Monitoring',  pill: 'yellow' },
  { icon: '⚙️',  label: 'System',             value: 'Operational', pill: 'green'  },
];

/* ─────────────────────────────────────────
   SMALL REUSABLE PIECES
───────────────────────────────────────── */
function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="db-section-heading">
      <span className="db-section-icon">{icon}</span>
      <div>
        <div className="db-section-title">{title}</div>
        {subtitle && <div className="db-section-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

function StatusPill({ color, children }) {
  return (
    <span className={`db-pill db-pill--${color}`}>
      <span className="db-pill__dot" />
      {children}
    </span>
  );
}

function EnergyCard({ icon, iconBg, accentColor, label, value, unit, status, pillColor, trend }) {
  return (
    <div className="db-card db-energy-card" style={{ '--accent': accentColor }}>
      <div className="db-energy-card__accent" />
      <div className="db-energy-card__head">
        <div className="db-energy-card__icon-wrap" style={{ background: iconBg }}>{icon}</div>
        <StatusPill color={pillColor}>{status}</StatusPill>
      </div>
      <div className="db-energy-card__value">
        {value}<span className="db-energy-card__unit">{unit}</span>
      </div>
      <div className="db-energy-card__label">{label}</div>
      {trend && (
        <div className="db-energy-card__trend">
          <span className="db-trend-up">▲ {trend}</span> vs yesterday
        </div>
      )}
    </div>
  );
}

function BatteryIndicator({ percent }) {
  const color = percent > 60 ? '#22c55e' : percent > 30 ? '#f59e0b' : '#ef4444';
  const segments = 12;
  const filled = Math.round((percent / 100) * segments);
  return (
    <div className="db-batt-wrap">
      <div className="db-batt-body">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="db-batt-seg"
            style={{
              background: i < filled ? color : '#e2e8f0',
              opacity: i < filled ? 1 - i * 0.015 : 1,
            }}
          />
        ))}
      </div>
      <div className="db-batt-nub" />
      <span className="db-batt-pct" style={{ color }}>{percent}%</span>
    </div>
  );
}

function TempGauge({ value, min = 0, max = 60 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="db-temp-gauge">
      <div className="db-temp-gauge__track">
        <div className="db-temp-gauge__marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="db-temp-gauge__labels">
        <span>{min}°C</span>
        <span className="db-temp-gauge__safe">Safe: 20 – 40°C</span>
        <span>{max}°C</span>
      </div>
    </div>
  );
}

function LightGrid({ total, working }) {
  return (
    <div className="db-light-grid">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`db-light-dot ${i < working ? 'db-light-dot--on' : 'db-light-dot--off'}`}
          title={`SL-${String(i + 1).padStart(3, '0')}: ${i < working ? 'Working' : 'Fault'}`}
        />
      ))}
    </div>
  );
}

function FlowNode({ icon, label, sub, highlight }) {
  return (
    <div className={`db-flow-node ${highlight ? 'db-flow-node--highlight' : ''}`}>
      <div className="db-flow-node__bubble">{icon}</div>
      <div className="db-flow-node__label">{label}</div>
      {sub && <div className="db-flow-node__sub">{sub}</div>}
    </div>
  );
}

function FlowConnector({ animated }) {
  return (
    <div className="db-flow-connector">
      <div className={`db-flow-connector__line ${animated ? 'db-flow-connector__line--animated' : ''}`} />
      <div className="db-flow-connector__arrow">›</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DEFAULT API DATA
───────────────────────────────────────── */
const DEFAULT_DATA = {
  solar_energy: 0,
  footstep_energy: 0,
  total_renewable_energy: 0,
  battery_level: 0,
  battery_temperature: 0,
  working_lights: 0,
  non_working_lights: 0,
  lights_on: 0,
  lights_off: 0,
  co2_saved: 0,
  cost_saved: 0,
};

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
export default function Dashboard() {
  const [now, setNow]       = useState(new Date());
  const [data, setData]     = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const json = await apiFetch('/api/dashboard/');
        if (!cancelled) { setData(json); setError(null); }
      } catch (e) {
        if (!cancelled) setError('Could not load dashboard data. Showing last known values.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const total = data.working_lights + data.non_working_lights;
  const workingPct = total > 0 ? Math.round((data.working_lights / total) * 100) : 0;
  const nonWorkingPct = total > 0 ? Math.round((data.non_working_lights / total) * 100) : 0;

  const solarPct  = data.total_renewable_energy > 0
    ? Math.round((data.solar_energy / data.total_renewable_energy) * 100) : 0;
  const footPct   = 100 - solarPct;
  const PIE_DATA  = [
    { name: 'Solar',    value: solarPct },
    { name: 'Footstep', value: footPct  },
  ];

  return (
    <div className="db-root">

      {/* ── PAGE HEADER ── */}
      <div className="db-page-header">
        <div className="db-page-header__left">
          <h1 className="db-page-title">
            <span className="db-page-title__icon">🌿</span>
            Renewable Energy Dashboard
          </h1>
          <p className="db-page-desc">{dateStr}</p>
        </div>
        <div className="db-page-header__right">
          <div className="db-live-chip">
            <span className="db-live-dot" />
            {loading ? 'Loading…' : 'Live Monitoring'}
          </div>
          <div className="db-header-stat">
            <span className="db-header-stat__label">Uptime</span>
            <span className="db-header-stat__value">99.8%</span>
          </div>
          <div className="db-header-stat">
            <span className="db-header-stat__label">Last Sync</span>
            <span className="db-header-stat__value">Just now</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 15 }}>
          Loading dashboard data…
        </div>
      )}

      {/* ══════════════════════════════════════
          SECTION 1 — ENERGY GENERATION
      ══════════════════════════════════════ */}
      <section className="db-section">
        <SectionHeading icon="⚡" title="Energy Generation" subtitle="Current output from all renewable sources" />
        <div className="db-grid-3">
          <EnergyCard
            icon="☀️" iconBg="#fef3c7" accentColor="#f59e0b"
            label="Solar Energy"
            value={data.solar_energy}
            unit=" kWh" status="Generating" pillColor="yellow"
          />
          <EnergyCard
            icon="👣" iconBg="#dbeafe" accentColor="#3b82f6"
            label="Footstep Energy"
            value={data.footstep_energy}
            unit=" kWh" status="Generating" pillColor="blue"
          />
          <EnergyCard
            icon="⚡" iconBg="#dcfce7" accentColor="#22c55e"
            label="Total Renewable Energy"
            value={data.total_renewable_energy}
            unit=" kWh" status="Active" pillColor="green"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — BATTERY MONITORING
      ══════════════════════════════════════ */}
      <section className="db-section">
        <SectionHeading icon="🔋" title="Battery Monitoring" subtitle="Storage level and thermal status" />
        <div className="db-grid-2">

          <div className="db-card db-batt-card">
            <div className="db-batt-card__head">
              <div className="db-batt-card__icon-box" style={{ background: '#ccfbf1' }}>🔋</div>
              <div className="db-batt-card__info">
                <div className="db-label">Battery Storage</div>
                <div className="db-value">{data.battery_level}<span className="db-unit">%</span></div>
              </div>
              <StatusPill color="green">Charging</StatusPill>
            </div>
            <BatteryIndicator percent={data.battery_level} />
            <div className="db-batt-card__meta">
              <div className="db-meta-item">
                <span className="db-meta-item__label">Capacity</span>
                <span className="db-meta-item__value">200 Ah</span>
              </div>
              <div className="db-meta-item">
                <span className="db-meta-item__label">Voltage</span>
                <span className="db-meta-item__value">48.2 V</span>
              </div>
              <div className="db-meta-item">
                <span className="db-meta-item__label">Current</span>
                <span className="db-meta-item__value">12.4 A</span>
              </div>
              <div className="db-meta-item">
                <span className="db-meta-item__label">Est. Full</span>
                <span className="db-meta-item__value">~2.4 hrs</span>
              </div>
            </div>
          </div>

          <div className="db-card db-temp-card">
            <div className="db-batt-card__head">
              <div className="db-batt-card__icon-box" style={{ background: '#ffedd5' }}>🌡️</div>
              <div className="db-batt-card__info">
                <div className="db-label">Battery Temperature</div>
                <div className="db-value">{data.battery_temperature}<span className="db-unit">°C</span></div>
              </div>
              <StatusPill color="green">Normal</StatusPill>
            </div>
            <TempGauge value={data.battery_temperature} />
            <div className="db-batt-card__meta">
              <div className="db-meta-item">
                <span className="db-meta-item__label">Min Today</span>
                <span className="db-meta-item__value">26°C</span>
              </div>
              <div className="db-meta-item">
                <span className="db-meta-item__label">Max Today</span>
                <span className="db-meta-item__value">34°C</span>
              </div>
              <div className="db-meta-item">
                <span className="db-meta-item__label">Warning</span>
                <span className="db-meta-item__value">40°C</span>
              </div>
              <div className="db-meta-item">
                <span className="db-meta-item__label">Critical</span>
                <span className="db-meta-item__value">50°C</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — STREET LIGHT MONITORING
      ══════════════════════════════════════ */}
      <section className="db-section">
        <SectionHeading
          icon="💡"
          title="Street Light Monitoring"
          subtitle={`Real-time status of all ${total} street lights`}
        />
        <div className="db-grid-3" style={{ marginBottom: '1rem' }}>

          <div className="db-card db-sl-card db-sl-card--total">
            <div className="db-sl-card__icon">🏙️</div>
            <div className="db-sl-card__num">{total}</div>
            <div className="db-sl-card__label">Total Lights</div>
            <div className="db-sl-card__sub">Across all zones</div>
          </div>

          <div className="db-card db-sl-card db-sl-card--working">
            <div className="db-sl-card__icon">
              <span className="db-sl-card__dot db-sl-card__dot--on" />
            </div>
            <div className="db-sl-card__num db-sl-card__num--green">{data.working_lights}</div>
            <div className="db-sl-card__label">Working</div>
            <div className="db-sl-card__progress">
              <div className="db-sl-card__progress-fill db-sl-card__progress-fill--green" style={{ width: `${workingPct}%` }} />
            </div>
            <div className="db-sl-card__sub">{workingPct}% operational</div>
          </div>

          <div className="db-card db-sl-card db-sl-card--fault">
            <div className="db-sl-card__icon">
              <span className="db-sl-card__dot db-sl-card__dot--off" />
            </div>
            <div className="db-sl-card__num db-sl-card__num--red">{data.non_working_lights}</div>
            <div className="db-sl-card__label">Non-working</div>
            <div className="db-sl-card__progress">
              <div className="db-sl-card__progress-fill db-sl-card__progress-fill--red" style={{ width: `${nonWorkingPct}%` }} />
            </div>
            <div className="db-sl-card__sub">Needs attention</div>
          </div>
        </div>

        <div className="db-card db-sl-grid-card">
          <div className="db-sl-grid-header">
            <span className="db-sl-legend db-sl-legend--on">
              <span />Working ({data.working_lights})
            </span>
            <span className="db-sl-legend db-sl-legend--off">
              <span />Non-working ({data.non_working_lights})
            </span>
            <span className="db-sl-grid-note">Hover a dot to see light ID</span>
          </div>
          <LightGrid total={total} working={data.working_lights} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 + 5 — IMPACT SUMMARY
      ══════════════════════════════════════ */}
      <section className="db-section">
        <SectionHeading icon="🌍" title="Environmental & Cost Impact" subtitle="Today's savings from renewable energy generation" />
        <div className="db-grid-2">

          <div className="db-card db-impact-card db-impact-card--co2">
            <div className="db-impact-card__body">
              <div className="db-impact-card__icon-col">
                <div className="db-impact-card__icon-circle db-impact-card__icon-circle--green">🌿</div>
              </div>
              <div className="db-impact-card__main">
                <div className="db-label">CO₂ Saved Today</div>
                <div className="db-impact-value">
                  {data.co2_saved} <span className="db-impact-unit">kg</span>
                </div>
                <div className="db-impact-note">≈ {(data.co2_saved / 11.7).toFixed(1)} trees worth of CO₂ absorbed</div>
              </div>
            </div>
            <div className="db-impact-card__stats">
              <div className="db-impact-stat"><span>This Week</span><strong>168 kg</strong></div>
              <div className="db-impact-stat"><span>This Month</span><strong>612 kg</strong></div>
              <div className="db-impact-stat"><span>This Year</span><strong>4,820 kg</strong></div>
            </div>
          </div>

          <div className="db-card db-impact-card db-impact-card--cost">
            <div className="db-impact-card__body">
              <div className="db-impact-card__icon-col">
                <div className="db-impact-card__icon-circle db-impact-card__icon-circle--purple">💰</div>
              </div>
              <div className="db-impact-card__main">
                <div className="db-label">Cost Saved Today</div>
                <div className="db-impact-value">₹{data.cost_saved}</div>
                <div className="db-impact-note">Based on ₹7.50 / kWh grid rate</div>
              </div>
            </div>
            <div className="db-impact-card__stats">
              <div className="db-impact-stat"><span>This Week</span><strong>₹12,600</strong></div>
              <div className="db-impact-stat"><span>This Month</span><strong>₹46,200</strong></div>
              <div className="db-impact-stat"><span>This Year</span><strong>₹3,61,500</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — ENERGY FLOW
      ══════════════════════════════════════ */}
      <section className="db-section">
        <SectionHeading icon="🔄" title="Energy Flow" subtitle="Live path from generation sources to consumption" />
        <div className="db-card db-flow-card">

          <div className="db-flow-source-label">
            <span className="db-flow-source-badge db-flow-source-badge--solar">☀️ Solar Path</span>
          </div>
          <div className="db-flow-row">
            <FlowNode icon="☀️" label="Solar Panel"       sub={`${data.solar_energy} kWh`}           highlight />
            <FlowConnector animated />
            <FlowNode icon="⚡" label="Energy Generation" sub={`${data.total_renewable_energy} kWh total`} highlight />
            <FlowConnector animated />
            <FlowNode icon="🔋" label="Battery Storage"   sub={`${data.battery_level}% charged`}     highlight />
            <FlowConnector animated />
            <FlowNode icon="💡" label="Street Lights"     sub={`${data.lights_on} active`}            highlight />
          </div>

          <div className="db-flow-separator">
            <div className="db-flow-separator__line" />
            <span className="db-flow-separator__label">+ combined into</span>
            <div className="db-flow-separator__line" />
          </div>

          <div className="db-flow-source-label">
            <span className="db-flow-source-badge db-flow-source-badge--foot">👣 Footstep Path</span>
          </div>
          <div className="db-flow-row db-flow-row--dim">
            <FlowNode icon="👣" label="Footstep Generator" sub={`${data.footstep_energy} kWh`} />
            <FlowConnector />
            <FlowNode icon="⚡" label="Energy Generation"  sub="feeds grid" />
            <FlowConnector />
            <FlowNode icon="🔋" label="Battery Storage"    sub="charging" />
            <FlowConnector />
            <FlowNode icon="💡" label="Street Lights"      sub="powered" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7 — QUICK STATUS
      ══════════════════════════════════════ */}
      <section className="db-section">
        <SectionHeading icon="📡" title="Quick System Status" subtitle="Live health check of all subsystems" />
        <div className="db-card db-status-card">
          <div className="db-status-grid">
            {QUICK_STATUS.map(({ icon, label, value, pill }) => (
              <div key={label} className="db-status-item">
                <div className="db-status-item__icon">{icon}</div>
                <div className="db-status-item__body">
                  <div className="db-status-item__label">{label}</div>
                  <div className="db-status-item__value">{value}</div>
                </div>
                <StatusPill color={pill}>{value}</StatusPill>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 8 — CHARTS
      ══════════════════════════════════════ */}
      <section className="db-section">
        <SectionHeading icon="📊" title="Energy Analytics" subtitle="Generation trends and source breakdown" />
        <div className="db-grid-2" style={{ marginBottom: '1rem' }}>
          <ChartCard title="Energy Generation Today" subtitle="Solar vs Footstep output (kWh)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ENERGY_DATA}>
                <defs>
                  <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFoot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="solar"    stroke="#f59e0b" strokeWidth={2} fill="url(#gSolar)" name="Solar (kWh)" />
                <Area type="monotone" dataKey="footstep" stroke="#3b82f6" strokeWidth={2} fill="url(#gFoot)"  name="Footstep (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Energy Source Distribution" subtitle="Contribution share today (%)">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%" cy="50%"
                  innerRadius={58} outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Weekly Energy Output" subtitle="Total kWh generated per day this week">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="energy" fill="#22c55e" radius={[5, 5, 0, 0]} name="Energy (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

    </div>
  );
}
