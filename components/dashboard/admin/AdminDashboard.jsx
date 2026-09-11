"use client";
// src/components/dashboard/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingCart, TrendingUp, Eye, UserCheck,
  AlertTriangle, MessageSquare, ClipboardCheck, DollarSign,
  Activity, RefreshCw, ArrowUpRight, ArrowDownRight,
  Clock, Zap,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

function StatWidget({ icon, iconBg, iconColor, label, value, sub, trend, trendUp, alert }) {
  return (
    <div className="stat-widget" style={{ borderLeft: alert ? '3px solid #ef4444' : '3px solid transparent' }}>
      <div className="stat-widget-top">
        <div className="stat-widget-icon" style={{ background: iconBg }}>
          {React.cloneElement(icon, { size: 20, color: iconColor })}
        </div>
        {trend !== undefined && (
          <span className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            {trendUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
            {trend}%
          </span>
        )}
        {alert && <span className="stat-alert-dot" />}
      </div>
      <div className="stat-widget-value">{value}</div>
      <div className="stat-widget-label">{label}</div>
      {sub && <div className="stat-widget-sub">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">{title}</div>
          {subtitle && <div className="chart-card-sub">{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-row">
          <span style={{ color: p.color }}>■</span>
          <span>{p.name}:</span>
          <strong>{prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    const s = await mockAPI.getStats();
    setStats(s);
    setLoading(false);
    setRefreshing(false);
    setLastUpdate(new Date());
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingSpinner center />;

  const fmt  = n => '₹' + Number(n).toLocaleString('en-IN');
  const fmtK = n => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n;

  return (
    <div className="admin-dashboard">

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-sub" style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Clock size={12}/>
            Last updated: {lastUpdate.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span className="badge badge-blue" style={{ fontSize:12 }}>🛡 Super Admin</span>
          <button className="btn btn-secondary btn-sm" onClick={() => loadData(true)} disabled={refreshing}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}/>
            Refresh
          </button>
        </div>
      </div>

      {/* 12 Stat Widgets */}
      <div className="stat-widgets-grid">
        <StatWidget icon={<Users/>}          iconBg="#dbeafe" iconColor="#2563eb"
          label="Total Users"       value={fmtK(stats.totalUsers)}        trend={12} trendUp sub="All registered accounts" />
        <StatWidget icon={<Activity/>}       iconBg="#dcfce7" iconColor="#16a34a"
          label="Active Today"      value={stats.activeUsersToday}         trend={8}  trendUp sub="Unique sessions today" />
        <StatWidget icon={<Package/>}        iconBg="#fff7ed" iconColor="#ea580c"
          label="Total Listings"    value={fmtK(stats.totalListings)}                        sub="All time" />
        <StatWidget icon={<Zap/>}            iconBg="#dbeafe" iconColor="#2181c4"
          label="Active Listings"   value={fmtK(stats.activeListings)}     trend={5}  trendUp sub="Live on platform" />
        <StatWidget icon={<ClipboardCheck/>} iconBg="#fef9c3" iconColor="#ca8a04"
          label="Pending Listings"  value={stats.pendingListings}          alert={stats.pendingListings > 50} sub="Awaiting approval" />
        <StatWidget icon={<ShoppingCart/>}   iconBg="#dcfce7" iconColor="#16a34a"
          label="Sold Listings"     value={fmtK(stats.soldListings)}       trend={14} trendUp sub="Successfully sold" />
        <StatWidget icon={<TrendingUp/>}     iconBg="#f3e8ff" iconColor="#7c3aed"
          label="Total Revenue"     value={fmt(stats.totalRevenue)}        trend={18} trendUp sub="Platform earnings" />
        <StatWidget icon={<DollarSign/>}     iconBg="#dcfce7" iconColor="#16a34a"
          label="Today's Revenue"   value={fmt(stats.todayRevenue)}        trend={6}  trendUp sub="Since midnight" />
        <StatWidget icon={<Eye/>}            iconBg="#dbeafe" iconColor="#2181c4"
          label="Contact Reveals"   value={fmtK(stats.contactReveals)}                       sub="Paid contact views" />
        <StatWidget icon={<MessageSquare/>}  iconBg="#fff7ed" iconColor="#ea580c"
          label="Chats Today"       value={stats.chatsToday}               trend={3}  trendUp sub="Buyer-seller messages" />
        <StatWidget icon={<UserCheck/>}      iconBg="#fef9c3" iconColor="#ca8a04"
          label="Pending KYC"       value={stats.pendingKYC}               alert={stats.pendingKYC > 20} sub="ID verifications" />
        <StatWidget icon={<AlertTriangle/>}  iconBg="#fee2e2" iconColor="#dc2626"
          label="Reported Items"    value={stats.reportedItems}            alert={stats.reportedItems > 0} sub="Needs attention" />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row" style={{ marginTop: 24 }}>
        <ChartCard title="📈 Daily New Users" subtitle="Last 14 days"
          action={<span className="chart-badge chart-badge-blue">+{stats.dailyUsers.at(-1).users} today</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.dailyUsers} margin={{ top:8, right:16, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="users" name="New Users"
                stroke="#2181c4" strokeWidth={2.5} dot={false}
                activeDot={{ r:5, fill:'#2181c4', stroke:'white', strokeWidth:2 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="💰 Revenue Growth" subtitle="Last 7 months (₹)"
          action={<span className="chart-badge chart-badge-green">+18% vs last month</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyRevenue} margin={{ top:8, right:16, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}
                tickFormatter={v => '₹' + v/1000 + 'K'} />
              <Tooltip content={<CustomTooltip prefix="₹" />} />
              <Bar dataKey="revenue" name="Revenue" fill="#2181c4" radius={[5,5,0,0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row charts-row-40" style={{ marginTop: 20 }}>

        {/* Pie Chart */}
        <ChartCard title="🗂 Category Breakdown" subtitle="Listings by category">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={stats.categoryListings} cx="50%" cy="50%"
                  innerRadius={52} outerRadius={82}
                  dataKey="value" paddingAngle={3}>
                  {stats.categoryListings.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v.toLocaleString('en-IN') + ' listings']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
              {stats.categoryListings.map((cat, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ width:9, height:9, borderRadius:2, background:cat.color, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:'var(--text-secondary)', flex:1 }}>{cat.name}</span>
                  <span style={{ fontSize:11, fontWeight:700 }}>{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Area Chart — Ad Revenue */}
        <ChartCard title="📢 Ad Revenue" subtitle="CPC / CPM / CPA monthly"
          action={<span className="chart-badge chart-badge-purple">
            ₹{Object.values(stats.adRevenue.at(-1)).slice(1).reduce((a,b)=>a+b,0).toLocaleString()} this month
          </span>}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.adRevenue} margin={{ top:8, right:16, left:-10, bottom:0 }}>
              <defs>
                {[['cpc','#2181c4'],['cpm','#8b5cf6'],['cpa','#16a34a']].map(([k,c]) => (
                  <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}
                tickFormatter={v => '₹'+v} />
              <Tooltip content={<CustomTooltip prefix="₹" />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
              <Area type="monotone" dataKey="cpc" name="CPC" stroke="#2181c4" fill="url(#grad-cpc)" strokeWidth={2} />
              <Area type="monotone" dataKey="cpm" name="CPM" stroke="#8b5cf6" fill="url(#grad-cpm)" strokeWidth={2} />
              <Area type="monotone" dataKey="cpa" name="CPA" stroke="#16a34a" fill="url(#grad-cpa)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="charts-row charts-row-40" style={{ marginTop: 20 }}>

        {/* Activity Feed */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">🔔 Recent Activity</div>
              <div className="chart-card-sub">Live platform events</div>
            </div>
            <span className="chart-badge chart-badge-green" style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', display:'inline-block' }}/>Live
            </span>
          </div>
          <div className="activity-feed">
            {stats.recentActivity.map(act => (
              <div key={act.id} className="activity-row">
                <div className="activity-icon" style={{ background: act.color + '18', color: act.color }}>
                  {act.icon}
                </div>
                <div className="activity-text">{act.text}</div>
                <div className="activity-time">{act.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Quick Actions */}
          <div className="chart-card" style={{ flex:'none' }}>
            <div className="chart-card-header">
              <div className="chart-card-title">⚡ Quick Actions</div>
            </div>
            <div className="quick-actions-grid">
              {[
                { label:'Review KYC',       icon:'✅', count: stats.pendingKYC,      color:'#ca8a04', bg:'#fef9c3' },
                { label:'Approve Listings', icon:'📦', count: stats.pendingListings,  color:'#ea580c', bg:'#fff7ed' },
                { label:'View Reports',     icon:'🚩', count: stats.reportedItems,    color:'#dc2626', bg:'#fee2e2' },
                { label:'Manage Ads',       icon:'📢', count: null,                   color:'#2181c4', bg:'#dbeafe' },
                { label:'Revenue',          icon:'💰', count: null,                   color:'#7c3aed', bg:'#f3e8ff' },
                { label:'All Users',        icon:'👥', count: null,                   color:'#16a34a', bg:'#dcfce7' },
              ].map((a, i) => (
                <button key={i} className="quick-action-btn"
                  style={{ background: a.bg, color: a.color }}
                  onClick={() => {}}>
                  <span style={{ fontSize:20 }}>{a.icon}</span>
                  <span style={{ fontSize:11, fontWeight:700, textAlign:'center', lineHeight:1.3 }}>{a.label}</span>
                  {a.count !== null && (
                    <span style={{ background:a.color, color:'white', borderRadius:99, padding:'1px 7px', fontSize:10, fontWeight:800 }}>
                      {a.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Health */}
          <div className="chart-card" style={{ flex:1 }}>
            <div className="chart-card-header">
              <div className="chart-card-title">🏥 Platform Health</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, padding:'0 4px' }}>
              {[
                { label:'Listing Approval Rate', pct: Math.round((stats.activeListings/stats.totalListings)*100), color:'#16a34a' },
                { label:'User Engagement',        pct: Math.min(99, Math.round((stats.activeUsersToday/stats.totalUsers)*1000)), color:'#2181c4' },
                { label:'Order Completion',        pct: 84,                                                                        color:'#8b5cf6' },
                { label:'KYC Clearance',           pct: Math.round(((stats.totalUsers-stats.pendingKYC)/stats.totalUsers)*100),    color:'#ea580c' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:500 }}>{m.label}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:m.color }}>{m.pct}%</span>
                  </div>
                  <div style={{ height:7, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:m.pct+'%', background:m.color, borderRadius:99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

