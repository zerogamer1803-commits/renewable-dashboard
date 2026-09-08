import React from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const monthlyStats = [
  { month: 'Jan', solar: 320, footstep: 85, co2: 162, cost: 1240 },
  { month: 'Feb', solar: 290, footstep: 78, co2: 148, cost: 1120 },
  { month: 'Mar', solar: 410, footstep: 102, co2: 204, cost: 1560 },
  { month: 'Apr', solar: 480, footstep: 115, co2: 238, cost: 1820 },
  { month: 'May', solar: 520, footstep: 130, co2: 260, cost: 1980 },
  { month: 'Jun', solar: 610, footstep: 145, co2: 304, cost: 2320 },
];

export default function Analytics() {
  return (
    <div>
      <div className="page-title">📊 Analytics</div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon="⚡" label="Total Energy (6mo)" value="2,685" unit="kWh" color="green" trend={18} />
        <StatCard icon="🌿" label="Total CO₂ Saved" value="1,316" unit="kg" color="teal" trend={22} />
        <StatCard icon="💰" label="Total Cost Saved" value="₱10,040" color="purple" trend={19} />
        <StatCard icon="📈" label="Avg Daily Output" value="14.8" unit="kWh" color="blue" trend={11} />
      </div>

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <ChartCard title="Monthly Energy Production" subtitle="Solar + Footstep (kWh)">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="solar" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Solar (kWh)" stackId="a" />
              <Bar dataKey="footstep" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Footstep (kWh)" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CO₂ Savings Trend" subtitle="kg of CO₂ avoided per month">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthlyStats}>
              <defs>
                <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="co2" stroke="#14b8a6" fill="url(#co2Grad)" name="CO₂ Saved (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Cost Savings Over Time" subtitle="Monthly savings in ₱">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `₱${v}`} />
            <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Cost Saved (₱)" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
