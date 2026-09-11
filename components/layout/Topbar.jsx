"use client";
// src/components/layout/Topbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn btn-ghost show-mobile" style={{ padding:8 }} onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
          <ExternalLink size={14} /> <span className="hide-mobile">Marketplace</span>
        </button>
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>
        <div className="avatar avatar-sm">{user?.avatar}</div>
      </div>
    </header>
  );
}

