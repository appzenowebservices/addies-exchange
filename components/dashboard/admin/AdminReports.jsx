"use client";
// src/components/dashboard/admin/AdminReports.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Eye, AlertTriangle, CheckCircle, XCircle, ShieldOff, RefreshCw, Clock } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const STATUS_CFG = {
  open:     { label:'Open',     color:'#dc2626', bg:'#fee2e2' },
  reviewed: { label:'Reviewed', color:'#ca8a04', bg:'#fef9c3' },
  resolved: { label:'Resolved', color:'#16a34a', bg:'#dcfce7' },
  dismissed:{ label:'Dismissed',color:'#6366f1', bg:'#eef2ff' },
};
const TYPE_CFG = {
  item: { label:'Item Report',  icon:'📦', color:'#ea580c', bg:'#fff7ed' },
  user: { label:'User Report',  icon:'👤', color:'#dc2626', bg:'#fee2e2' },
};
const pill = s => ({ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:'nowrap' });

// ── Report Detail Drawer ───────────────────────────────────────────────────────
function ReportDrawer({ report, onClose, onAction, busy }) {
  const [note, setNote] = useState('');
  if (!report) return null;
  const status = STATUS_CFG[report.status] || STATUS_CFG.open;
  const type   = TYPE_CFG[report.type]     || TYPE_CFG.item;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(440px,95vw)', background:'white', zIndex:201, overflowY:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'22px 20px 16px', borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg,#fff5f5,white)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:28 }}>{type.icon}</span>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16 }}>{type.label}</span>
            </div>
            <div style={{ fontFamily:'monospace', fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>#{report.id}</div>
            <div style={{ display:'flex', gap:6 }}>
              <span style={pill(status)}>{status.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}><X size={20}/></button>
        </div>

        {/* Report Details */}
        <div style={{ padding:20, borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>📋 Report Details</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'Reporter',      value: report.reporterName },
              { label:'Reporter Email',value: report.reporterEmail },
              ...(report.type === 'item'
                ? [{ label:'Reported Item', value: report.targetTitle }, { label:'Seller', value: report.sellerName }]
                : [{ label:'Reported User', value: report.targetTitle }, { label:'User Email', value: report.targetEmail || '—' }]
              ),
              { label:'Reason',        value: report.reason },
              { label:'Submitted',     value: report.date },
            ].map((f,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{f.label}</span>
                <span style={{ fontSize:13, fontWeight:600, maxWidth:'60%', textAlign:'right' }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence */}
        {report.evidence && (
          <div style={{ padding:20, borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>🖼️ Evidence</div>
            <div style={{ padding:14, background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', border:'1px dashed var(--border)', fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
              {report.evidence}
            </div>
          </div>
        )}

        {/* Admin Note */}
        <div style={{ padding:20, borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>📝 Admin Note</div>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Add a note before taking action…"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ resize:'none', fontSize:13 }}
          />
        </div>

        {/* Actions */}
        <div style={{ padding:20 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, marginBottom:14 }}>⚡ Take Action</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <button className="btn btn-sm" style={{ background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0', justifyContent:'center' }}
              disabled={busy} onClick={() => onAction(report.id, 'resolved', note)}>
              {busy === 'resolved_'+report.id ? <div className="spinner" style={{width:12,height:12}}/> : <><CheckCircle size={13}/> Mark Resolved</>}
            </button>
            <button className="btn btn-secondary btn-sm" style={{ justifyContent:'center' }}
              disabled={busy} onClick={() => onAction(report.id, 'reviewed', note)}>
              {busy === 'reviewed_'+report.id ? <div className="spinner" style={{width:12,height:12}}/> : <><Eye size={13}/> Under Review</>}
            </button>
            {report.type === 'item' && (
              <button className="btn btn-danger btn-sm" style={{ justifyContent:'center' }}
                disabled={busy} onClick={() => onAction(report.id, 'remove_item', note)}>
                {busy === 'remove_item_'+report.id ? <div className="spinner" style={{width:12,height:12}}/> : <><XCircle size={13}/> Remove Item</>}
              </button>
            )}
            {report.type === 'user' && (
              <button className="btn btn-danger btn-sm" style={{ justifyContent:'center' }}
                disabled={busy} onClick={() => onAction(report.id, 'ban_user', note)}>
                {busy === 'ban_user_'+report.id ? <div className="spinner" style={{width:12,height:12}}/> : <><ShieldOff size={13}/> Ban User</>}
              </button>
            )}
            <button className="btn btn-ghost btn-sm" style={{ justifyContent:'center', color:'var(--text-muted)' }}
              disabled={busy} onClick={() => onAction(report.id, 'dismissed', note)}>
              Dismiss Report
            </button>
          </div>

          {report.adminNote && (
            <div style={{ marginTop:16, padding:12, background:'#f8fafc', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:4 }}>PREVIOUS NOTE</div>
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{report.adminNote}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminReports() {
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('open');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [busy,     setBusy]     = useState(null);

  useEffect(() => {
    mockAPI.getReports().then(d => { setReports(d); setLoading(false); });
  }, []);

  const counts = useMemo(() => ({
    all:      reports.length,
    open:     reports.filter(r => r.status === 'open').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed:reports.filter(r => r.status === 'dismissed').length,
  }), [reports]);

  const filtered = useMemo(() => {
    let r = reports;
    if (filter !== 'all') r = r.filter(x => x.status === filter);
    if (typeFilter !== 'all') r = r.filter(x => x.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => x.reporterName.toLowerCase().includes(q) || x.targetTitle.toLowerCase().includes(q) || x.reason.toLowerCase().includes(q));
    }
    return r;
  }, [reports, filter, typeFilter, search]);

  const handleAction = async (id, action, note) => {
    setBusy(action + '_' + id);
    await mockAPI.updateReport(id, action, note);
    const newStatus = ['resolved','reviewed','dismissed'].includes(action) ? action : 'resolved';
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, adminNote: note || r.adminNote } : r));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus, adminNote: note || prev.adminNote }));
    setBusy(null);
  };

  if (loading) return <LoadingSpinner center />;

  const TABS = [
    { val:'open',      label:'🚨 Open',      count: counts.open,      color:'#dc2626' },
    { val:'reviewed',  label:'🔍 Reviewed',  count: counts.reviewed,  color:'#ca8a04' },
    { val:'resolved',  label:'✅ Resolved',  count: counts.resolved,  color:'#16a34a' },
    { val:'dismissed', label:'Dismissed',    count: counts.dismissed, color:'#6366f1' },
    { val:'all',       label:'All',          count: counts.all,       color:'var(--text-secondary)' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Complaints</h2>
          <p className="page-sub">Review flagged items and user complaints</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); mockAPI.getReports().then(d => { setReports(d); setLoading(false); }); }}>
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Open Reports',    value: counts.open,      icon:'🚨', color:'#dc2626', bg:'#fee2e2', alert: counts.open > 0 },
          { label:'Under Review',    value: counts.reviewed,  icon:'🔍', color:'#ca8a04', bg:'#fef9c3' },
          { label:'Resolved',        value: counts.resolved,  icon:'✅', color:'#16a34a', bg:'#dcfce7' },
          { label:'Total Reports',   value: counts.all,       icon:'📋', color:'#2181c4', bg:'#dbeafe' },
        ].map((s,i) => (
          <div key={i} className="stat-widget" style={{ borderLeft:`3px solid ${s.alert ? '#ef4444' : s.color}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ width:38, height:38, borderRadius:'var(--radius-md)', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
              {s.alert && <span style={{ background:'#fee2e2', color:'#dc2626', fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:99 }}>NEEDS ACTION</span>}
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Tabs */}
        <div style={{ padding:'0 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:0 }}>
            {TABS.map(t => (
              <button key={t.val} onClick={() => setFilter(t.val)}
                style={{ padding:'13px 15px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:filter===t.val?800:500, fontSize:13, color:filter===t.val?t.color:'var(--text-muted)', borderBottom:filter===t.val?`2.5px solid ${t.color}`:'2.5px solid transparent', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
                {t.label}
                <span style={{ background:filter===t.val?t.color:'var(--bg-secondary)', color:filter===t.val?'white':'var(--text-muted)', padding:'1px 7px', borderRadius:99, fontSize:10, fontWeight:800 }}>{t.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <select className="form-select" style={{ width:'auto', fontSize:13 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="item">📦 Item Reports</option>
              <option value="user">👤 User Reports</option>
            </select>
            <div style={{ position:'relative' }}>
              <input className="form-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:34, paddingTop:7, paddingBottom:7, width:180 }}/>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
              {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={12}/></button>}
            </div>
          </div>
        </div>

        {/* Count */}
        <div style={{ padding:'8px 20px', borderBottom:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)' }}>
          Showing <strong style={{ color:'var(--text-primary)' }}>{filtered.length}</strong> reports
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Target</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(report => {
                const status = STATUS_CFG[report.status] || STATUS_CFG.open;
                const type   = TYPE_CFG[report.type]     || TYPE_CFG.item;
                return (
                  <tr key={report.id} style={{ cursor:'pointer' }} onClick={() => setSelected(report)}>
                    <td style={{ fontFamily:'monospace', fontSize:11, color:'var(--text-muted)' }}>#{report.id}</td>
                    <td>
                      <span style={{ background:type.bg, color:type.color, padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                        {type.icon} {type.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:13 }}>{report.reporterName}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{report.reporterEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:13, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{report.targetTitle}</div>
                      {report.sellerName && <div style={{ fontSize:11, color:'var(--text-muted)' }}>by {report.sellerName}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize:12, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-secondary)' }}>
                        {report.reason}
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>{report.date}</span>
                    </td>
                    <td><span style={pill(status)}>{status.label}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:5 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(report)}><Eye size={13}/></button>
                        {report.status === 'open' && (
                          <button className="btn btn-sm" style={{ background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0', padding:'4px 8px' }}
                            disabled={busy === 'resolved_'+report.id}
                            onClick={() => handleAction(report.id, 'resolved', '')}>
                            {busy === 'resolved_'+report.id ? <div className="spinner" style={{width:11,height:11}}/> : <CheckCircle size={12}/>}
                          </button>
                        )}
                        {report.status === 'open' && (
                          <button className="btn btn-danger btn-sm" style={{ padding:'4px 8px' }}
                            disabled={busy === 'dismissed_'+report.id}
                            onClick={() => handleAction(report.id, 'dismissed', '')}>
                            {busy === 'dismissed_'+report.id ? <div className="spinner" style={{width:11,height:11}}/> : <XCircle size={12}/>}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🏳️</div>
                  <div style={{ fontWeight:600 }}>No reports found</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReportDrawer report={selected} onClose={() => setSelected(null)} onAction={handleAction} busy={busy}/>
    </div>
  );
}
