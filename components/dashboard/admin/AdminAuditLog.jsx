"use client";
// src/components/dashboard/admin/AdminAuditLog.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Shield, User, Package, Flag, DollarSign, Settings, MessageSquare, Tag, Bell } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const ACTION_CFG = {
  user_banned:        { label:'User Banned',          color:'#dc2626', bg:'#fee2e2', icon:<User size={13}/> },
  user_unbanned:      { label:'User Unbanned',        color:'#16a34a', bg:'#dcfce7', icon:<User size={13}/> },
  kyc_approved:       { label:'KYC Approved',         color:'#16a34a', bg:'#dcfce7', icon:<Shield size={13}/> },
  kyc_rejected:       { label:'KYC Rejected',         color:'#dc2626', bg:'#fee2e2', icon:<Shield size={13}/> },
  item_removed:       { label:'Item Removed',         color:'#dc2626', bg:'#fee2e2', icon:<Package size={13}/> },
  item_approved:      { label:'Item Approved',        color:'#16a34a', bg:'#dcfce7', icon:<Package size={13}/> },
  item_featured:      { label:'Item Featured',        color:'#7c3aed', bg:'#f3e8ff', icon:<Package size={13}/> },
  report_resolved:    { label:'Report Resolved',      color:'#16a34a', bg:'#dcfce7', icon:<Flag size={13}/> },
  report_dismissed:   { label:'Report Dismissed',     color:'#94a3b8', bg:'#f1f5f9', icon:<Flag size={13}/> },
  conv_flagged:       { label:'Chat Flagged',         color:'#dc2626', bg:'#fee2e2', icon:<MessageSquare size={13}/> },
  conv_blocked:       { label:'Chat Blocked',         color:'#7c3aed', bg:'#f3e8ff', icon:<MessageSquare size={13}/> },
  commission_updated: { label:'Commission Updated',   color:'#ca8a04', bg:'#fef9c3', icon:<DollarSign size={13}/> },
  category_added:     { label:'Category Added',       color:'#2181c4', bg:'#dbeafe', icon:<Tag size={13}/> },
  category_deleted:   { label:'Category Deleted',     color:'#dc2626', bg:'#fee2e2', icon:<Tag size={13}/> },
  settings_updated:   { label:'Settings Updated',     color:'#ca8a04', bg:'#fef9c3', icon:<Settings size={13}/> },
  notif_sent:         { label:'Notification Sent',    color:'#2181c4', bg:'#dbeafe', icon:<Bell size={13}/> },
  admin_login:        { label:'Admin Login',          color:'#16a34a', bg:'#dcfce7', icon:<Shield size={13}/> },
  admin_login_failed: { label:'Login Failed',         color:'#dc2626', bg:'#fee2e2', icon:<Shield size={13}/> },
  cms_updated:        { label:'Page Updated',         color:'#7c3aed', bg:'#f3e8ff', icon:<Settings size={13}/> },
};

const MODULES = ['all','users','kyc','items','reports','chat','commission','categories','settings','notifications','cms','auth'];

export default function AdminAuditLog() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [module,  setModule]  = useState('all');
  const [dateFrom,setDateFrom]= useState('');
  const [dateTo,  setDateTo]  = useState('');
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    mockAPI.getAuditLogs().then(l => { setLogs(l); setLoading(false); });
  }, []);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.action.includes(q) || l.adminName.toLowerCase().includes(q) || l.target?.toLowerCase().includes(q) || l.detail?.toLowerCase().includes(q);
    const matchModule = module === 'all' || l.module === module;
    const matchFrom = !dateFrom || l.timestamp >= dateFrom;
    const matchTo   = !dateTo   || l.timestamp <= dateTo + ' 23:59';
    return matchSearch && matchModule && matchFrom && matchTo;
  });

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleExport = () => {
    const csv = [
      ['Timestamp','Admin','Action','Module','Target','Detail','IP'],
      ...filtered.map(l => [l.timestamp, l.adminName, l.action, l.module, l.target||'', l.detail||'', l.ip||''])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit_log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner center/>;

  const countByModule = (m) => logs.filter(l => l.module === m).length;

  return (
    <div>
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">Logs & Audit Trail</h2>
          <p className="page-sub">{logs.length} total actions recorded</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleExport}>
          <Download size={14}/> Export CSV
        </button>
      </div>

      {/* Summary pills */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Total Actions',  n: logs.length,                                  c:'#2181c4', bg:'#dbeafe' },
          { l:'Today',         n: logs.filter(l=>l.timestamp.startsWith(new Date().toISOString().split('T')[0])).length, c:'#7c3aed', bg:'#f3e8ff' },
          { l:'User Actions',  n: countByModule('users'),                        c:'#ca8a04', bg:'#fef9c3' },
          { l:'KYC Actions',   n: countByModule('kyc'),                          c:'#16a34a', bg:'#dcfce7' },
          { l:'Failed Logins', n: logs.filter(l=>l.action==='admin_login_failed').length, c:'#dc2626', bg:'#fee2e2' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, color:s.c, padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700, display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:15 }}>{s.n}</span>{s.l}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="form-input" placeholder="Search admin, action, target..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft:34 }}/>
        </div>
        <select className="form-select" value={module} onChange={e => { setModule(e.target.value); setPage(1); }} style={{ width:'auto', minWidth:140 }}>
          {MODULES.map(m => <option key={m} value={m}>{m === 'all' ? 'All Modules' : m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
        </select>
        <input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width:'auto' }} title="From date"/>
        <input className="form-input" type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   style={{ width:'auto' }} title="To date"/>
        {(search||module!=='all'||dateFrom||dateTo) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setModule('all'); setDateFrom(''); setDateTo(''); setPage(1); }} style={{ color:'#dc2626' }}>Clear</button>
        )}
      </div>

      {/* Log Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Module</th>
                <th>Target</th>
                <th>Detail</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(log => {
                const cfg = ACTION_CFG[log.action] || { label: log.action, color:'#64748b', bg:'#f1f5f9', icon:null };
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize:11, fontFamily:'monospace', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{log.timestamp}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ width:28, height:28, borderRadius:50, background:'var(--primary-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'var(--primary-700)', flexShrink:0 }}>
                          {log.adminName.split(' ').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600 }}>{log.adminName}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ background:cfg.bg, color:cfg.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
                        {cfg.icon}{cfg.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ background:'var(--bg-base)', border:'1px solid var(--border)', padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'capitalize' }}>
                        {log.module}
                      </span>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {log.target || '—'}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {log.detail || '—'}
                    </td>
                    <td style={{ fontSize:11, fontFamily:'monospace', color:'var(--text-muted)' }}>{log.ip || '—'}</td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>
              Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
              {Array.from({length: Math.min(totalPages,5)}, (_,i) => {
                const p = page <= 3 ? i+1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} className="btn btn-ghost btn-sm" onClick={() => setPage(p)}
                    style={{ background: page===p?'var(--primary-50)':'', color: page===p?'var(--primary-700)':'', fontWeight: page===p?800:400, minWidth:32 }}>
                    {p}
                  </button>
                );
              })}
              <button className="btn btn-ghost btn-sm" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

