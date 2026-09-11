"use client";
// src/components/shared/ModeSwitch.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ModeSwitch() {
  const { user, switchMode } = useAuth();
  if (!user || (!user.canBuy && !user.canSell)) return null;
  if (!user.canBuy || !user.canSell) return null; // only 1 mode available

  return (
    <div className="mode-switch" title="Switch between Buyer and Seller mode">
      {user.canBuy && (
        <button
          className={`mode-btn ${user.mode === 'buyer' ? 'active' : ''}`}
          onClick={() => switchMode('buyer')}
        >
          🛒 Buyer
        </button>
      )}
      {user.canSell && (
        <button
          className={`mode-btn ${user.mode === 'seller' ? 'active' : ''}`}
          onClick={() => switchMode('seller')}
        >
          🏪 Seller
        </button>
      )}
    </div>
  );
}

