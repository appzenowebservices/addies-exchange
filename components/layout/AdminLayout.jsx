"use client";
// src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingCart,
  Settings, ShieldCheck, DollarSign, Flag,
  Tag, Megaphone, User, Percent,
  MessageSquare, Bell, FileText, ClipboardList,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import './layout.css';

const NAV_ITEMS = [
  { path: '/admin',             end: true, icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },

  { divider: true, key: 'd1', label: 'Management' },
  { path: '/admin/users',       icon: <Users         size={18}/>, label: 'Users'           },
  { path: '/admin/items',       icon: <Package       size={18}/>, label: 'All Listings'    },
  { path: '/admin/orders',      icon: <ShoppingCart  size={18}/>, label: 'Orders'          },
  { path: '/admin/categories',  icon: <Tag           size={18}/>, label: 'Categories'      },
  { path: '/admin/ads',         icon: <Megaphone     size={18}/>, label: 'Ads Manager'     },

  { divider: true, key: 'd2', label: 'Finance & Safety' },
  { path: '/admin/kyc',         icon: <ShieldCheck   size={18}/>, label: 'KYC & Verification'   },
  { path: '/admin/revenue',     icon: <DollarSign    size={18}/>, label: 'Revenue & Payments'   },
  { path: '/admin/commission',  icon: <Percent       size={18}/>, label: 'Commission Settings'  },
  { path: '/admin/reports',     icon: <Flag          size={18}/>, label: 'Reports & Complaints' },

  { divider: true, key: 'd3', label: 'Communication' },
  { path: '/admin/chat-monitor',  icon: <MessageSquare size={18}/>, label: 'Chat Monitoring'         },
  { path: '/admin/notifications', icon: <Bell          size={18}/>, label: 'Notification Management' },

  { divider: true, key: 'd4', label: 'Content & System' },
  { path: '/admin/cms',         icon: <FileText      size={18}/>, label: 'CMS / Static Pages' },
  { path: '/admin/audit-log',   icon: <ClipboardList size={18}/>, label: 'Logs & Audit Trail' },
  { path: '/admin/profile',     icon: <User          size={18}/>, label: 'Admin Profile'      },
  { path: '/admin/settings',    icon: <Settings      size={18}/>, label: 'System Settings'    },
];

const TITLES = {
  '/admin':                 'Dashboard',
  '/admin/users':           'Users',
  '/admin/items':           'All Listings',
  '/admin/orders':          'Orders',
  '/admin/categories':      'Category Management',
  '/admin/ads':             'Ads Management',
  '/admin/kyc':             'KYC & Verification',
  '/admin/revenue':         'Revenue & Payments',
  '/admin/commission':      'Commission Settings',
  '/admin/reports':         'Reports & Complaints',
  '/admin/chat-monitor':    'Chat Monitoring',
  '/admin/notifications':   'Notification Management',
  '/admin/cms':             'CMS / Static Pages',
  '/admin/audit-log':       'Logs & Audit Trail',
  '/admin/profile':         'Admin Profile',
  '/admin/settings':        'System Settings',
};

export default function AdminLayout({ children }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Admin';

  return (
    <div className="app-shell">
      <Sidebar
        navItems={NAV_ITEMS}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`main-wrap ${collapsed ? 'collapsed' : ''}`}>
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content anim-fade-up">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

