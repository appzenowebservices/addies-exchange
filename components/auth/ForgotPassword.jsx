"use client";
// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { mockAPI } from '../../server/trpcClient';

export default function ForgotPassword({ onBack }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
    setLoading(true);
    try {
      await mockAPI.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-success">
        <div className="auth-success-icon">✅</div>
        <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:18, fontWeight:800, marginBottom:8 }}>Check Your Email</h3>
        <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:20, lineHeight:1.6 }}>
          We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
        </p>
        <button className="btn btn-secondary btn-full" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <button type="button" className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Login
      </button>

      <h2 className="auth-form-title">Reset Password 🔐</h2>
      <p className="auth-form-sub" style={{ marginBottom:20 }}>
        Enter your registered email and we'll send you a reset link.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom:14 }}><span>⚠</span>{error}</div>}

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position:'relative' }}>
            <input
              className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ paddingLeft:40 }}
            />
            <Mail size={16} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
          {loading ? <><div className="spinner" /><span>Sending…</span></> : <><Mail size={17} /><span>Send Reset Link</span></>}
        </button>
      </div>

      <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--text-muted)' }}>
        Remember your password?{' '}
        <button type="button" className="auth-link" onClick={onBack}>Sign in</button>
      </p>
    </form>
  );
}

