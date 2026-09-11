"use client";
// src/components/auth/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm       from './LoginForm';
import RegisterForm    from './RegisterForm';
import ForgotPassword  from './ForgotPassword';
import './auth.css';

// views: 'login' | 'register' | 'forgot'
export default function AuthPage() {
  const [view, setView] = useState('login');
  const [prevView, setPrevView] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reason') === 'idle') {
      setView('login');
    }
  }, [searchParams]);

  const navigate = (to) => {
    setPrevView(view);
    setView(to);
  };

  const idleMsg = searchParams.get('reason') === 'idle'
    ? 'You were logged out due to inactivity.'
    : null;

  return (
    <div className="auth-bg">
      {/* Background decorations */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-card anim-fade-up">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <span>AE</span>
          </div>
          <div>
            <h1 className="auth-brand-name">Addies Exchange</h1>
            <p className="auth-brand-sub">Buy & Sell Anything, Anywhere</p>
          </div>
        </div>

        {idleMsg && (
          <div className="alert alert-info" style={{ margin: '0 0 16px' }}>
            <span>⏱</span>{idleMsg}
          </div>
        )}

        {/* Swipe Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${view === 'login' ? 'active' : ''}`} onClick={() => navigate('login')}>Login</button>
          <button className={`auth-tab ${view === 'register' ? 'active' : ''}`} onClick={() => navigate('register')}>Register</button>
        </div>

        {/* Animated Form Area */}
        <div className="auth-forms-wrap">
          <div className={`auth-forms-track ${view === 'register' ? 'slide-register' : view === 'forgot' ? 'slide-forgot' : ''}`}>
            <div className="auth-form-panel"><LoginForm    onForgot={() => navigate('forgot')} onRegister={() => navigate('register')} /></div>
            <div className="auth-form-panel"><RegisterForm onLogin={() => navigate('login')} /></div>
            <div className="auth-form-panel"><ForgotPassword onBack={() => navigate('login')} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

