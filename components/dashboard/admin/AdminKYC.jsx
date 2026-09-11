"use client";
// src/components/dashboard/admin/AdminKYC.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, CheckCircle, XCircle, Eye, Clock, Download, RefreshCw } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const STATUS_CFG = {
  pending:  { label:'Pending',  color:'#ca8a04', bg:'#fef9c3' },
  approved: { label:'Approved', color:'#16a34a', bg:'#dcfce7' },
  rejected: { label:'Rejected', color:'#dc2626', bg:'#fee2e2' },
};
const pill = s => ({ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:'nowrap' });

// ── Reject Reason Modal ────────────────────────────────────────────────────────
function RejectModal({ kyc, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const REASONS = [
    'Document unclear / blurry',
    'ID expired',
    'Name mismatch',
    'Fake / forged document',
    'Selfie does not match ID',
    'Incomplete submission',
    'Other',
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', padding:28, width:'min(440px,92vw)', zIndex:301, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, marginBottom:4 }}>❌ Reject KYC</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:18 }}>User: <strong>{kyc?.userName}</strong></div>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Rejection Reason</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
          {REASONS.map(r => (
            <label key={r} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--radius-md)', border:`1.5px solid ${reason===r?'var(--primary-500)':'var(--border)'}`, background:reason===r?'var(--primary-50)':'white', cursor:'pointer', fontSize:13, fontWeight:reason===r?700:500 }}>
              <input type="radio" name="reason" value={r} checked={reason===r} onChange={() => setReason(r)} style={{ accentColor:'var(--primary-500)' }}/>
              {r}
            </label>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm" style={{ flex:1 }} disabled={!reason} onClick={() => onConfirm(reason)}>
            <XCircle size={14}/> Confirm Reject
          </button>
        </div>
      </div>
    </>
  );
}

// ── KYC Detail Drawer ──────────────────────────────────────────────────────────
function KYCDrawer({ kyc, onClose, onApprove, onReject, busy }) {
  if (!kyc) return null;
  const status = STATUS_CFG[kyc.status] || STATUS_CFG.pending;
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(440px,95vw)', background:'white', zIndex:201, overflowY:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'22px 20px 16px', borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg,var(--primary-50),white)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17 }}>{kyc.userName}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{kyc.email}</div>
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              <span style={pill(status)}>{status.label}</span>
              <span style={{ background:'#eff6ff', color:'#2563eb', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>{kyc.idType}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}><X size={20}/></button>
        </div>

        {/* ID Info */}
        <div style={{ padding:20, borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>📄 Document Details</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { label:'ID Type',        value: kyc.idType },
              { label:'ID Number',      value: kyc.idNumber },
              { label:'Full Name (ID)', value: kyc.nameOnId },
              { label:'Date of Birth',  value: kyc.dob },
              { label:'User ID',        value: kyc.userId },
              { label:'Submitted',      value: kyc.submittedDate },
            ].map((f,i) => (
              <div key={i}>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</div>
                <div style={{ fontSize:13, fontWeight:600, marginTop:3 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Preview (Mock) */}
        <div style={{ padding:20, borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>🖼️ Uploaded Documents</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {kyc.documents.map((doc, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:28 }}>{doc.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{doc.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{doc.size} · {doc.type}</div>
                </div>
                <button style={{ background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:600, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5 }}>
                  <Eye size={12}/> View
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rejection Note */}
        {kyc.rejectReason && (
          <div style={{ margin:'16px 20px 0', padding:14, background:'#fee2e2', borderRadius:'var(--radius-md)', border:'1px solid #fca5a5' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#dc2626', marginBottom:4 }}>❌ Rejection Reason</div>
            <div style={{ fontSize:13, color:'#7f1d1d' }}>{kyc.rejectReason}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding:20, flex:1 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, marginBottom:14 }}>⚡ Admin Actions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {kyc.status !== 'approved' && (
              <button className="btn btn-sm" style={{ background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0', justifyContent:'center' }}
                disabled={busy} onClick={() => onApprove(kyc.id)}>
                {busy === 'approve_'+kyc.id ? <div className="spinner" style={{width:13,height:13}}/> : <><CheckCircle size={14}/> Approve KYC</>}
              </button>
            )}
            {kyc.status !== 'rejected' && (
              <button className="btn btn-danger btn-sm" style={{ justifyContent:'center' }}
                disabled={busy} onClick={() => onReject(kyc)}>
                {busy === 'reject_'+kyc.id ? <div className="spinner" style={{width:13,height:13}}/> : <><XCircle size={14}/> Reject KYC</>}
              </button>
            )}
            {kyc.status !== 'pending' && (
              <button className="btn btn-secondary btn-sm" style={{ justifyContent:'center' }}
                disabled={busy} onClick={() => onApprove(kyc.id, 'reset')}>
                <RefreshCw size={13}/> Reset to Pending
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminKYC() {
  const [kycList,  setKycList]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [busy,     setBusy]     = useState(null);

  useEffect(() => {
    mockAPI.getKYCSubmissions().then(data => { setKycList(data); setLoading(false); });
  }, []);

  const counts = useMemo(() => ({
    all:      kycList.length,
    pending:  kycList.filter(k => k.status === 'pending').length,
    approved: kycList.filter(k => k.status === 'approved').length,
    rejected: kycList.filter(k => k.status === 'rejected').length,
  }), [kycList]);

  const filtered = useMemo(() => {
    let r = kycList;
    if (filter !== 'all') r = r.filter(k => k.status === filter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(k => k.userName.toLowerCase().includes(q) || k.email.toLowerCase().includes(q) || k.idNumber.toLowerCase().includes(q));
    }
    return r;
  }, [kycList, filter, search]);

  const handleApprove = async (id, mode = 'approve') => {
    setBusy((mode === 'approve' ? 'approve_' : 'reset_') + id);
    await mockAPI.approveKYC(id, mode === 'approve' ? 'approved' : 'pending');
    setKycList(prev => prev.map(k => k.id === id ? { ...k, status: mode === 'approve' ? 'approved' : 'pending', rejectReason: null } : k));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: mode === 'approve' ? 'approved' : 'pending', rejectReason: null }));
    setBusy(null);
  };

  const handleReject = async (reason) => {
    const id = rejectTarget.id;
    setBusy('reject_' + id);
    await mockAPI.rejectKYC(id, reason);
    setKycList(prev => prev.map(k => k.id === id ? { ...k, status: 'rejected', rejectReason: reason } : k));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'rejected', rejectReason: reason }));
    setRejectTarget(null);
    setBusy(null);
  };

  if (loading) return <LoadingSpinner center />;

  const TABS = [
    { val:'pending',  label:'⏳ Pending',  count: counts.pending,  color:'#ca8a04' },
    { val:'approved', label:'✅ Approved', count: counts.approved, color:'#16a34a' },
    { val:'rejected', label:'❌ Rejected', count: counts.rejected, color:'#dc2626' },
    { val:'all',      label:'All',         count: counts.all,      color:'var(--text-secondary)' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">KYC & Verification</h2>
          <p className="page-sub">Review and approve user identity documents</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); mockAPI.getKYCSubmissions().then(d => { setKycList(d); setLoading(false); }); }}>
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total KYC',  value: counts.all,      icon:'📋', color:'#2181c4', bg:'#dbeafe' },
          { label:'Pending',    value: counts.pending,  icon:'⏳', color:'#ca8a04', bg:'#fef9c3', alert: counts.pending > 10 },
          { label:'Approved',   value: counts.approved, icon:'✅', color:'#16a34a', bg:'#dcfce7' },
          { label:'Rejected',   value: counts.rejected, icon:'❌', color:'#dc2626', bg:'#fee2e2' },
        ].map((s,i) => (
          <div key={i} className="stat-widget" style={{ borderLeft:`3px solid ${s.alert ? '#ef4444' : s.color}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ width:38, height:38, borderRadius:'var(--radius-md)', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
              {s.alert && <span style={{ background:'#fee2e2', color:'#dc2626', fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:99 }}>URGENT</span>}
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Tabs + Search */}
        <div style={{ padding:'0 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:0 }}>
            {TABS.map(t => (
              <button key={t.val} onClick={() => setFilter(t.val)}
                style={{ padding:'13px 16px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', fontWeight: filter===t.val ? 800 : 500, fontSize:13, color: filter===t.val ? t.color : 'var(--text-muted)', borderBottom: filter===t.val ? `2.5px solid ${t.color}` : '2.5px solid transparent', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
                {t.label}
                <span style={{ background: filter===t.val ? t.color : 'var(--bg-secondary)', color: filter===t.val ? 'white' : 'var(--text-muted)', padding:'1px 7px', borderRadius:99, fontSize:10, fontWeight:800 }}>{t.count}</span>
              </button>
            ))}
          </div>
          <div style={{ position:'relative', minWidth:220 }}>
            <input className="form-input" placeholder="Search name, email, ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:36, paddingTop:8, paddingBottom:8 }}/>
            <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
            {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={13}/></button>}
          </div>
        </div>

        {/* Count bar */}
        <div style={{ padding:'8px 20px', borderBottom:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)' }}>
          Showing <strong style={{ color:'var(--text-primary)' }}>{filtered.length}</strong> submissions
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>ID Type</th>
                <th>ID Number</th>
                <th>Docs</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(kyc => {
                const st = STATUS_CFG[kyc.status] || STATUS_CFG.pending;
                return (
                  <tr key={kyc.id} style={{ cursor:'pointer' }} onClick={() => setSelected(kyc)}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,var(--primary-100),var(--primary-300))', color:'var(--primary-800)', fontWeight:800, flexShrink:0 }}>
                          {kyc.userName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{kyc.userName}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{kyc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue" style={{fontSize:10}}>{kyc.idType}</span></td>
                    <td style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-secondary)' }}>{kyc.idNumber}</td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        {kyc.documents.map((d,i) => (
                          <span key={i} title={d.label} style={{ fontSize:18 }}>{d.icon}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>{kyc.submittedDate}</span>
                    </td>
                    <td><span style={pill(st)}>{st.label}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" title="View Details" onClick={() => setSelected(kyc)}><Eye size={13}/></button>
                        {kyc.status === 'pending' && (
                          <>
                            <button className="btn btn-sm" title="Approve" style={{ background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0', padding:'4px 8px' }}
                              disabled={busy === 'approve_'+kyc.id}
                              onClick={() => handleApprove(kyc.id)}>
                              {busy === 'approve_'+kyc.id ? <div className="spinner" style={{width:12,height:12}}/> : <CheckCircle size={13}/>}
                            </button>
                            <button className="btn btn-danger btn-sm" title="Reject" style={{ padding:'4px 8px' }}
                              disabled={busy === 'reject_'+kyc.id}
                              onClick={() => setRejectTarget(kyc)}>
                              {busy === 'reject_'+kyc.id ? <div className="spinner" style={{width:12,height:12}}/> : <XCircle size={13}/>}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🪪</div>
                  <div style={{ fontWeight:600 }}>No KYC submissions found</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <KYCDrawer
        kyc={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={(kyc) => setRejectTarget(kyc)}
        busy={busy}
      />

      {rejectTarget && (
        <RejectModal
          kyc={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}

