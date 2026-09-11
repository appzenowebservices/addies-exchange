"use client";
// src/components/dashboard/admin/AdminCommission.jsx
import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Save } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

function EditableCell({ value, onSave, prefix = '', suffix = '' }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const commit = () => { onSave(+val); setEditing(false); };
  if (editing) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="number" value={val} onChange={e => setVal(e.target.value)} autoFocus
        style={{ width: 80, padding: '4px 8px', border: '1.5px solid var(--primary-400)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
      />
      <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }}><Check size={14} /></button>
      <button onClick={() => { setVal(value); setEditing(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><X size={14} /></button>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setEditing(true)}>
      <span style={{ fontWeight: 700, fontSize: 13 }}>{prefix}{value}{suffix}</span>
      <Pencil size={11} color="#94a3b8" />
    </div>
  );
}

function GlobalFeeCard({ label, icon, value, field, prefix = '₹', onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const commit = () => { onSave(field, +val); setEditing(false); };
  return (
    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="number" value={val} onChange={e => setVal(e.target.value)} autoFocus
            style={{ width: 90, padding: '4px 8px', border: '1.5px solid var(--primary-400)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: 16, fontWeight: 800 }}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          />
          <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }}><Check size={15} /></button>
          <button onClick={() => { setVal(value); setEditing(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><X size={15} /></button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setEditing(true)}>
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--primary-700)' }}>{prefix}{value}</span>
          <Pencil size={12} color="#94a3b8" />
        </div>
      )}
    </div>
  );
}

export default function AdminCommission() {
  const [categories, setCategories] = useState([]);
  const [global,     setGlobal]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [saved,      setSaved]      = useState(false);

  useEffect(() => {
    mockAPI.getCommissionSettings()
      .then(r => {
        // MOCK_COMMISSION_SETTINGS = { global: {...}, categories: [...] }
        const cats = Array.isArray(r?.categories) ? r.categories
                   : Array.isArray(r)             ? r
                   : [];
        setCategories(cats);
        setGlobal(r?.global || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Commission fetch error:', err);
        setError('Failed to load commission settings.');
        setLoading(false);
      });
  }, []);

  const updateCat = async (id, field, value) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    await mockAPI.updateCommission(id, { [field]: value });
  };

  const updateGlobal = (field, value) => {
    setGlobal(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async () => {
    await mockAPI.saveCommissionSettings({ global, categories });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <LoadingSpinner center />;

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>⚠️ Error</div>
      <div>{error}</div>
    </div>
  );

  const avg = (field) => categories.length
    ? Math.round(categories.reduce((a, c) => a + (c[field] || 0), 0) / categories.length)
    : 0;

  const avgComm = avg('commission');

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="page-title">Commission Settings</h2>
          <p className="page-sub">Click any value to edit inline · Press Save All to persist</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSaveAll}>
          {saved ? '✓ Saved!' : <><Save size={14} /> Save All</>}
        </button>
      </div>

      {/* Summary Pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { l: 'Avg Commission',     n: avgComm + '%',                                              c: '#7c3aed', bg: '#f3e8ff' },
          { l: 'Highest Commission', n: Math.max(...categories.map(c => c.commission || 0)) + '%',  c: '#dc2626', bg: '#fee2e2' },
          { l: 'Lowest Commission',  n: Math.min(...categories.map(c => c.commission || 0)) + '%',  c: '#16a34a', bg: '#dcfce7' },
          { l: 'Categories',         n: categories.length,                                           c: '#2181c4', bg: '#dbeafe' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, color: s.c, padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 15 }}>{s.n}</span>{s.l}
          </div>
        ))}
      </div>

      {/* Global Platform Fees */}
      {global && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne,sans-serif' }}>🌐 Global Platform Fees</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Default fees applied platform-wide — click to edit</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, padding: 16 }}>
            {[
              { label: 'Contact Reveal', field: 'contactRevealFee', icon: '👁️' },
              { label: 'Boost (per day)', field: 'boostFee',        icon: '⚡' },
              { label: 'Featured',        field: 'featuredFee',     icon: '⭐' },
              { label: 'Gold Badge',      field: 'badgeGoldFee',    icon: '🥇' },
              { label: 'Silver Badge',    field: 'badgeSilverFee',  icon: '🥈' },
              { label: 'Bronze Badge',    field: 'badgeBronzeFee',  icon: '🥉' },
            ].map(f => (
              <GlobalFeeCard
                key={f.field}
                label={f.label}
                icon={f.icon}
                value={global[f.field] ?? 0}
                field={f.field}
                onSave={updateGlobal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Per-Category Commission Table */}
      <div className="card">
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px', gap: 8 }}>
          {['Category', 'Commission %', 'Contact Fee', 'Boost Fee', 'Min Order', 'Fee Cap', 'Status'].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>

        {categories.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No categories found</div>
        ) : categories.map(row => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{row.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{row.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/{row.slug}</div>
              </div>
            </div>
            <EditableCell value={row.commission} onSave={v => updateCat(row.id, 'commission', v)} suffix="%" />
            <EditableCell value={row.contactFee} onSave={v => updateCat(row.id, 'contactFee', v)} prefix="₹" />
            <EditableCell value={row.boostFee}   onSave={v => updateCat(row.id, 'boostFee',   v)} prefix="₹" />
            <EditableCell value={row.minOrder}   onSave={v => updateCat(row.id, 'minOrder',   v)} prefix="₹" />
            <EditableCell value={row.maxFeeCap}  onSave={v => updateCat(row.id, 'maxFeeCap',  v)} prefix="₹" />
            <span style={{
              background: row.status === 'active' ? '#dcfce7' : '#f1f5f9',
              color:      row.status === 'active' ? '#16a34a' : '#94a3b8',
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
            }}>
              {row.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}

        {/* Average Footer Row */}
        {categories.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '14px 20px', background: 'var(--primary-50)', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--primary-700)' }}>PLATFORM AVERAGE</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary-700)' }}>{avgComm}%</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary-700)' }}>₹{avg('contactFee')}</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary-700)' }}>₹{avg('boostFee')}</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary-700)' }}>₹{avg('minOrder')}</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary-700)' }}>₹{avg('maxFeeCap')}</div>
            <div />
          </div>
        )}
      </div>

      {/* How Fees Work */}
      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>💡 How Fees Work</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '💰', title: 'Commission %',  desc: 'Platform cut from each successful sale transaction' },
            { icon: '👁️', title: 'Contact Fee',   desc: 'Charged when buyer views seller phone/email' },
            { icon: '⚡', title: 'Boost Fee',      desc: 'Per-day fee to boost listing visibility in search' },
            { icon: '💎', title: 'Min Order',     desc: 'Minimum transaction value for commission to apply' },
            { icon: '🔒', title: 'Max Fee Cap',   desc: 'Maximum commission capped regardless of sale price' },
            { icon: '🏅', title: 'Badge Fees',    desc: 'One-time fee for Gold / Silver / Bronze seller badges' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

