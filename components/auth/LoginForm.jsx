"use client";
// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onForgot, onRegister }) {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form-title">Welcome back 👋</h2>
      <p className="auth-form-sub">Sign in to your Addies Exchange account</p>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><span>⚠</span>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input" type="email" name="email"
            placeholder="you@example.com" value={form.email}
            onChange={onChange} autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input" type={showPwd ? 'text' : 'password'}
              name="password" placeholder="••••••••" value={form.password}
              onChange={onChange} autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
              {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span />
          <button type="button" className="auth-link" onClick={onForgot}>Forgot password?</button>
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
          {loading ? <><div className="spinner" /><span>Signing in…</span></> : <><LogIn size={17} /><span>Sign In</span></>}
        </button>
      </div>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">Demo Credentials</span>
        <div className="auth-divider-line" />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[
          { label: '🛡 Admin', email: 'admin@test.com', pwd: 'admin123' },
          { label: '👤 User (Buyer+Seller)', email: 'both@test.com', pwd: 'user123' },
        ].map(demo => (
          <button key={demo.email} type="button"
            onClick={() => setForm({ email: demo.email, password: demo.pwd })}
            style={{ padding:'9px 14px', background:'var(--primary-50)', border:'1px solid var(--border-dark)', borderRadius:'var(--radius-md)', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, color:'var(--primary-700)', textAlign:'left', transition:'all 0.2s' }}
            onMouseEnter={e => e.target.style.background='var(--primary-100)'}
            onMouseLeave={e => e.target.style.background='var(--primary-50)'}
          >
            {demo.label} — {demo.email}
          </button>
        ))}
      </div>
    </form>
  );
}

