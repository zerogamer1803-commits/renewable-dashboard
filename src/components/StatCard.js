import React from 'react';
import './StatCard.css';

export default function StatCard({ icon, label, value, unit, trend, trendLabel, color = 'green' }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${color}`}>{icon}</div>
        {trend !== undefined && (
          <span className={`badge ${trend >= 0 ? 'badge-green' : 'badge-red'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-card__value">
        {value}
        {unit && <span className="stat-card__unit">{unit}</span>}
      </div>
      <div className="stat-card__label">{label}</div>
      {trendLabel && <div className="stat-card__trend-label">{trendLabel}</div>}
    </div>
  );
}
