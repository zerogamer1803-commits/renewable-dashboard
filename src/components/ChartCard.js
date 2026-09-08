import React from 'react';
import './ChartCard.css';

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`chart-card card ${className}`}>
      <div className="chart-card__header">
        <div>
          <h3 className="chart-card__title">{title}</h3>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="chart-card__body">{children}</div>
    </div>
  );
}
