"use client";
// src/components/dashboard/user/profile/SaveBar.jsx
import React from 'react';
import { Save } from 'lucide-react';

export default function SaveBar({ onSave, loading, saved, dirty }) {
  if (!dirty && !saved) return null;

  return (
    <div style={{
      position: 'sticky', bottom: 20, zIndex: 50,
      display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none',
    }}>
      <div style={{
        background: 'white', borderRadius: 'var(--radius-lg)', padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(15,61,92,0.2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'all',
      }}>
        {saved
          ? <span className="badge badge-green" style={{ fontSize:13, padding:'6px 14px' }}>✓ Changes Saved!</span>
          : (
            <>
              <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600 }}>You have unsaved changes</span>
              <button className="btn btn-primary" onClick={onSave} disabled={loading}>
                {loading ? <><div className="spinner"/>Saving…</> : <><Save size={15}/> Save Profile</>}
              </button>
            </>
          )
        }
      </div>
    </div>
  );
}

