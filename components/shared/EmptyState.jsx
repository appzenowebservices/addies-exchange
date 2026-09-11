"use client";
// src/components/shared/EmptyState.jsx
import React from 'react';

export default function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 24px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>{icon}</div>
      <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:18, fontWeight:800, marginBottom:8, color:'var(--text-primary)' }}>{title}</h3>
      {desc && <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:20, maxWidth:300, margin:'0 auto 20px' }}>{desc}</p>}
      {action}
    </div>
  );
}

