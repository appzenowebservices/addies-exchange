"use client";
// src/components/layout/UserLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Plus, ShoppingCart, User,
  MapPin, ShieldCheck, Award, Store, ShoppingBag,
  Wallet, Lock, Globe, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar    from './Sidebar';
import Topbar     from './Topbar';
import ModeSwitch from '../shared/ModeSwitch';
import './layout.css';

function buildNav(user) {
  const canSell = user?.canSell;
  const canBuy  = user?.canBuy;

  const items = [
    { path: '/dashboard', end: true, icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
  ];

  // ── Seller Section ───────────────────────────────
  if (canSell) {
    items.push({ divider: true, key: 'ds', label: 'Seller' });
    items.push({ path: '/dashboard/listings', icon: <Package       size={18}/>, label: 'My Listings'  });
    items.push({ path: '/dashboard/add-item', icon: <Plus          size={18}/>, label: 'Add Listing'  });
    // items.push({ path: '/dashboard/orders',   icon: <Store         size={18}/>, label: 'My Sales'     });
  }

  // ── Buyer Section ────────────────────────────────
  if (canBuy && !canSell) {
    items.push({ divider: true, key: 'db', label: 'Buyer' });
    items.push({ path: '/dashboard/orders',   icon: <ShoppingCart  size={18}/>, label: 'My Orders'    });
  } else if (canBuy && canSell) {
    items.push({ path: '/dashboard/orders',   icon: <ShoppingCart  size={18}/>, label: 'My Orders'    });
  }

  // ── Messages ─────────────────────────────────────
  items.push({ divider: true, key: 'dm', label: 'Messages' });
  items.push({ path: '/chat', icon: <MessageSquare size={18}/>, label: 'Chats', badge: '3' });

  // ── Profile & Account ────────────────────────────
  items.push({ divider: true, key: 'da', label: 'My Account' });
  items.push({ path: '/dashboard/profile',                  icon: <User        size={18}/>, label: 'Profile'       });
  items.push({ path: '/dashboard/profile?tab=basic',        icon: <User        size={16}/>, label: 'Basic Info',      indent: true });
  items.push({ path: '/dashboard/profile?tab=location',     icon: <MapPin      size={16}/>, label: 'Location',        indent: true });
  items.push({ path: '/dashboard/profile?tab=verification', icon: <ShieldCheck size={16}/>, label: 'Verification',    indent: true });
  items.push({ path: '/dashboard/profile?tab=badge',        icon: <Award       size={16}/>, label: 'Badge',           indent: true });
  if (canSell) {
    items.push({ path: '/dashboard/profile?tab=seller',     icon: <Store       size={16}/>, label: 'Seller Stats',    indent: true });
  }
  if (canBuy) {
    items.push({ path: '/dashboard/profile?tab=buyer',      icon: <ShoppingBag size={16}/>, label: 'Buyer Activity',  indent: true });
  }
  items.push({ path: '/dashboard/profile?tab=wallet',       icon: <Wallet      size={16}/>, label: 'Wallet',          indent: true });
  items.push({ path: '/dashboard/profile?tab=security',     icon: <Lock        size={16}/>, label: 'Security',        indent: true });
  items.push({ path: '/dashboard/profile?tab=public',       icon: <Globe       size={16}/>, label: 'Public View',     indent: true });

  return items;
}

const TITLES = {
  '/dashboard':           'Dashboard',
  '/dashboard/listings':  'My Listings',
  '/dashboard/add-item':  'Add Listing',
  '/dashboard/orders':    'My Orders',
  '/dashboard/profile':   'My Profile',
  '/chat':                'Messages',
};

export default function UserLayout({ children }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user }    = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <Sidebar
        navItems={buildNav(user)}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`main-wrap ${collapsed ? 'collapsed' : ''}`}>
        <Topbar
          title={TITLES[pathname] || 'Dashboard'}
          onMenuClick={() => setMobileOpen(true)}
          extra={<ModeSwitch />}
        />
        <main className="page-content anim-fade-up">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

