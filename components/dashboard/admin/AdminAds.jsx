"use client";
// src/components/dashboard/admin/AdminAds.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Pause, Play, Eye, MousePointer, TrendingUp } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const POSITIONS = ['top', 'sidebar', 'inline'];
const STATUS_CFG = {
  active:    { label:'Active',    color:'#16a34a', bg:'#dcfce7' },
  paused:    { label:'Paused',    color:'#ca8a04', bg:'#fef9c3' },
  scheduled: { label:'Scheduled', color:'#2181c4', bg:'#dbeafe' },
  expired:   { label:'Expired',   color:'#94a3b8', bg:'#f1f5f9' },
};

function AdModal({ ad, onSave, onClose }) {
  const [form, setForm] = useState(ad || { title:'', image:'🖼️', position:'top', category:'All', city:'All', budget:1000, startDate:'', endDate:'', link:'', status:'scheduled' });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const ICONS = ['🖼️','📱','🚗','🏠','👗','⚽','💻','📺','🎮','💊','✈️','🍕'];

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', padding:28, width:'min(520px,94vw)', zIndex:301, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17 }}>{ad ? '✏️ Edit Ad' : '📢 Create New Ad'}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
        </div>

        {/* Banner image picker */}
        <div className="form-group">
          <label className="form-label">Banner Icon</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:4 }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => set('image', ic)}
                style={{ width:42, height:42, fontSize:22, border:`2px solid ${form.image===ic?'var(--primary-500)':'var(--border)'}`, borderRadius:'var(--radius-md)', background: form.image===ic?'var(--primary-50)':'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ad Title *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Summer Sale Banner"/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="form-group">
            <label className="form-label">Position</label>
            <select className="form-select" value={form.position} onChange={e => set('position', e.target.value)}>
              {POSITIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {['All','Electronics','Vehicles','Property','Fashion','Sports','Furniture','Books','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target City</label>
            <select className="form-select" value={form.city} onChange={e => set('city', e.target.value)}>
              {['All','Delhi','Mumbai','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Lucknow','Jaipur','Ahmedabad'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget (₹)</label>
            <input className="form-input" type="number" min="100" value={form.budget} onChange={e => set('budget', +e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}/>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Landing URL</label>
          <input className="form-input" type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://…"/>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" style={{ flex:1 }} disabled={!form.title} onClick={() => onSave(form)}>
            <Check size={14}/> {ad ? 'Save Changes' : 'Create Ad'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminAds() {
  const [ads,     setAds]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [busy,    setBusy]    = useState(null);

  useEffect(() => { mockAPI.getAds().then(a => { setAds(a); setLoading(false); }); }, []);

  const handleSave = async (form) => {
    setBusy('save');
    if (modal === 'add') {
      const newAd = await mockAPI.createAd(form);
      setAds(prev => [...prev, newAd]);
    } else {
      await mockAPI.updateAd(modal.id, form);
      setAds(prev => prev.map(a => a.id===modal.id ? {...a,...form} : a));
    }
    setBusy(null); setModal(null);
  };

  const handleToggle = async (id) => {
    await mockAPI.toggleAdStatus(id);
    setAds(prev => prev.map(a => a.id===id ? {...a, status: a.status==='active'?'paused':'active'} : a));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ad?')) return;
    await mockAPI.deleteAd(id);
    setAds(prev => prev.filter(a => a.id!==id));
  };

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
  const ctr = ad => ad.impressions ? ((ad.clicks/ad.impressions)*100).toFixed(2)+'%' : '—';

  if (loading) return <LoadingSpinner center/>;

  const totals = { budget: ads.reduce((a,b)=>a+b.budget,0), clicks: ads.reduce((a,b)=>a+b.clicks,0), impressions: ads.reduce((a,b)=>a+b.impressions,0) };

  return (
    <div>
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">Ads Management</h2>
          <p className="page-sub">{ads.length} ads configured</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}><Plus size={15}/> Create Ad</button>
      </div>

      {/* Summary pills */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Total Budget',    n: fmt(totals.budget),                             c:'#7c3aed', bg:'#f3e8ff' },
          { l:'Total Clicks',    n: totals.clicks.toLocaleString(),                 c:'#2181c4', bg:'#dbeafe' },
          { l:'Impressions',     n: (totals.impressions/1000).toFixed(1)+'K',       c:'#16a34a', bg:'#dcfce7' },
          { l:'Active Ads',      n: ads.filter(a=>a.status==='active').length,      c:'#16a34a', bg:'#dcfce7' },
          { l:'Paused',          n: ads.filter(a=>a.status==='paused').length,      c:'#ca8a04', bg:'#fef9c3' },
          { l:'Scheduled',       n: ads.filter(a=>a.status==='scheduled').length,   c:'#2181c4', bg:'#dbeafe' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, color:s.c, padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700, display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:15 }}>{s.n}</span>{s.l}
          </div>
        ))}
      </div>

      {/* Ads grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
        {ads.map(ad => {
          const sc = STATUS_CFG[ad.status] || STATUS_CFG.expired;
          return (
            <div key={ad.id} className="card" style={{ padding:0, overflow:'hidden' }}>
              {/* Ad banner preview */}
              <div style={{ background:`linear-gradient(135deg, var(--primary-700), var(--primary-500))`, padding:'20px 20px 16px', display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:42 }}>{ad.image}</span>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'white', lineHeight:1.3 }}>{ad.title}</div>
                  <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                    <span style={{ background:'rgba(255,255,255,0.2)', color:'white', padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700 }}>📍 {ad.position}</span>
                    <span style={{ background:'rgba(255,255,255,0.2)', color:'white', padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700 }}>🗂 {ad.category}</span>
                    <span style={{ background:'rgba(255,255,255,0.2)', color:'white', padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700 }}>🏙 {ad.city}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding:16 }}>
                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14, textAlign:'center' }}>
                  {[
                    { label:'Budget', value: fmt(ad.budget), icon:<TrendingUp size={13}/> },
                    { label:'Clicks', value: ad.clicks.toLocaleString(), icon:<MousePointer size={13}/> },
                    { label:'Views',  value: (ad.impressions/1000).toFixed(1)+'K', icon:<Eye size={13}/> },
                    { label:'CTR',    value: ctr(ad), icon:null },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'var(--bg-base)', borderRadius:'var(--radius-md)', padding:'8px 4px' }}>
                      <div style={{ fontSize:13, fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Dates + status */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{ad.startDate} → {ad.endDate}</div>
                  <span style={{ background:sc.bg, color:sc.color, padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>{sc.label}</span>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={() => setModal(ad)}>
                    <Pencil size={13}/> Edit
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={() => handleToggle(ad.id)}>
                    {ad.status==='active' ? <><Pause size={13}/> Pause</> : <><Play size={13}/> Activate</>}
                  </button>
                  <button className="btn btn-danger btn-sm" style={{ padding:'7px 10px' }} onClick={() => handleDelete(ad.id)}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && <AdModal ad={modal==='add'?null:modal} onSave={handleSave} onClose={() => setModal(null)}/>}
    </div>
  );
}

