"use client";
// src/components/shared/StatCard.jsx
import React from 'react';

export default function StatCard({ icon, iconBg, value, label, trend, trendLabel }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg || 'var(--primary-100)' }}>
        {icon}
      </div>
      <div>
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
        {trend !== undefined && (
          <div style={{ marginTop:6, fontSize:12, fontWeight:600, color: trend >= 0 ? '#16a34a' : '#dc2626' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

