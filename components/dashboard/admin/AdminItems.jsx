"use client";
// src/components/dashboard/admin/AdminItems.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Trash2, Eye, X, CheckCircle, XCircle,
  Star, ChevronDown, ChevronUp, RefreshCw, Download,
  AlertTriangle, MapPin, Clock, Filter,
} from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  active:   { label:'Active',   color:'#16a34a', bg:'#dcfce7' },
  pending:  { label:'Pending',  color:'#ca8a04', bg:'#fef9c3' },
  rejected: { label:'Rejected', color:'#dc2626', bg:'#fee2e2' },
  sold:     { label:'Sold',     color:'#7c3aed', bg:'#f3e8ff' },
};

// ── Reject Reason Modal ────────────────────────────────────────────────────────
function RejectModal({ item, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const REASONS = [
    'Prohibited item',
    'Misleading description',
    'Fake / counterfeit product',
    'Duplicate listing',
    'Inappropriate content',
    'Price manipulation',
    'Other',
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', padding:28, width:'min(440px,92vw)', zIndex:301, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, marginBottom:4 }}>❌ Reject Listing</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:18 }}>"{item?.title}"</div>

        <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Select Reason</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
          {REASONS.map(r => (
            <label key={r} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--radius-md)', border:`1.5px solid ${reason===r?'var(--primary-500)':'var(--border)'}`, background: reason===r?'var(--primary-50)':'white', cursor:'pointer', fontSize:13, fontWeight: reason===r?700:500 }}>
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

// ── Item Detail Drawer ─────────────────────────────────────────────────────────
function ItemDrawer({ item, onClose, onAction, actionBusy }) {
  if (!item) return null;
  const status = STATUS_CFG[item.status] || STATUS_CFG.active;
  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(400px,95vw)', background:'white', zIndex:201, overflowY:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg,var(--primary-50),white)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:36, marginBottom:8 }}>{item.image}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, lineHeight:1.3 }}>{item.title}</div>
            <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
              <span style={{ background:status.bg, color:status.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>{status.label}</span>
              {item.featured && <span style={{ background:'#fef9c3', color:'#ca8a04', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>⭐ Featured</span>}
              {item.reportCount > 0 && <span style={{ background:'#fee2e2', color:'#dc2626', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>🚩 {item.reportCount} Reports</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}><X size={20}/></button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:'1px solid var(--border)' }}>
          {[
            { label:'Price',   value: fmt(item.price),  icon:'💰' },
            { label:'Views',   value: item.views,        icon:'👁️' },
            { label:'Reports', value: item.reportCount,  icon:'🚩' },
          ].map((s,i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'14px 6px', textAlign:'center', borderRight: i<2?'1px solid var(--border)':'none' }}>
              <div style={{ fontSize:20 }}>{s.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14 }}>{s.value}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div style={{ padding:20, borderBottom:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { label:'Seller',    value: item.sellerName },
            { label:'Category',  value: item.category },
            { label:'Condition', value: item.condition },
            { label:'City',      value: item.city },
            { label:'Listed On', value: item.createdAt },
            { label:'Item ID',   value: item.id },
          ].map((f,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{f.label}</span>
              <span style={{ fontSize:13, fontWeight:600 }}>{f.value}</span>
            </div>
          ))}
          <div>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, marginBottom:6 }}>Description</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{item.description}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, marginBottom:4 }}>⚡ Admin Actions</div>

          {item.status === 'pending' && (
            <button className="btn btn-sm" style={{ background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0', justifyContent:'center' }}
              disabled={actionBusy===item.id+'_approve'}
              onClick={() => onAction(item.id, 'approve')}>
              {actionBusy===item.id+'_approve' ? <div className="spinner" style={{width:13,height:13}}/> : <><CheckCircle size={14}/> Approve Listing</>}
            </button>
          )}
          {item.status !== 'rejected' && (
            <button className="btn btn-danger btn-sm" style={{ justifyContent:'center' }}
              disabled={actionBusy===item.id+'_reject'}
              onClick={() => onAction(item.id, 'reject')}>
              {actionBusy===item.id+'_reject' ? <div className="spinner" style={{width:13,height:13}}/> : <><XCircle size={14}/> Reject Listing</>}
            </button>
          )}
          {item.status === 'rejected' && (
            <button className="btn btn-sm" style={{ background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0', justifyContent:'center' }}
              disabled={actionBusy===item.id+'_approve'}
              onClick={() => onAction(item.id, 'approve')}>
              {actionBusy===item.id+'_approve' ? <div className="spinner" style={{width:13,height:13}}/> : <><CheckCircle size={14}/> Re-Approve</>}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" style={{ justifyContent:'center' }}
            disabled={actionBusy===item.id+'_featured'}
            onClick={() => onAction(item.id, 'featured')}>
            {actionBusy===item.id+'_featured' ? <div className="spinner" style={{width:13,height:13}}/> : <><Star size={14}/> {item.featured ? 'Remove Featured' : 'Mark as Featured'}</>}
          </button>
          <button className="btn btn-danger btn-sm" style={{ justifyContent:'center' }}
            disabled={actionBusy===item.id+'_delete'}
            onClick={() => onAction(item.id, 'delete')}>
            {actionBusy===item.id+'_delete' ? <div className="spinner" style={{width:13,height:13}}/> : <><Trash2 size={14}/> Delete Listing</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminItems() {
  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionBusy,   setActionBusy]   = useState(null);
  const [sortBy,       setSortBy]       = useState('date');
  const [sortDir,      setSortDir]      = useState('desc');

  useEffect(() => {
    mockAPI.getAllItems().then(i => { setItems(i); setLoading(false); });
  }, []);

  const cats = useMemo(() => ['all', ...new Set(items.map(i => i.category))], [items]);

  const filtered = useMemo(() => {
    let r = [...items];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(i => i.title.toLowerCase().includes(q) || i.sellerName.toLowerCase().includes(q) || i.city.toLowerCase().includes(q));
    }
    if (category     !== 'all') r = r.filter(i => i.category === category);
    if (filterStatus !== 'all') {
      if (filterStatus === 'featured') r = r.filter(i => i.featured);
      else if (filterStatus === 'reported') r = r.filter(i => i.reportCount > 0);
      else r = r.filter(i => i.status === filterStatus);
    }
    r.sort((a, b) => {
      if (sortBy === 'price')   return sortDir==='asc' ? a.price-b.price : b.price-a.price;
      if (sortBy === 'views')   return sortDir==='asc' ? a.views-b.views : b.views-a.views;
      if (sortBy === 'reports') return sortDir==='asc' ? a.reportCount-b.reportCount : b.reportCount-a.reportCount;
      return sortDir==='asc' ? new Date(a.createdAt)-new Date(b.createdAt) : new Date(b.createdAt)-new Date(a.createdAt);
    });
    return r;
  }, [items, search, category, filterStatus, sortBy, sortDir]);

  const toggleSort = col => {
    if (sortBy===col) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };
  const SortIcon = ({ col }) => sortBy===col
    ? (sortDir==='asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)
    : <ChevronDown size={12} style={{opacity:0.25}}/>;

  const handleAction = async (id, action, extra) => {
    const key = id + '_' + action;
    if (action === 'reject' && !extra) { setRejectTarget(items.find(i => i.id===id)); return; }
    setActionBusy(key);

    if (action === 'approve') {
      await mockAPI.approveItem(id);
      const upd = i => i.id===id ? {...i, status:'active'} : i;
      setItems(prev => prev.map(upd));
      setSelectedItem(prev => prev?.id===id ? upd(prev) : prev);
    } else if (action === 'reject') {
      await mockAPI.rejectItem(id, extra);
      const upd = i => i.id===id ? {...i, status:'rejected', rejectReason:extra} : i;
      setItems(prev => prev.map(upd));
      setSelectedItem(prev => prev?.id===id ? upd(prev) : prev);
      setRejectTarget(null);
    } else if (action === 'featured') {
      await mockAPI.toggleFeatured(id);
      const upd = i => i.id===id ? {...i, featured:!i.featured} : i;
      setItems(prev => prev.map(upd));
      setSelectedItem(prev => prev?.id===id ? upd(prev) : prev);
    } else if (action === 'delete') {
      if (!confirm('Delete this listing permanently?')) { setActionBusy(null); return; }
      await mockAPI.deleteItem(id);
      setItems(prev => prev.filter(i => i.id!==id));
      setSelectedItem(null);
    }
    setActionBusy(null);
  };

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
  const activeFilters = [filterStatus, category].filter(f => f!=='all').length;

  if (loading) return <LoadingSpinner center />;

  // Summary counts
  const counts = {
    total:    items.length,
    active:   items.filter(i=>i.status==='active').length,
    pending:  items.filter(i=>i.status==='pending').length,
    rejected: items.filter(i=>i.status==='rejected').length,
    featured: items.filter(i=>i.featured).length,
    reported: items.filter(i=>i.reportCount>0).length,
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">Listings Management</h2>
          <p className="page-sub">{items.length} total listings on platform</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary btn-sm"><Download size={14}/> Export</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); mockAPI.getAllItems().then(i => { setItems(i); setLoading(false); }); }}>
            <RefreshCw size={14}/>
          </button>
        </div>
      </div>

      {/* Clickable Summary Pills */}
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Total',    n: counts.total,    c:'#2181c4', bg:'#dbeafe', key:'all'      },
          { l:'Active',   n: counts.active,   c:'#16a34a', bg:'#dcfce7', key:'active'   },
          { l:'Pending',  n: counts.pending,  c:'#ca8a04', bg:'#fef9c3', key:'pending'  },
          { l:'Rejected', n: counts.rejected, c:'#dc2626', bg:'#fee2e2', key:'rejected' },
          { l:'⭐ Featured',n: counts.featured,c:'#ca8a04', bg:'#fef9c3', key:'featured' },
          { l:'🚩 Reported',n: counts.reported,c:'#dc2626', bg:'#fee2e2', key:'reported' },
        ].map((s,i) => {
          const isActive = filterStatus === s.key;
          return (
            <button key={i} onClick={() => setFilterStatus(s.key)}
              style={{
                background: isActive ? s.c : s.bg,
                color:      isActive ? 'white' : s.c,
                padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700,
                border:`2px solid ${isActive ? s.c : 'transparent'}`,
                boxShadow: isActive ? `0 2px 10px ${s.c}44` : 'none',
                display:'flex', gap:6, alignItems:'center', cursor:'pointer',
                transition:'all 0.18s', fontFamily:'inherit',
              }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontSize:16 }}>{s.n}</span>{s.l}
            </button>
          );
        })}
      </div>

      <div className="card">
        {/* Search + Filters */}
        <div className="card-header" style={{ flexWrap:'wrap', gap:10 }}>
          <div style={{ position:'relative', flex:1, minWidth:220 }}>
            <input className="form-input" placeholder="Search title, seller, city…"
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:38 }}/>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
            {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={14}/></button>}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <select className="form-select" style={{ width:'auto', fontSize:13 }}
              value={category} onChange={e => setCategory(e.target.value)}>
              {cats.map(c => <option key={c} value={c}>{c==='all'?'All Categories':c}</option>)}
            </select>
            <select className="form-select" style={{ width:'auto', fontSize:13 }}
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="featured">⭐ Featured</option>
              <option value="reported">🚩 Reported</option>
            </select>
            {activeFilters > 0 && (
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--accent)', fontSize:12 }}
                onClick={() => { setFilterStatus('all'); setCategory('all'); }}>
                <X size={12}/> Clear ({activeFilters})
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div style={{ padding:'8px 20px', borderBottom:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)' }}>
          Showing <strong style={{ color:'var(--text-primary)' }}>{filtered.length}</strong> of {items.length} listings
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Seller</th>
                <th>Category</th>
                <th style={{cursor:'pointer'}} onClick={() => toggleSort('price')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Price <SortIcon col="price"/></span>
                </th>
                <th>City</th>
                <th style={{cursor:'pointer'}} onClick={() => toggleSort('views')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Views <SortIcon col="views"/></span>
                </th>
                <th style={{cursor:'pointer'}} onClick={() => toggleSort('reports')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Reports <SortIcon col="reports"/></span>
                </th>
                <th style={{cursor:'pointer'}} onClick={() => toggleSort('date')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Date <SortIcon col="date"/></span>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const status = STATUS_CFG[item.status] || STATUS_CFG.active;
                return (
                  <tr key={item.id} style={{ cursor:'pointer' }} onClick={() => setSelectedItem(item)}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:26, flexShrink:0 }}>{item.image}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, maxWidth:170, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                          <div style={{ display:'flex', gap:4, marginTop:3, flexWrap:'wrap' }}>
                            {item.featured && <span style={{ background:'#fef9c3', color:'#ca8a04', padding:'1px 6px', borderRadius:99, fontSize:10, fontWeight:700 }}>⭐ Featured</span>}
                            {item.reportCount > 0 && <span style={{ background:'#fee2e2', color:'#dc2626', padding:'1px 6px', borderRadius:99, fontSize:10, fontWeight:700 }}>🚩 {item.reportCount}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:13 }}>{item.sellerName}</td>
                    <td><span className="badge badge-blue" style={{fontSize:10}}>{item.category}</span></td>
                    <td style={{ fontWeight:700, color:'var(--primary-700)', fontSize:13, whiteSpace:'nowrap' }}>{fmt(item.price)}</td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:3 }}><MapPin size={11}/>{item.city}</span>
                    </td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{item.views}</td>
                    <td>
                      {item.reportCount > 0
                        ? <span style={{ background:'#fee2e2', color:'#dc2626', padding:'3px 8px', borderRadius:99, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4, width:'fit-content' }}>
                            <AlertTriangle size={11}/>{item.reportCount}
                          </span>
                        : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>
                      }
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{item.createdAt}</td>
                    <td><span style={{ background:status.bg, color:status.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>{status.label}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:5 }}>
                        {item.status === 'pending' && (
                          <>
                            <button className="btn btn-sm" title="Approve"
                              style={{ background:'#dcfce7', color:'#15803d', border:'1px solid #bbf7d0', padding:'4px 8px' }}
                              disabled={actionBusy===item.id+'_approve'}
                              onClick={() => handleAction(item.id, 'approve')}>
                              {actionBusy===item.id+'_approve' ? <div className="spinner" style={{width:12,height:12}}/> : <CheckCircle size={13}/>}
                            </button>
                            <button className="btn btn-danger btn-sm" title="Reject" style={{ padding:'4px 8px' }}
                              disabled={actionBusy===item.id+'_reject'}
                              onClick={() => handleAction(item.id, 'reject')}>
                              {actionBusy===item.id+'_reject' ? <div className="spinner" style={{width:12,height:12}}/> : <XCircle size={13}/>}
                            </button>
                          </>
                        )}
                        <button className="btn btn-ghost btn-sm" title={item.featured?'Remove Featured':'Mark Featured'}
                          onClick={() => handleAction(item.id, 'featured')}
                          disabled={actionBusy===item.id+'_featured'}
                          style={{ color: item.featured?'#ca8a04':'var(--text-muted)', padding:'4px 6px' }}>
                          {actionBusy===item.id+'_featured' ? <div className="spinner" style={{width:12,height:12}}/> : <Star size={13} fill={item.featured?'currentColor':'none'}/>}
                        </button>
                        <button className="btn btn-danger btn-sm" title="Delete" style={{ padding:'4px 8px' }}
                          disabled={actionBusy===item.id+'_delete'}
                          onClick={() => handleAction(item.id, 'delete')}>
                          {actionBusy===item.id+'_delete' ? <div className="spinner" style={{width:12,height:12}}/> : <Trash2 size={13}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
                  <div style={{ fontWeight:600 }}>No listings found</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Try different filters</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Drawer */}
      <ItemDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAction={handleAction}
        actionBusy={actionBusy}
      />

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <RejectModal
          item={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => handleAction(rejectTarget.id, 'reject', reason)}
        />
      )}
    </div>
  );
}

