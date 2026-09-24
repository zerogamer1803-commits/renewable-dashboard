import React, { useState, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
import { apiFetch } from '../api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './EnergyMonitoring.css';

const PIE_COLORS = ['#f59e0b', '#3b82f6'];

function StatusPill({ color, children }) {
  return (
    <span className={`em-pill em-pill--${color}`}>
      <span className="em-pill__dot" />
      {children}
    </span>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="em-section-heading">
      <span className="em-section-icon">{icon}</span>
      <div>
        <div className="em-section-title">{title}</div>
        {subtitle && (
          <div className="em-section-subtitle">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ items }) {
  return (
    <div className="em-meta-row">
      {items.map(({ label, value }) => (
        <div key={label} className="em-meta-item">
          <span className="em-meta-item__label">{label}</span>
          <span className="em-meta-item__value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function StatMiniCard({ icon, iconBg, label, value, unit, sub }) {
  return (
    <div className="em-mini-card">
      <div
        className="em-mini-card__icon"
        style={{ background: iconBg }}
      >
        {icon}
      </div>

      <div className="em-mini-card__body">
        <div className="em-mini-card__value">
          {value}
          <span className="em-mini-card__unit">{unit}</span>
        </div>

        <div className="em-mini-card__label">{label}</div>

        {sub && (
          <div className="em-mini-card__sub">{sub}</div>
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="em-tooltip">
      <div className="em-tooltip__label">{label}</div>

      {payload.map((p) => (
        <div key={p.name} className="em-tooltip__row">
          <span
            className="em-tooltip__dot"
            style={{ background: p.color }}
          />

          <span>{p.name}:</span>

          <strong>
            {Number(p.value).toFixed(4)} kWh
          </strong>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_SOURCE = {
  source: '',
  power_output: 0,
  solar_voltage: 0,
  energy_today: 0,
  energy_week: 0,
  energy_month: 0,
  efficiency: 0,
  peak_power: 0,
};

/* =========================================================
   SOLAR CURRENT CALCULATION

   Demo current range:
   1.000 A → 1.100 A

   Voltage ranges:
   0–5 V       → 1.000 A
   >5–10 V     → 1.025 A
   >10–15 V    → 1.050 A
   >15–20 V    → 1.075 A
   >20 V       → 1.100 A

   Current is calculated from the live solar voltage.
========================================================= */

function getSolarCurrent(voltage) {
  const v = Number(voltage) || 0;

  if (v <= 5) {
    return 1.000;
  }

  if (v <= 10) {
    return 1.025;
  }

  if (v <= 15) {
    return 1.050;
  }

  if (v <= 20) {
    return 1.075;
  }

  return 1.100;
}

/* =========================================================
   LIVE SOLAR CALCULATION
========================================================= */

function calculateSolarData(solarVoltage, backendSolar) {
  const voltage = Number(solarVoltage) || 0;

  const current = getSolarCurrent(voltage);

  /* Power = Voltage × Current */
  const powerW = voltage * current;

  /* Convert W → kW */
  const powerKW = powerW / 1000;

  /*
    Demo operating time:
    12 hours
  */
  const energyWh = powerW * 12;

  /* Convert Wh → kWh */
  const energyKWh = energyWh / 1000;

  /*
    Keep backend weekly/monthly values.
  */
  const backendWeek =
    Number(backendSolar?.energy_week) || 0;

  const backendMonth =
    Number(backendSolar?.energy_month) || 0;

  /*
    Peak power:
    use whichever is higher:
    current calculated power
    OR backend stored peak
  */
  const backendPeakW =
    (Number(backendSolar?.peak_power) || 0) * 1000;

  const peakW = Math.max(
    powerW,
    backendPeakW
  );

  /*
    Efficiency remains the configured/demo
    backend value because actual solar input
    irradiance is not being measured.
  */
  const efficiency =
    Number(backendSolar?.efficiency) || 0;

  return {
    ...backendSolar,

    solar_voltage:
      Number(voltage.toFixed(2)),

    solar_current:
      Number(current.toFixed(3)),

    power_watts:
      Number(powerW.toFixed(3)),

    power_output:
      Number(powerKW.toFixed(4)),

    energy_today:
      Number(energyKWh.toFixed(4)),

    energy_week:
      Number(backendWeek.toFixed(2)),

    energy_month:
      Number(backendMonth.toFixed(2)),

    peak_power:
      Number((peakW / 1000).toFixed(4)),

    efficiency:
      Number(efficiency.toFixed(1)),
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EnergyMonitoring() {
  const [sources, setSources] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =======================================================
     LIVE API FETCH
     Every 5 seconds
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [srcRes, histRes] = await Promise.all([
          apiFetch('/api/energy/'),
          apiFetch('/api/energy/history/'),
        ]);

        if (!cancelled) {
          setSources(srcRes.data || []);
          setHistory(histRes.data || []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            'Could not load energy data. Showing last known values.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAll();

    const interval = setInterval(
      fetchAll,
      5000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     BACKEND SOURCES
  ======================================================= */

  const backendSolar =
    sources.find(
      (s) => s.source === 'Solar'
    ) || DEFAULT_SOURCE;

  const footstep =
    sources.find(
      (s) => s.source === 'Footstep'
    ) || DEFAULT_SOURCE;

  /* =======================================================
     LIVE SOLAR DATA
  ======================================================= */

  const solar = calculateSolarData(
    backendSolar.solar_voltage,
    backendSolar
  );

  /* =======================================================
     TOTAL ENERGY
  ======================================================= */

  const totalToday = Number(
    (
      Number(solar.energy_today) +
      Number(footstep.energy_today)
    ).toFixed(4)
  );

  const totalWeek = Number(
    (
      Number(solar.energy_week) +
      Number(footstep.energy_week)
    ).toFixed(2)
  );

  const totalMonth = Number(
    (
      Number(solar.energy_month) +
      Number(footstep.energy_month)
    ).toFixed(2)
  );

  /* =======================================================
     SOURCE PERCENTAGES
  ======================================================= */

  const solarPct =
    totalToday > 0
      ? Number(
          (
            (Number(solar.energy_today) /
              totalToday) *
            100
          ).toFixed(1)
        )
      : 0;

  const footPct =
    totalToday > 0
      ? Number(
          (
            (Number(footstep.energy_today) /
              totalToday) *
            100
          ).toFixed(1)
        )
      : 0;

  const SOURCE_PIE = [
    {
      name: 'Solar Energy',
      value: solarPct,
    },
    {
      name: 'Footstep Energy',
      value: footPct,
    },
  ];

  /* =======================================================
     HISTORY DATA
  ======================================================= */

  const historyByDate = {};

  history.forEach(
    ({ source, energy, date }) => {
      if (!historyByDate[date]) {
        historyByDate[date] = {
          day: date.slice(5),
          solar: 0,
          footstep: 0,
        };
      }

      if (source === 'Solar') {
        historyByDate[date].solar +=
          Number(energy) || 0;
      }

      if (source === 'Footstep') {
        historyByDate[date].footstep +=
          Number(energy) || 0;
      }
    }
  );

  let weeklyBar =
    Object.values(historyByDate).slice(-7);

  /* =======================================================
     ADD LIVE TODAY VALUE
  ======================================================= */

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const todayLabel =
    today.slice(5);

  const todayIndex =
    weeklyBar.findIndex(
      (item) =>
        item.day === todayLabel
    );

  if (todayIndex >= 0) {
    weeklyBar[todayIndex] = {
      ...weeklyBar[todayIndex],

      solar:
        Number(solar.energy_today),

      footstep:
        Number(footstep.energy_today),
    };
  } else {
    weeklyBar = [
      ...weeklyBar,
      {
        day: todayLabel,

        solar:
          Number(solar.energy_today),

        footstep:
          Number(footstep.energy_today),
      },
    ].slice(-7);
  }

  /* =======================================================
     DAILY TREND
  ======================================================= */

  const dailyTrend =
    weeklyBar.map((item) => ({
      ...item,

      total: Number(
        (
          Number(item.solar) +
          Number(item.footstep)
        ).toFixed(4)
      ),
    }));

  /* =======================================================
     CO2 + COST
  ======================================================= */

  const co2Saved =
    Number(
      (totalToday * 0.7).toFixed(2)
    );

  const costSaved =
    Number(
      (totalToday * 7.5).toFixed(2)
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="em-root">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="em-page-header">

        <div className="em-page-header__left">

          <h1 className="em-page-title">

            <span className="em-page-title__icon">
              ☀️
            </span>

            Energy Monitoring

          </h1>

          <p className="em-page-desc">
            Monitor renewable energy generation
            from solar panels and footstep
            electricity generation.
          </p>

        </div>

        <div className="em-page-header__right">

          <div className="em-live-chip">

            <span className="em-live-dot" />

            {loading
              ? 'Loading…'
              : 'System Online'}

          </div>

          <div className="em-header-badge">

            <span className="em-header-badge__label">
              Live Update
            </span>

            <span className="em-header-badge__value">
              Every 5 sec
            </span>

          </div>

          <div className="em-header-badge">

            <span className="em-header-badge__label">
              Data Source
            </span>

            <span className="em-header-badge__value">
              Live API
            </span>

          </div>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: 8,
            padding: '10px 16px',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            color: '#64748b',
            fontSize: 15,
          }}
        >
          Loading energy data…
        </div>
      )}

      {/* =================================================
          SECTION 1 — SOURCE MONITORING
      ================================================= */}

      <section className="em-section">

        <SectionHeading
          icon="⚡"
          title="Source Monitoring"
          subtitle="Live readings from each renewable energy source"
        />

        <div className="em-source-grid">

          {/* =================================================
              SOLAR
          ================================================= */}

          <div className="em-source-card em-source-card--solar">

            <div className="em-source-card__accent" />

            <div className="em-source-card__head">

              <div className="em-source-card__icon-wrap em-source-card__icon-wrap--solar">
                ☀️
              </div>

              <div className="em-source-card__head-text">

                <div className="em-source-card__name">
                  Solar Energy
                </div>

                <div className="em-source-card__device">
                  Rooftop Solar Panel Array
                </div>

              </div>

              <StatusPill color="yellow">
                Generating
              </StatusPill>

            </div>

            {/* POWER */}

            <div className="em-source-card__primary">

              <div className="em-source-card__kw">

                {solar.power_watts.toFixed(3)}

                <span className="em-source-card__kw-unit">
                  {' '}W
                </span>

              </div>

              <div className="em-source-card__kw-label">
                Current Power Output
              </div>

            </div>

            <div className="em-source-card__divider" />

            {/* ENERGY */}

            <div className="em-source-card__stats">

              <div className="em-source-stat">

                <span className="em-source-stat__val">

                  {solar.energy_today.toFixed(4)}

                  {' '}

                  <small>kWh</small>

                </span>

                <span className="em-source-stat__lbl">
                  Today
                </span>

              </div>

              <div className="em-source-stat em-source-stat--sep">

                <span className="em-source-stat__val">

                  {solar.energy_week.toFixed(2)}

                  {' '}

                  <small>kWh</small>

                </span>

                <span className="em-source-stat__lbl">
                  This Week
                </span>

              </div>

              <div className="em-source-stat em-source-stat--sep">

                <span className="em-source-stat__val">

                  {solar.energy_month.toFixed(2)}

                  {' '}

                  <small>kWh</small>

                </span>

                <span className="em-source-stat__lbl">
                  This Month
                </span>

              </div>

            </div>

            <div className="em-source-card__divider" />

            {/* LIVE SOLAR VALUES */}

            <MetaRow
              items={[
                {
                  label: 'Solar Voltage',
                  value:
                    `${solar.solar_voltage.toFixed(2)} V`,
                },
                {
                  label: 'Solar Current',
                  value:
                    `${solar.solar_current.toFixed(3)} A`,
                },
                {
                  label: 'Solar Power',
                  value:
                    `${solar.power_watts.toFixed(3)} W`,
                },
              ]}
            />

            <div className="em-source-card__divider" />

            <MetaRow
              items={[
                {
                  label: 'Peak Today',
                  value:
                    `${solar.peak_power.toFixed(4)} kW`,
                },
                {
                  label: 'Panel Efficiency',
                  value:
                    `${solar.efficiency}%`,
                },
              ]}
            />

          </div>

          {/* =================================================
              FOOTSTEP — UNCHANGED
          ================================================= */}

          <div className="em-source-card em-source-card--foot">

            <div className="em-source-card__accent em-source-card__accent--blue" />

            <div className="em-source-card__head">

              <div className="em-source-card__icon-wrap em-source-card__icon-wrap--foot">
                👣
              </div>

              <div className="em-source-card__head-text">

                <div className="em-source-card__name">
                  Footstep Energy
                </div>

                <div className="em-source-card__device">
                  Piezoelectric Floor Tiles
                </div>

              </div>

              <StatusPill color="blue">
                Generating
              </StatusPill>

            </div>

            <div className="em-source-card__primary">

              <div className="em-source-card__kw em-source-card__kw--blue">

                {footstep.power_output}

                <span className="em-source-card__kw-unit">
                  {' '}kW
                </span>

              </div>

              <div className="em-source-card__kw-label">
                Current Power Output
              </div>

            </div>

            <div className="em-source-card__divider" />

            <div className="em-source-card__stats">

              <div className="em-source-stat">

                <span className="em-source-stat__val em-source-stat__val--blue">
                  {footstep.energy_today}
                  {' '}
                  <small>kWh</small>
                </span>

                <span className="em-source-stat__lbl">
                  Today
                </span>

              </div>

              <div className="em-source-stat em-source-stat--sep">

                <span className="em-source-stat__val em-source-stat__val--blue">
                  {footstep.energy_week}
                  {' '}
                  <small>kWh</small>
                </span>

                <span className="em-source-stat__lbl">
                  This Week
                </span>

              </div>

              <div className="em-source-stat em-source-stat--sep">

                <span className="em-source-stat__val em-source-stat__val--blue">
                  {footstep.energy_month}
                  {' '}
                  <small>kWh</small>
                </span>

                <span className="em-source-stat__lbl">
                  This Month
                </span>

              </div>

            </div>

            <div className="em-source-card__divider" />

            <MetaRow
              items={[
                {
                  label: 'Tile Efficiency',
                  value:
                    `${footstep.efficiency}%`,
                },
                {
                  label: 'Peak Today',
                  value:
                    `${footstep.peak_power} kW`,
                },
              ]}
            />

          </div>

        </div>
      </section>

      {/* =================================================
          SECTION 2 — TOTAL RENEWABLE ENERGY
      ================================================= */}

      <section className="em-section">

        <SectionHeading
          icon="⚡"
          title="Total Renewable Energy"
          subtitle="Combined output from all sources today"
        />

        <div className="em-total-card">

          <div className="em-total-card__left">

            <div className="em-total-card__icon">
              ⚡
            </div>

            <div>

              <div className="em-total-card__label">
                Total Renewable Energy Today
              </div>

              <div className="em-total-card__value">

                {totalToday.toFixed(4)}

                <span className="em-total-card__unit">
                  {' '}kWh
                </span>

              </div>

              <StatusPill color="green">
                Active
              </StatusPill>

            </div>

          </div>

          <div className="em-total-card__breakdown">

            <div className="em-breakdown-item em-breakdown-item--solar">

              <div className="em-breakdown-item__icon">
                ☀️
              </div>

              <div className="em-breakdown-item__body">

                <div className="em-breakdown-item__label">
                  Solar Energy
                </div>

                <div className="em-breakdown-item__value">
                  {solar.energy_today.toFixed(4)} kWh
                </div>

                <div className="em-breakdown-item__bar-wrap">

                  <div
                    className="em-breakdown-item__bar"
                    style={{
                      width: `${solarPct}%`,
                      background: '#f59e0b',
                    }}
                  />

                </div>

                <div className="em-breakdown-item__pct">
                  {solarPct}%
                </div>

              </div>

            </div>

            <div className="em-breakdown-item em-breakdown-item--foot">

              <div className="em-breakdown-item__icon">
                👣
              </div>

              <div className="em-breakdown-item__body">

                <div className="em-breakdown-item__label">
                  Footstep Energy
                </div>

                <div className="em-breakdown-item__value">
                  {footstep.energy_today} kWh
                </div>

                <div className="em-breakdown-item__bar-wrap">

                  <div
                    className="em-breakdown-item__bar"
                    style={{
                      width: `${footPct}%`,
                      background: '#3b82f6',
                    }}
                  />

                </div>

                <div className="em-breakdown-item__pct">
                  {footPct}%
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          SECTION 3 — ENERGY GENERATION CHARTS
      ================================================= */}

      <section className="em-section">

        <SectionHeading
          icon="📊"
          title="Energy Generation Charts"
          subtitle="Live renewable energy generation and source contribution"
        />

        <div className="em-chart-grid">

          {/* BAR CHART */}

          <ChartCard
            title="Renewable Energy Generation"
            subtitle="Solar & Footstep — live daily values"
          >

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <BarChart
                data={
                  weeklyBar.length
                    ? weeklyBar
                    : [
                        {
                          day: '—',
                          solar: 0,
                          footstep: 0,
                        },
                      ]
                }
                barCategoryGap="28%"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  unit=" kWh"
                />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />

                <Bar
                  dataKey="solar"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                  name="Solar Energy"
                />

                <Bar
                  dataKey="footstep"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                  name="Footstep Energy"
                />

              </BarChart>

            </ResponsiveContainer>

          </ChartCard>

          {/* PIE */}

          <ChartCard
            title="Energy Source Comparison"
            subtitle="Percentage contribution of each source today"
          >

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <PieChart>

                <Pie
                  data={SOURCE_PIE}
                  cx="50%"
                  cy="46%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ value }) =>
                    `${value}%`
                  }
                  labelLine={false}
                >

                  {SOURCE_PIE.map(
                    (_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i]}
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(v) =>
                    `${v}%`
                  }
                />

                <Legend
                  formatter={(
                    value,
                    entry
                  ) => (
                    <span
                      style={{
                        fontSize: 12,
                      }}
                    >
                      {value} —{' '}
                      <strong>
                        {
                          entry
                            .payload
                            .value
                        }%
                      </strong>
                    </span>
                  )}
                />

              </PieChart>

            </ResponsiveContainer>

          </ChartCard>

        </div>
      </section>

      {/* =================================================
          SECTION 4 — DAILY TREND
      ================================================= */}

      <section className="em-section">

        <SectionHeading
          icon="📈"
          title="Daily Energy Trend"
          subtitle="Live renewable energy generation trend"
        />

        <ChartCard
          title="Daily Generation Trend"
          subtitle="Solar, Footstep & Total energy"
        >

          <ResponsiveContainer
            width="100%"
            height={260}
          >

            <LineChart
              data={
                dailyTrend.length
                  ? dailyTrend
                  : [
                      {
                        day: '—',
                        solar: 0,
                        footstep: 0,
                        total: 0,
                      },
                    ]
              }
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit=" kWh"
              />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Legend
                wrapperStyle={{ fontSize: 12 }}
              />

              <Line
                type="monotone"
                dataKey="solar"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                name="Solar Energy"
              />

              <Line
                type="monotone"
                dataKey="footstep"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                name="Footstep Energy"
              />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                name="Total Energy"
              />

            </LineChart>

          </ResponsiveContainer>

        </ChartCard>

      </section>

      {/* =================================================
          SECTION 5 — ENERGY STATISTICS
      ================================================= */}

      <section className="em-section">

        <SectionHeading
          icon="🔢"
          title="Energy Statistics"
          subtitle="Live calculated performance metrics"
        />

        <div className="em-stats-grid">

          <StatMiniCard
            icon="☀️"
            iconBg="#fef3c7"
            label="Peak Solar Power"
            value={solar.peak_power.toFixed(4)}
            unit=" kW"
            sub="Today's calculated peak"
          />

          <StatMiniCard
            icon="👣"
            iconBg="#dbeafe"
            label="Peak Footstep Power"
            value={footstep.peak_power}
            unit=" kW"
            sub="Today's peak"
          />

          <StatMiniCard
            icon="📊"
            iconBg="#dcfce7"
            label="Solar Efficiency"
            value={solar.efficiency}
            unit="%"
            sub="Configured panel efficiency"
          />

          <StatMiniCard
            icon="⚡"
            iconBg="#ede9fe"
            label="Total Energy Today"
            value={totalToday.toFixed(4)}
            unit=" kWh"
            sub="Solar + Footstep"
          />

          <StatMiniCard
            icon="📅"
            iconBg="#ccfbf1"
            label="Weekly Total"
            value={totalWeek.toFixed(2)}
            unit=" kWh"
            sub={`Solar ${solar.energy_week} + Foot ${footstep.energy_week}`}
          />

          <StatMiniCard
            icon="🗓️"
            iconBg="#ffedd5"
            label="Monthly Total"
            value={totalMonth.toFixed(2)}
            unit=" kWh"
            sub={`Solar ${solar.energy_month} + Foot ${footstep.energy_month}`}
          />

          <StatMiniCard
            icon="🌿"
            iconBg="#dcfce7"
            label="CO₂ Avoided Today"
            value={co2Saved.toFixed(2)}
            unit=" kg"
            sub="Based on 0.7 kg/kWh"
          />

          <StatMiniCard
            icon="💰"
            iconBg="#ede9fe"
            label="Cost Saved Today"
            value={`₹${costSaved.toFixed(2)}`}
            unit=""
            sub="At ₹7.50 / kWh"
          />

        </div>
      </section>

      {/* =================================================
          SECTION 6 — SOURCE DETAILS
      ================================================= */}

      <section className="em-section">

        <SectionHeading
          icon="📋"
          title="Source Details"
          subtitle="Live sensor readings and calculated values"
        />

        <div className="em-card">

          <div className="em-table-wrap">

            <table className="em-table">

              <thead>

                <tr>

                  {[
                    'Source',
                    'Current Output',
                    'Today',
                    'This Week',
                    'This Month',
                    'Efficiency',
                    'Status',
                  ].map((h) => (
                    <th key={h}>
                      {h}
                    </th>
                  ))}

                </tr>

              </thead>

              <tbody>

                {/* SOLAR */}

                <tr>

                  <td>
                    <span className="em-table-source">
                      ☀️ Solar Panel Array
                    </span>
                  </td>

                  <td>
                    <strong>
                      {solar.power_watts.toFixed(3)} W
                    </strong>
                  </td>

                  <td>
                    {solar.energy_today.toFixed(4)} kWh
                  </td>

                  <td>
                    {solar.energy_week.toFixed(2)} kWh
                  </td>

                  <td>
                    {solar.energy_month.toFixed(2)} kWh
                  </td>

                  <td>

                    <div className="em-eff-bar">

                      <div
                        className="em-eff-bar__fill"
                        style={{
                          width:
                            `${solar.efficiency}%`,
                          background:
                            '#22c55e',
                        }}
                      />

                    </div>

                    <span className="em-eff-label">
                      {solar.efficiency}%
                    </span>

                  </td>

                  <td>

                    <StatusPill color="yellow">
                      Generating
                    </StatusPill>

                  </td>

                </tr>

                {/* FOOTSTEP */}

                <tr>

                  <td>
                    <span className="em-table-source">
                      👣 Footstep Tiles
                    </span>
                  </td>

                  <td>
                    <strong>
                      {footstep.power_output} kW
                    </strong>
                  </td>

                  <td>
                    {footstep.energy_today} kWh
                  </td>

                  <td>
                    {footstep.energy_week} kWh
                  </td>

                  <td>
                    {footstep.energy_month} kWh
                  </td>

                  <td>

                    <div className="em-eff-bar">

                      <div
                        className="em-eff-bar__fill"
                        style={{
                          width:
                            `${footstep.efficiency}%`,
                          background:
                            '#3b82f6',
                        }}
                      />

                    </div>

                    <span className="em-eff-label">
                      {footstep.efficiency}%
                    </span>

                  </td>

                  <td>

                    <StatusPill color="blue">
                      Generating
                    </StatusPill>

                  </td>

                </tr>

                {/* TOTAL */}

                <tr className="em-table-total-row">

                  <td>

                    <span className="em-table-source">
                      ⚡ Total
                    </span>

                  </td>

                  <td>

                    <strong>

                      {(
                        solar.power_output +
                        Number(
                          footstep.power_output
                        )
                      ).toFixed(4)}

                      {' '}kW

                    </strong>

                  </td>

                  <td>

                    <strong>
                      {totalToday.toFixed(4)} kWh
                    </strong>

                  </td>

                  <td>

                    <strong>
                      {totalWeek.toFixed(2)} kWh
                    </strong>

                  </td>

                  <td>

                    <strong>
                      {totalMonth.toFixed(2)} kWh
                    </strong>

                  </td>

                  <td>
                    —
                  </td>

                  <td>

                    <StatusPill color="green">
                      Active
                    </StatusPill>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>
      </section>

    </div>
  );
}