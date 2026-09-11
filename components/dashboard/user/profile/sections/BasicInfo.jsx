"use client";
// src/components/dashboard/user/profile/sections/BasicInfo.jsx
import React from 'react';
import { User } from 'lucide-react';

const GENDERS    = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const ACCT_TYPES = [
  { id: 'buyer',  icon: '🛒', label: 'Buyer'  },
  { id: 'seller', icon: '🏪', label: 'Seller' },
  { id: 'both',   icon: '⚡', label: 'Both'   },
];

export default function BasicInfo({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title"><User size={16}/>Basic Information</span>
      </div>
      <div className="profile-section-body">

        {/* User ID (read-only) */}
        <div className="form-group">
          <label className="form-label">User ID</label>
          <input className="form-input" value={data.userId || 'Auto-generated'} disabled style={{ opacity:0.5, cursor:'not-allowed', fontFamily:'monospace', fontSize:13 }} />
        </div>

        <div className="field-grid-2">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="Ravi Kumar" value={data.fullName || ''} onChange={e => set('fullName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Username (Unique)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14, fontWeight:600 }}>@</span>
              <input className="form-input" style={{ paddingLeft:28 }} placeholder="ravikumar" value={data.username || ''} onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g,''))} />
            </div>
          </div>
        </div>

        <div className="field-grid-2">
          <div className="form-group">
            <label className="form-label">Email ID *</label>
            <input className="form-input" type="email" value={data.email || ''} disabled style={{ opacity:0.6, cursor:'not-allowed' }} />
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>Email cannot be changed</span>
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:13 }}>+91</span>
              <input className="form-input" style={{ paddingLeft:40 }} placeholder="98765 43210" value={data.mobile || ''} onChange={e => set('mobile', e.target.value)} maxLength={10} />
            </div>
          </div>
        </div>

        <div className="field-grid-2">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={data.gender || ''} onChange={e => set('gender', e.target.value)}>
              <option value="">Select gender</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input className="form-input" type="date" value={data.dob || ''} onChange={e => set('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bio / About Me</label>
          <textarea className="form-input" rows={3} placeholder="Tell buyers/sellers a bit about yourself…" value={data.bio || ''} onChange={e => set('bio', e.target.value)} maxLength={300} style={{ resize:'vertical' }} />
          <span style={{ fontSize:11, color:'var(--text-muted)', textAlign:'right', alignSelf:'flex-end' }}>{(data.bio || '').length}/300</span>
        </div>

        {/* Account Type */}
        <div className="form-group">
          <label className="form-label">Account Type</label>
          <div style={{ display:'flex', gap:10 }}>
            {ACCT_TYPES.map(t => (
              <button key={t.id} type="button"
                className={`role-btn ${data.accountType === t.id ? 'active' : ''}`}
                onClick={() => set('accountType', t.id)}
                style={{ flex:1 }}>
                <span className="role-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

