"use client";
// src/components/marketplace/MarketplaceNav.jsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, LayoutDashboard, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MarketplaceNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); router.replace('/auth'); };

  return (
    <nav className="mp-nav">
      <div className="mp-nav-inner">
        <div className="mp-logo" onClick={() => router.push('/')}>
          <div className="mp-logo-icon">AE</div>
          <span className="mp-logo-text hide-mobile">Addies Exchange</span>
        </div>

        <div className="mp-nav-actions">
          {user ? (
            <>
              {user.canSell && (
                <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard/add-item')}>
                  <Plus size={14}/> <span className="hide-mobile">Sell</span>
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => router.push(user.role==='admin'?'/admin':'/dashboard')}>
                <LayoutDashboard size={14}/> <span className="hide-mobile">Dashboard</span>
              </button>
              <div className="avatar avatar-sm" style={{ cursor:'pointer' }} title={user.name}>{user.avatar}</div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
                <LogOut size={16}/>
              </button>
            </>
          ) : (
            <>
              <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }} className="hide-mobile">
                Want to sell?
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/auth')}>
                <LogIn size={14}/> Login / Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

