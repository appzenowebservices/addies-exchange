"use client";
// src/components/dashboard/user/profile/ProfileTabs.jsx
import React from 'react';
import {
  User, MapPin, ShieldCheck, Award, Store, ShoppingBag, Wallet, Lock, Globe
} from 'lucide-react';

export const PROFILE_TABS = [
  { id: 'basic',        label: 'Basic Info',    icon: <User        size={14}/> },
  { id: 'location',     label: 'Location',      icon: <MapPin      size={14}/> },
  { id: 'verification', label: 'Verification',  icon: <ShieldCheck size={14}/> },
  { id: 'badge',        label: 'Badge',         icon: <Award       size={14}/> },
  { id: 'seller',       label: 'Seller Stats',  icon: <Store       size={14}/> },
  { id: 'buyer',        label: 'Buyer',         icon: <ShoppingBag size={14}/> },
  { id: 'wallet',       label: 'Wallet',        icon: <Wallet      size={14}/> },
  { id: 'security',     label: 'Security',      icon: <Lock        size={14}/> },
  { id: 'public',       label: 'Public View',   icon: <Globe       size={14}/> },
];

export default function ProfileTabs({ activeTab, onChange }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="profile-tabs">
        {PROFILE_TABS.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

