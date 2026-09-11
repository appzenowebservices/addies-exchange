"use client";
// src/components/dashboard/admin/AdminRevenue.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, DollarSign, CreditCard, Download,
  RefreshCw, ChevronDown, ChevronUp, Search, X, Eye,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const TYPE_CFG = {
  commission: { label:'Commission',    color:'#2181c4', bg:'#dbeafe',  icon:'💼' },
  ad:         { label:'Ad Revenue',    color:'#7c3aed', bg:'#f3e8ff',  icon:'📢' },
  badge:      { label:'Badge Upgrade', color:'#ca8a04', bg:'#fef9c3',  icon:'🏅' },
  boost:      { label:'Boost Fee',     color:'#16a34a', bg:'#dcfce7',  icon:'🚀' },
  contact:    { label:'Contact Fee',   color:'#ea580c', bg:'#fff7ed',  icon:'📞' },
};
const STATUS_CFG = {
  completed: { label:'Completed', color:'#16a34a', bg:'#dcfce7' },
  pending:   { label:'Pending',   color:'#ca8a04', bg:'#fef9c3' },
  failed:    { label:'Failed',    color:'#dc2626', bg:'#fee2e2' },
  refunded:  { label:'Refunded',  color:'#6366f1', bg:'#eef2ff' },
};
const pill = s => ({ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:'nowrap' });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p,i) => (
        <div key={i} className="chart-tooltip-row">
          <span style={{ color:p.color }}>■</span>
          <span>{p.name}:</span>
          <strong>₹{Number(p.value).toLocaleString('en-IN')}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Transaction Detail Drawer ──────────────────────────────────────────────────
function TxDrawer({ tx, onClose }) {
  if (!tx) return null;
  const type   = TYPE_CFG[tx.type]   || TYPE_CFG.commission;
  const status = STATUS_CFG[tx.status] || STATUS_CFG.completed;
  const fmt    = n => '₹' + Number(n).toLocaleString('en-IN');

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(400px,95vw)', background:'white', zIndex:201, overflowY:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'22px 20px 16px', borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg,var(--primary-50),white)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:36, marginBottom:6 }}>{type.icon}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17 }}>{type.label}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:type.color, marginTop:4 }}>{fmt(tx.amount)}</div>
            <div style={{ marginTop:8 }}><span style={pill(status)}>{status.label}</span></div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}><X size={20}/></button>
        </div>

        <div style={{ padding:20 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Transaction ID', value: tx.id },
              { label:'User',           value: tx.userName },
              { label:'Email',          value: tx.email },
              { label:'Type',           value: type.label },
              { label:'Amount',         value: fmt(tx.amount) },
              { label:'Platform Fee',   value: fmt(Math.round(tx.amount * 0.1)) },
              { label:'Date',           value: tx.date },
              { label:'Method',         value: tx.method || 'UPI' },
              ...(tx.itemTitle ? [{ label:'Item', value: tx.itemTitle }] : []),
            ].map((f,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{f.label}</span>
                <span style={{ fontSize:13, fontWeight:700, maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminRevenue() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStat, setFilterStat] = useState('all');
  const [sort,       setSort]       = useState({ col:'date', dir:'desc' });
  const [selected,   setSelected]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('transactions');

  useEffect(() => {
    mockAPI.getRevenueData().then(d => { setData(d); setLoading(false); });
  }, []);

  const toggleSort = col => setSort(s => ({ col, dir: s.col===col && s.dir==='asc' ? 'desc' : 'asc' }));
  const SortIcon   = ({ col }) => sort.col === col ? (sort.dir==='asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>) : <ChevronDown size={12} style={{opacity:0.3}}/>;

  const filtered = useMemo(() => {
    if (!data) return [];
    let r = data.transactions;
    if (filterType !== 'all') r = r.filter(t => t.type === filterType);
    if (filterStat !== 'all') r = r.filter(t => t.status === filterStat);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(t => t.userName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    r = [...r].sort((a,b) => {
      let va = a[sort.col], vb = b[sort.col];
      if (sort.col === 'amount') { va = Number(va); vb = Number(vb); }
      if (va < vb) return sort.dir==='asc' ? -1 : 1;
      if (va > vb) return sort.dir==='asc' ? 1 : -1;
      return 0;
    });
    return r;
  }, [data, filterType, filterStat, search, sort]);

  if (loading) return <LoadingSpinner center />;

  const fmt  = n => '₹' + Number(n).toLocaleString('en-IN');
  const { stats, monthlyBreakdown, categoryRevenue, transactions } = data;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Revenue & Payments</h2>
          <p className="page-sub">Platform earnings, transactions & commission control</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); mockAPI.getRevenueData().then(d => { setData(d); setLoading(false); }); }}>
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total Revenue',    value: fmt(stats.totalRevenue),    icon:'💰', color:'#2181c4', bg:'#dbeafe', trend:'+18%' },
          { label:'This Month',       value: fmt(stats.monthRevenue),    icon:'📅', color:'#16a34a', bg:'#dcfce7', trend:'+6%'  },
          { label:'Today',            value: fmt(stats.todayRevenue),    icon:'⚡', color:'#ea580c', bg:'#fff7ed', trend:'+11%' },
          { label:'Pending Payouts',  value: fmt(stats.pendingPayouts),  icon:'⏳', color:'#ca8a04', bg:'#fef9c3'              },
          { label:'Total Txns',       value: stats.totalTxns,            icon:'🔄', color:'#7c3aed', bg:'#f3e8ff'              },
        ].map((s,i) => (
          <div key={i} className="stat-widget" style={{ borderLeft:`3px solid ${s.color}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{s.icon}</div>
              {s.trend && <span style={{ background:s.bg, color:s.color, fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:99 }}>{s.trend}</span>}
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:22 }}>
        {/* Monthly Revenue Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">📈 Monthly Revenue Breakdown</div>
              <div className="chart-card-sub">By revenue type — last 6 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyBreakdown} margin={{ top:8, right:16, left:-10, bottom:0 }}>
              <defs>
                {[['commission','#2181c4'],['ad','#8b5cf6'],['badge','#ca8a04'],['boost','#16a34a']].map(([k,c]) => (
                  <linearGradient key={k} id={`rg-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8"/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v=>'₹'+v/1000+'K'}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }}/>
              <Area type="monotone" dataKey="commission" name="Commission" stroke="#2181c4" fill="url(#rg-commission)" strokeWidth={2}/>
              <Area type="monotone" dataKey="ad"         name="Ad Revenue" stroke="#8b5cf6" fill="url(#rg-ad)"         strokeWidth={2}/>
              <Area type="monotone" dataKey="badge"      name="Badge"      stroke="#ca8a04" fill="url(#rg-badge)"      strokeWidth={2}/>
              <Area type="monotone" dataKey="boost"      name="Boost"      stroke="#16a34a" fill="url(#rg-boost)"      strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">🗂 By Category</div>
              <div className="chart-card-sub">Commission earned per category</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
            {categoryRevenue.map((cat,i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600 }}>{cat.name}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:cat.color }}>{fmt(cat.revenue)}</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:cat.pct+'%', background:cat.color, borderRadius:99 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {/* Tabs */}
        <div style={{ padding:'0 20px', borderBottom:'1px solid var(--border)', display:'flex', gap:0 }}>
          {[
            { val:'transactions', label:'💳 All Transactions' },
            { val:'commission',   label:'💼 Commission' },
            { val:'ad',           label:'📢 Ad Revenue' },
            { val:'badge',        label:'🏅 Badges' },
          ].map(t => (
            <button key={t.val} onClick={() => { setActiveTab(t.val); if (t.val !== 'transactions') setFilterType(t.val); else setFilterType('all'); }}
              style={{ padding:'13px 16px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:activeTab===t.val?800:500, fontSize:13, color:activeTab===t.val?'var(--primary-600)':'var(--text-muted)', borderBottom:activeTab===t.val?'2.5px solid var(--primary-500)':'2.5px solid transparent', whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card-header" style={{ flexWrap:'wrap', gap:10 }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <input className="form-input" placeholder="Search user, transaction ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:36 }}/>
            <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
            {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={13}/></button>}
          </div>
          <select className="form-select" style={{ width:'auto', fontSize:13 }} value={filterStat} onChange={e => setFilterStat(e.target.value)}>
            <option value="all">All Status</option>
            <option value="completed">✅ Completed</option>
            <option value="pending">⏳ Pending</option>
            <option value="failed">❌ Failed</option>
            <option value="refunded">↩️ Refunded</option>
          </select>
        </div>

        {/* Result count */}
        <div style={{ padding:'8px 20px', borderBottom:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)' }}>
          Showing <strong style={{ color:'var(--text-primary)' }}>{filtered.length}</strong> transactions
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Type</th>
                <th style={{cursor:'pointer'}} onClick={()=>toggleSort('amount')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Amount <SortIcon col="amount"/></span>
                </th>
                <th>Method</th>
                <th style={{cursor:'pointer'}} onClick={()=>toggleSort('date')}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}>Date <SortIcon col="date"/></span>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => {
                const type   = TYPE_CFG[tx.type]     || TYPE_CFG.commission;
                const status = STATUS_CFG[tx.status] || STATUS_CFG.completed;
                return (
                  <tr key={tx.id} style={{ cursor:'pointer' }} onClick={() => setSelected(tx)}>
                    <td style={{ fontFamily:'monospace', fontSize:11, color:'var(--text-muted)' }}>#{tx.id}</td>
                    <td>
                      <div style={{ fontWeight:700, fontSize:13 }}>{tx.userName}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{tx.email}</div>
                    </td>
                    <td>
                      <span style={{ background:type.bg, color:type.color, padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                        {type.icon} {type.label}
                      </span>
                    </td>
                    <td style={{ fontWeight:800, fontSize:13, color:'var(--primary-700)' }}>{fmt(tx.amount)}</td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{tx.method || 'UPI'}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{tx.date}</td>
                    <td><span style={pill(status)}>{status.label}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(tx)}><Eye size={13}/></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>💳</div>
                  <div style={{ fontWeight:600 }}>No transactions found</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TxDrawer tx={selected} onClose={() => setSelected(null)}/>
    </div>
  );
}

