"use client";
// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './layout.css';

export default function Sidebar({ navItems, collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  // Check if a nav item is active — supports ?tab= query params
  const isItemActive = (item) => {
    if (!item.path) return false;
    const [itemPath, itemQuery] = item.path.split('?');
    const currentSearch = location.search.replace('?', '');

    if (itemQuery) {
      // Sub-item with query param: match path AND query
      return location.pathname === itemPath && currentSearch === itemQuery;
    }
    // Regular item
    if (item.end) return location.pathname === itemPath;
    return location.pathname.startsWith(itemPath);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">AE</div>
            {!collapsed && <span className="sidebar-logo-text">Addies Exchange</span>}
          </div>
          <button className="sidebar-toggle hide-mobile" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
          <button className="sidebar-close show-mobile" onClick={onMobileClose}><X size={20}/></button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className={`avatar ${collapsed ? 'avatar-sm' : 'avatar-md'}`}>{user?.avatar}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">
                {user?.role === 'admin' ? '🛡 Super Admin' : user?.canSell && user?.canBuy ? '⚡ Buyer & Seller' : user?.canSell ? '🏪 Seller' : '🛒 Buyer'}
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.divider) {
              return (
                <div key={item.key || idx} className="sidebar-divider">
                  {!collapsed && <span>{item.label}</span>}
                </div>
              );
            }

            const active = isItemActive(item);
            const isIndent = item.indent;

            if (item.path?.includes('?')) {
              if (collapsed) return null;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onMobileClose?.();
                  }}
                  title={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    border: 'none',
                    padding: isIndent ? '7px 16px 7px 40px' : '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: active ? 'var(--primary-700)' : 'var(--text-muted)',
                    fontWeight: active ? 700 : 500,
                    background: active ? 'var(--primary-50)' : 'transparent',
                    borderLeft: active
                      ? '3px solid var(--primary-400)'
                      : '3px solid transparent',
                    marginLeft: isIndent ? 4 : 0,
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{
                      opacity: isIndent ? 0.7 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>

                  <span style={{ flex: 1, textAlign: 'left' }}>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className="badge badge-blue"
                      style={{ marginLeft: 'auto', fontSize: 10 }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive && !item.path.includes('?') ? 'active' : ''
                  } ${active ? 'active' : ''}`
                }
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                style={
                  isIndent && !collapsed
                    ? { paddingLeft: 40, fontSize: 13 }
                    : {}
                }
              >
                <span
                  className="sidebar-link-icon"
                  style={{ opacity: isIndent ? 0.75 : 1 }}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="sidebar-link-label">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className="badge badge-blue"
                    style={{ marginLeft: 'auto', fontSize: 10 }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout} title="Logout">
            <span className="sidebar-link-icon"><LogOut size={18}/></span>
            {!collapsed && <span className="sidebar-link-label">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

