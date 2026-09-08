import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

const allAlerts = [
  { id: 1, type: 'Critical', icon: '🔴', title: 'Battery BAT-04 High Temperature', desc: 'Temperature reached 42°C — above safe threshold of 40°C.', time: '2 min ago', source: 'Battery' },
  { id: 2, type: 'Warning', icon: '🟡', title: 'Street Light SL-018 Offline', desc: 'No response from SL-018 in Zone D for over 2 hours.', time: '18 min ago', source: 'Street Light' },
  { id: 3, type: 'Warning', icon: '🟡', title: 'Solar Output Below Threshold', desc: 'Solar panel output dropped to 1.2 kW — possible shading or fault.', time: '45 min ago', source: 'Energy' },
  { id: 4, type: 'Info', icon: '🔵', title: 'Battery BAT-03 Fully Charged', desc: 'BAT-03 reached 100% charge and switched to float mode.', time: '1 hr ago', source: 'Battery' },
  { id: 5, type: 'Warning', icon: '🟡', title: 'Street Light SL-019 Offline', desc: 'No response from SL-019 in Zone D for over 3 hours.', time: '3 hr ago', source: 'Street Light' },
  { id: 6, type: 'Info', icon: '🔵', title: 'System Maintenance Scheduled', desc: 'Routine maintenance scheduled for this Sunday 02:00–04:00.', time: '5 hr ago', source: 'System' },
  { id: 7, type: 'Critical', icon: '🔴', title: 'Street Light SL-020 Power Failure', desc: 'Complete power failure detected on SL-020 in Zone D.', time: '6 hr ago', source: 'Street Light' },
  { id: 8, type: 'Info', icon: '🔵', title: 'Daily Energy Report Generated', desc: 'Yesterday\'s energy report is ready. Total: 67.2 kWh.', time: '8 hr ago', source: 'System' },
];

const typeStyle = {
  Critical: { badge: 'badge-red', border: '#fee2e2', bg: '#fff5f5' },
  Warning:  { badge: 'badge-yellow', border: '#fef3c7', bg: '#fffdf0' },
  Info:     { badge: 'badge-blue', border: '#dbeafe', bg: '#f0f7ff' },
};

export default function Alerts() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? allAlerts : allAlerts.filter(a => a.type === filter);
  const critical = allAlerts.filter(a => a.type === 'Critical').length;
  const warning = allAlerts.filter(a => a.type === 'Warning').length;
  const info = allAlerts.filter(a => a.type === 'Info').length;

  return (
    <div>
      <div className="page-title">🔔 Alerts</div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon="🔴" label="Critical Alerts" value={critical} color="red" />
        <StatCard icon="🟡" label="Warnings" value={warning} color="yellow" />
        <StatCard icon="🔵" label="Info Notices" value={info} color="blue" />
        <StatCard icon="✅" label="Resolved Today" value="5" color="green" />
      </div>

      <ChartCard title="Active Alerts" subtitle={`${filtered.length} alert(s) shown`}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['All', 'Critical', 'Warning', 'Info'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 14px', borderRadius: 999, border: '1px solid var(--border)',
                background: filter === f ? 'var(--green)' : 'var(--surface)',
                color: filter === f ? '#fff' : 'var(--text)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(alert => {
            const s = typeStyle[alert.type];
            return (
              <div
                key={alert.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 16px', borderRadius: 10,
                  border: `1px solid ${s.border}`, background: s.bg,
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{alert.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alert.title}</span>
                    <span className={`badge ${s.badge}`}>{alert.type}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{alert.source}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>{alert.desc}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🕐 {alert.time}</span>
                </div>
                <button
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--surface)', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
