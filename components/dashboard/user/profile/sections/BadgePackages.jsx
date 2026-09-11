"use client";
// src/components/dashboard/user/profile/sections/BadgePackages.jsx
import React from 'react';
import { Award, Check } from 'lucide-react';

const PACKAGES = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    price: '₹199',
    duration: '30 days',
    features: [
      'Basic verification badge',
      '30-day badge display',
      'Priority listing (Low)',
      'Trust score boost +5%',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: '🥈',
    price: '₹499',
    duration: '90 days',
    features: [
      'ID + Address verification',
      '90-day badge display',
      'Medium priority listing',
      'Featured highlight',
      'Trust score boost +15%',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: '🥇',
    price: '₹999',
    duration: '365 days',
    features: [
      'Full KYC verification',
      '365-day badge display',
      'Top priority listing',
      'Homepage boost',
      'Trust score badge',
      'Trust score boost +30%',
    ],
  },
];

export default function BadgePackages({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title"><Award size={16}/>Verified Badge Packages</span>
        {data.currentPackage && data.currentPackage !== 'none' && (
          <span className="badge badge-green">Badge Active ✓</span>
        )}
      </div>
      <div className="profile-section-body">

        {/* Package Cards */}
        <div className="badge-packages">
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`badge-pkg-card ${pkg.id} ${data.currentPackage === pkg.id ? 'active-pkg' : ''}`}
              onClick={() => set('currentPackage', pkg.id)}
            >
              <div className="pkg-icon">{pkg.icon}</div>
              <div className="pkg-name">{pkg.name}</div>
              <div style={{ fontFamily:'Roboto,sans-serif', fontSize:18, fontWeight:800, color:'var(--text-primary)', margin:'4px 0' }}>{pkg.price}</div>
              <div className="pkg-duration">Valid for {pkg.duration}</div>
              <div style={{ borderTop:'1px solid rgba(0,0,0,0.08)', paddingTop:10, marginTop:4, display:'flex', flexDirection:'column', gap:6 }}>
                {pkg.features.map(f => (
                  <div key={f} className="pkg-feature">
                    <Check size={12} style={{ color:'#16a34a', flexShrink:0 }}/> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current package details */}
        {data.currentPackage && data.currentPackage !== 'none' && (
          <div style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:16, border:'1px solid var(--primary-200)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--primary-700)', marginBottom:12 }}>📋 Active Package Details</div>
            <div className="field-grid-2">
              <div className="form-group">
                <label className="form-label">Package Start Date</label>
                <input className="form-input" type="date" value={data.packageStart || ''} onChange={e => set('packageStart', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Package Expiry Date</label>
                <input className="form-input" type="date" value={data.packageExpiry || ''} onChange={e => set('packageExpiry', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment ID</label>
                <input className="form-input" placeholder="PAY_XXXXXXXXXXXX" value={data.paymentId || ''} onChange={e => set('paymentId', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select className="form-select" value={data.paymentStatus || 'pending'} onChange={e => set('paymentStatus', e.target.value)}>
                  {['pending','completed','failed','refunded'].map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop:4 }}>
              <label className="form-label">Badge Active</label>
              <div style={{ display:'flex', gap:10 }}>
                {[true, false].map(v => (
                  <button key={String(v)} type="button"
                    className={`btn btn-sm ${data.badgeActive === v ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => set('badgeActive', v)}>
                    {v ? '✓ Yes' : '✗ No'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

