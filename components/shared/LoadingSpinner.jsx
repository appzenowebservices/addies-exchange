"use client";
// src/components/shared/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ size = 24, center = false }) {
  const el = (
    <div className="spinner spinner-blue" style={{ width: size, height: size, borderWidth: size > 30 ? 3 : 2.5 }} />
  );
  if (center) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:40 }}>{el}</div>;
  return el;
}

