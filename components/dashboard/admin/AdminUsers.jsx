"use client";
// src/components/dashboard/admin/AdminUsers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Shield, ShieldOff, X, Eye,
  ChevronDown, ChevronUp, RefreshCw, Download,
  Clock, MapPin, KeyRound, UserX, UserCheck,
} from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

// ── Configs ────────────────────────────────────────────────────────────────────
const BADGE_CFG = {
  Gold:   { color:'#ca8a04', bg:'#fef9c3', icon:'🥇' },
  Silver: { color:'#64748b', bg:'#f1f5f9', icon:'🥈' },
  Bronze: { color:'#b45309', bg:'#fef3c7', icon:'🥉' },
};
const KYC_CFG = {
  verified: { label:'Verified',  color:'#16a34a', bg:'#dcfce7', icon:'✅' },
  pending:  { label:'Pending',   color:'#ca8a04', bg:'#fef9c3', icon:'⏳' },
  rejected: { label:'Rejected',  color:'#dc2626', bg:'#fee2e2', icon:'❌' },
  none:     { label:'Not Done',  color:'#94a3b8', bg:'#f1f5f9', icon:'—'  },
};
const STATUS_CFG = {
  active:    { label:'Active',    color:'#16a34a', bg:'#dcfce7' },
  suspended: { label:'Suspended', color:'#ca8a04', bg:'#fef9c3' },
  banned:    { label:'Banned',    color:'#dc2626', bg:'#fee2e2' },
};
const pill = s => ({ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 });

// ── User Detail Drawer ─────────────────────────────────────────────────────────
function UserDrawer({ user, onClose, onAction }) {
  const [busy, setBusy] = useState(null);
  if (!user) return null;
  const badge  = BADGE_CFG[user.badgeType];
  const kyc    = KYC_CFG[user.kycStatus]  || KYC_CFG.none;
  const status = STATUS_CFG[user.status]  || STATUS_CFG.active;
  const fmt    = n => '₹' + Number(n || 0).toLocaleString('en-IN');

  const act = async (key) => {
    setBusy(key);
    await onAction(user.id, key);
    setBusy(null);
  };

  const Spinner = () => <div className="spinner" style={{width:12,height:12}}/>;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(420px,95vw)', background:'white', zIndex:201, overflowY:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'24px 20px 16px', borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg,var(--primary-50),white)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="avatar avatar-lg" style={{ background:'linear-gradient(135deg,var(--primary-500),var(--primary-700))', color:'white', fontFamily:'Syne,sans-serif', fontWeight:800 }}>
              {user.avatar}
            </div>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17 }}>{user.name}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{user.email}</div>
              <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                <span style={pill(status)}>{status.label}</span>
                <span style={{ background:kyc.bg, color:kyc.color, padding:'3px 8px', borderRadius:99, fontSize:11, fontWeight:700 }}>{kyc.icon} {kyc.label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:6 }}>
            <X size={20}/>
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderBottom:'1px solid var(--border)' }}>
          {[
            { label:'Listings',    value: user.totalListings || 0,              icon:'📦' },
            { label:'Revenue',     value: fmt(user.totalRevenue),               icon:'💰' },
            { label:'Badge',       value: badge ? badge.icon + ' ' + user.badgeType : '—', icon:'🏅' },
            { label:'Last Active', value: user.lastActive || '—',               icon:'🕐' },
          ].map((s,i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'14px 6px', textAlign:'center', borderRight: i<3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize:18 }}>{s.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, lineHeight:1.2 }}>{s.value}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info fields */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:20, borderBottom:'1px solid var(--border)' }}>
          {[
            { label:'User ID',  value: user.id },
            { label:'Phone',    value: user.phone || '—' },
            { label:'City',     value: user.city  || '—' },
            { label:'Joined',   value: user.createdAt },
            { label:'Role',     value: [user.canBuy&&'Buyer', user.canSell&&'Seller'].filter(Boolean).join(' + ') || '—' },
            { label:'Mode',     value: user.mode || '—' },
          ].map((f,i) => (
            <div key={i}>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</div>
              <div style={{ fontSize:13, fontWeight:600, marginTop:3, wordBreak:'break-all' }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding:20, flex:1 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, marginBottom:14 }}>⚡ Admin Actions</div>

          {/* Badge upgrade */}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:6 }}>UPGRADE BADGE</div>
            <div style={{ display:'flex', gap:6 }}>
              {['Bronze','Silver','Gold'].map(b => (
                <button key={b} disabled={busy==='badge_'+b}
                  onClick={() => act('badge_'+b)}
                  style={{ flex:1, padding:'8px 4px', border:'1.5px solid', borderColor: user.badgeType===b ? BADGE_CFG[b].color : 'var(--border)', borderRadius:'var(--radius-md)', background: user.badgeType===b ? BADGE_CFG[b].bg : 'white', color: BADGE_CFG[b].color, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12 }}>
                  {busy==='badge_'+b ? <Spinner/> : BADGE_CFG[b].icon + ' ' + b}
                </button>
              ))}
              <button disabled={busy==='badge_null'} onClick={() => act('badge_null')}
                style={{ padding:'8px 10px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-md)', background:'white', cursor:'pointer', fontFamily:'inherit', color:'var(--text-muted)', fontSize:12, fontWeight:600 }}>
                {busy==='badge_null' ? <Spinner/> : '✕'}
              </button>
            </div>
          </div>

          {/* Status actions */}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:6 }}>ACCOUNT STATUS</div>
            <div style={{ display:'flex', gap:8 }}>
              {user.status !== 'active' && (
                <button className="btn btn-secondary btn-sm" style={{ flex:1 }} disabled={busy==='activate'} onClick={() => act('activate')}>
                  {busy==='activate' ? <Spinner/> : <><UserCheck size={13}/> Activate</>}
                </button>
              )}
              {user.status !== 'suspended' && (
                <button disabled={busy==='suspend'} onClick={() => act('suspend')}
                  style={{ flex:1, padding:'7px 12px', border:'1px solid #fde68a', borderRadius:'var(--radius-md)', background:'#fef9c3', color:'#92400e', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  {busy==='suspend' ? <Spinner/> : <><UserX size={13}/> Suspend</>}
                </button>
              )}
              {user.status !== 'banned' && (
                <button className="btn btn-danger btn-sm" style={{ flex:1 }} disabled={busy==='ban'} onClick={() => act('ban')}>
                  {busy==='ban' ? <Spinner/> : <><ShieldOff size={13}/> Ban</>}
                </button>
              )}
            </div>
          </div>

          {/* Reset password */}
          <button className="btn btn-secondary btn-sm" style={{ width:'100%', justifyContent:'center' }} disabled={busy==='reset_pwd'} onClick={() => act('reset_pwd')}>
            {busy==='reset_pwd' ? <Spinner/> : <><KeyRound size={13}/> Send Password Reset Email</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole,   setFilterRole]   = useState('all');
  const [filterKYC,    setFilterKYC]    = useState('all');
  const [filterBadge,  setFilterBadge]  = useState('all');
  const [sortBy,       setSortBy]       = useState('joined');
  const [sortDir,      setSortDir]      = useState('desc');

  useEffect(() => {
    mockAPI.getAllUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  const nonAdmins = useMemo(() => users.filter(u => u.role !== 'admin'), [users]);

  const filtered = useMemo(() => {
    let r = [...nonAdmins];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone||'').includes(q) || (u.city||'').toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') r = r.filter(u => u.status === filterStatus);
    if (filterKYC    !== 'all') r = r.filter(u => (u.kycStatus||'none') === filterKYC);
    if (filterBadge  !== 'all') r = filterBadge === 'none' ? r.filter(u => !u.badgeType) : r.filter(u => u.badgeType === filterBadge);
    if (filterRole === 'seller') r = r.filter(u => u.canSell);
    if (filterRole === 'buyer')  r = r.filter(u => u.canBuy && !u.canSell);

    r.sort((a, b) => {
      if (sortBy === 'revenue')  return sortDir==='asc' ? (a.totalRevenue||0)-(b.totalRevenue||0) : (b.totalRevenue||0)-(a.totalRevenue||0);
      if (sortBy === 'listings') return sortDir==='asc' ? (a.totalListings||0)-(b.totalListings||0) : (b.totalListings||0)-(a.totalListings||0);
      if (sortBy === 'name')     return sortDir==='asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      return sortDir==='asc' ? new Date(a.createdAt)-new Date(b.createdAt) : new Date(b.createdAt)-new Date(a.createdAt);
    });
    return r;
  }, [nonAdmins, search, filterStatus, filterKYC, filterBadge, filterRole, sortBy, sortDir]);

  const toggleSort = col => {
    if (sortBy === col) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };
  const SortIcon = ({ col }) => sortBy===col
    ? (sortDir==='asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)
    : <ChevronDown size={12} style={{opacity:0.25}}/>;

  const handleAction = async (userId, action) => {
    if (action.startsWith('badge_')) {
      const b = action.replace('badge_','');
      await mockAPI.updateUserBadge(userId, b==='null'?null:b);
      const upd = u => u.id===userId ? {...u, badgeType: b==='null'?null:b} : u;
      setUsers(prev => prev.map(upd));
      setSelectedUser(prev => prev?.id===userId ? upd(prev) : prev);
    } else if (['activate','suspend','ban'].includes(action)) {
      const sMap = {activate:'active', suspend:'suspended', ban:'banned'};
      await mockAPI.updateUserStatus(userId, sMap[action]);
      const upd = u => u.id===userId ? {...u, status: sMap[action]} : u;
      setUsers(prev => prev.map(upd));
      setSelectedUser(prev => prev?.id===userId ? upd(prev) : prev);
    } else if (action === 'reset_pwd') {
      await mockAPI.resetUserPassword(userId);
      alert('✅ Password reset link sent to user\'s email!');
    }
  };

  const activeFilters = [filterStatus, filterRole, filterKYC, filterBadge].filter(f => f!=='all').length;
  const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');

  if (loading) return <LoadingSpinner center />;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-sub">{nonAdmins.length} registered users</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary btn-sm"><Download size={14}/> Export CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); mockAPI.getAllUsers().then(u => { setUsers(u); setLoading(false); }); }}>
            <RefreshCw size={14}/>
          </button>
        </div>
      </div>

      {/* Summary pills — clickable filters */}
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Total',       n: nonAdmins.length,                                    c:'#2181c4', bg:'#dbeafe', activeBorder:'#2181c4', action:() => { setFilterStatus('all'); setFilterRole('all'); setFilterKYC('all'); setFilterBadge('all'); }, isActive: filterStatus==='all' && filterRole==='all' && filterKYC==='all' && filterBadge==='all' },
          { l:'Active',      n: nonAdmins.filter(u=>u.status==='active').length,     c:'#16a34a', bg:'#dcfce7', activeBorder:'#16a34a', action:() => { setFilterStatus('active');    setFilterRole('all'); setFilterKYC('all'); setFilterBadge('all'); }, isActive: filterStatus==='active'    },
          { l:'Suspended',   n: nonAdmins.filter(u=>u.status==='suspended').length,  c:'#ca8a04', bg:'#fef9c3', activeBorder:'#ca8a04', action:() => { setFilterStatus('suspended'); setFilterRole('all'); setFilterKYC('all'); setFilterBadge('all'); }, isActive: filterStatus==='suspended' },
          { l:'Banned',      n: nonAdmins.filter(u=>u.status==='banned').length,     c:'#dc2626', bg:'#fee2e2', activeBorder:'#dc2626', action:() => { setFilterStatus('banned');    setFilterRole('all'); setFilterKYC('all'); setFilterBadge('all'); }, isActive: filterStatus==='banned'    },
          { l:'Sellers',     n: nonAdmins.filter(u=>u.canSell).length,               c:'#7c3aed', bg:'#f3e8ff', activeBorder:'#7c3aed', action:() => { setFilterRole('seller');  setFilterStatus('all'); setFilterKYC('all'); setFilterBadge('all'); }, isActive: filterRole==='seller'      },
          { l:'Buyers Only', n: nonAdmins.filter(u=>u.canBuy && !u.canSell).length,  c:'#0891b2', bg:'#e0f2fe', activeBorder:'#0891b2', action:() => { setFilterRole('buyer');   setFilterStatus('all'); setFilterKYC('all'); setFilterBadge('all'); }, isActive: filterRole==='buyer'       },
          { l:'KYC Pending', n: nonAdmins.filter(u=>u.kycStatus==='pending').length, c:'#ea580c', bg:'#fff7ed', activeBorder:'#ea580c', action:() => { setFilterKYC('pending'); setFilterStatus('all'); setFilterRole('all'); setFilterBadge('all'); }, isActive: filterKYC==='pending'      },
          { l:'Gold Badge',  n: nonAdmins.filter(u=>u.badgeType==='Gold').length,    c:'#ca8a04', bg:'#fef9c3', activeBorder:'#ca8a04', action:() => { setFilterBadge('Gold');  setFilterStatus('all'); setFilterRole('all'); setFilterKYC('all');   }, isActive: filterBadge==='Gold'       },
        ].map((s,i) => (
          <button key={i} onClick={s.action}
            style={{
              background: s.isActive ? s.c : s.bg,
              color:       s.isActive ? 'white' : s.c,
              padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700,
              display:'flex', gap:6, alignItems:'center', cursor:'pointer',
              border: `2px solid ${s.isActive ? s.c : 'transparent'}`,
              boxShadow: s.isActive ? `0 2px 10px ${s.c}44` : 'none',
              transition:'all 0.18s', fontFamily:'inherit',
            }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:16 }}>{s.n}</span>{s.l}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Search + Filter bar */}
        <div className="card-header" style={{ flexWrap:'wrap', gap:10 }}>
          <div style={{ position:'relative', flex:1, minWidth:220 }}>
            <input className="form-input" placeholder="Search name, email, phone, city…"
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:38 }}/>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
            {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={14}/></button>}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            {[
              { val:filterStatus, set:setFilterStatus, opts:[['all','All Status'],['active','Active'],['suspended','Suspended'],['banned','Banned']] },
              { val:filterRole,   set:setFilterRole,   opts:[['all','All Roles'],['seller','Sellers'],['buyer','Buyers Only']] },
              { val:filterKYC,    set:setFilterKYC,    opts:[['all','All KYC'],['verified','✅ Verified'],['pending','⏳ Pending'],['rejected','❌ Rejected'],['none','Not Done']] },
              { val:filterBadge,  set:setFilterBadge,  opts:[['all','All Badges'],['Gold','🥇 Gold'],['Silver','🥈 Silver'],['Bronze','🥉 Bronze'],['none','No Badge']] },
            ].map((f,i) => (
              <select key={i} className="form-select" style={{ width:'auto', fontSize:13 }}
                value={f.val} onChange={e => f.set(e.target.value)}>
                {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
            {activeFilters > 0 && (
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--accent)', fontSize:12 }}
                onClick={() => { setFilterStatus('all'); setFilterRole('all'); setFilterKYC('all'); setFilterBadge('all'); }}>
                <X size={12}/> Clear ({activeFilters})
              </button>
            )}
          </div>
        </div>

        {/* Count bar */}
        <div style={{ padding:'8px 20px', borderBottom:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)' }}>
          Showing <strong style={{ color:'var(--text-primary)' }}>{filtered.length}</strong> of {nonAdmins.length} users
          {search && <> matching "<strong>{search}</strong>"</>}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>KYC</th>
                <th>Badge</th>
                <th style={{cursor:'pointer'}} onClick={() => toggleSort('listings')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Listings <SortIcon col="listings"/></span>
                </th>
                <th style={{cursor:'pointer'}} onClick={() => toggleSort('revenue')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Revenue <SortIcon col="revenue"/></span>
                </th>
                <th>Last Active</th>
                <th style={{cursor:'pointer'}} onClick={() => toggleSort('joined')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Joined <SortIcon col="joined"/></span>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const badge  = BADGE_CFG[u.badgeType];
                const kyc    = KYC_CFG[u.kycStatus]  || KYC_CFG.none;
                const status = STATUS_CFG[u.status]   || STATUS_CFG.active;
                return (
                  <tr key={u.id} style={{ cursor:'pointer' }} onClick={() => setSelectedUser(u)}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar avatar-sm" style={{ background:'linear-gradient(135deg,var(--primary-100),var(--primary-300))', color:'var(--primary-800)', fontWeight:800, flexShrink:0 }}>{u.avatar}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{u.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{u.email}</div>
                          {u.city && <div style={{ fontSize:10, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:2, marginTop:1 }}><MapPin size={9}/>{u.city}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {u.canBuy  && <span className="badge badge-blue"   style={{fontSize:10}}>🛒 Buyer</span>}
                        {u.canSell && <span className="badge badge-orange"  style={{fontSize:10}}>🏪 Seller</span>}
                      </div>
                    </td>
                    <td><span style={{ background:kyc.bg, color:kyc.color, padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>{kyc.icon} {kyc.label}</span></td>
                    <td>
                      {badge
                        ? <span style={{ background:badge.bg, color:badge.color, padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700 }}>{badge.icon} {u.badgeType}</span>
                        : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>}
                    </td>
                    <td style={{ fontWeight:700, fontSize:13 }}>{u.totalListings || 0}</td>
                    <td style={{ fontWeight:700, fontSize:13, color:'var(--primary-700)' }}>{u.totalRevenue ? fmt(u.totalRevenue) : '—'}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>{u.lastActive || '—'}</span>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{u.createdAt}</td>
                    <td><span style={pill(status)}>{status.label}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:5 }}>
                        <button className="btn btn-ghost btn-sm" title="View Details" onClick={() => setSelectedUser(u)}><Eye size={14}/></button>
                        <button
                          className={`btn btn-sm ${u.status==='active'?'btn-danger':'btn-secondary'}`}
                          title={u.status==='active'?'Ban':'Unban'}
                          onClick={() => handleAction(u.id, u.status==='active'?'ban':'activate')}
                          style={{ padding:'4px 8px' }}>
                          {u.status==='active' ? <ShieldOff size={13}/> : <Shield size={13}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
                  <div style={{ fontWeight:600 }}>No users found</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Try different search or filter</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onAction={handleAction}/>
    </div>
  );
}

