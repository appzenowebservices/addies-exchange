"use client";
// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ACCOUNT_TYPES = [
  { id: 'buyer',  label: 'Buyer',  icon: '🛒', desc: 'I want to buy' },
  { id: 'seller', label: 'Seller', icon: '🏪', desc: 'I want to sell' },
  { id: 'both',   label: 'Both',   icon: '⚡', desc: 'Buy & Sell' },
];

export default function RegisterForm({ onLogin }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', password: '', confirmPassword: '', accountType: 'both'
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [errors,  setErrors]  = useState({});

  const onChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())     errs.name     = 'Name is required';
    if (!form.email.trim())    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim())    errs.phone    = 'Phone is required';
    if (!form.city.trim())     errs.city     = 'City is required';
    if (!form.password)        errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form-title">Create Account ✨</h2>
      <p className="auth-form-sub">Join thousands of buyers and sellers</p>

      {error && <div className="alert alert-error" style={{ marginBottom: 14 }}><span>⚠</span>{error}</div>}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {/* Account Type */}
        <div className="form-group">
          <label className="form-label">I want to</label>
          <div className="role-selector">
            {ACCOUNT_TYPES.map(t => (
              <button key={t.id} type="button"
                className={`role-btn ${form.accountType === t.id ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, accountType: t.id }))}>
                <span className="role-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} name="name" placeholder="Ravi Kumar" value={form.name} onChange={onChange} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className={`form-input ${errors.phone ? 'error' : ''}`} name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={onChange} />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input className={`form-input ${errors.city ? 'error' : ''}`} name="city" placeholder="Delhi, Mumbai, Bangalore…" value={form.city} onChange={onChange} />
          {errors.city && <span className="form-error">{errors.city}</span>}
        </div>

        <div className="auth-row">
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <input className={`form-input ${errors.password ? 'error' : ''}`} type={showPwd ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={onChange} style={{ paddingRight:40 }} />
              <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm</label>
            <input className={`form-input ${errors.confirmPassword ? 'error' : ''}`} type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={onChange} />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
          {loading ? <><div className="spinner" /><span>Creating account…</span></> : <><UserPlus size={17} /><span>Create Account</span></>}
        </button>
      </div>
    </form>
  );
}

