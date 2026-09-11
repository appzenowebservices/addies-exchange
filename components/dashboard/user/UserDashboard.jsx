"use client";
// src/components/dashboard/user/UserDashboard.jsx
// Location: C:\xampp\htdocs\addies-exchange\src\components\dashboard\user\UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, Eye, TrendingUp, Plus,
  Star, Clock, MessageSquare, Heart, Bell,
  ArrowUpRight, ArrowDownLeft, Zap, Target,
  BarChart2, Tag, CheckCircle, AlertCircle, Flame,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockAPI } from '../../../server/trpcClient';
import ModeSwitch     from '../../shared/ModeSwitch';
import LoadingSpinner from '../../shared/LoadingSpinner';

// ─── Inject CSS once ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

.dash-fade-in { animation: dashFadeIn 0.45s ease both; }
@keyframes dashFadeIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }

.dash-stat-card {
  border-radius: 16px; padding: 22px; position: relative; overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: dashFadeIn 0.45s ease both;
}
.dash-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
.dash-stat-card .deco {
  position:absolute; right:-18px; bottom:-18px; width:80px; height:80px;
  border-radius:50%; opacity:0.12;
}

/* Seller theme — deep ocean */
.seller-hero {
  background: linear-gradient(135deg, #0f2942 0%, #1a4a72 60%, #0e3a5e 100%);
  border-radius: 20px; padding: 32px; color: white; position: relative; overflow: hidden;
  margin-bottom: 24px;
}
.seller-hero::before {
  content:''; position:absolute; top:-60px; right:-60px;
  width:220px; height:220px; border-radius:50%;
  background: radial-gradient(circle, rgba(59,158,221,0.3) 0%, transparent 70%);
}
.seller-hero::after {
  content:''; position:absolute; bottom:-40px; left:30%;
  width:160px; height:160px; border-radius:50%;
  background: radial-gradient(circle, rgba(255,165,0,0.15) 0%, transparent 70%);
}

/* Buyer theme — warm coral */
.buyer-hero {
  background: linear-gradient(135deg, #3d0f1a 0%, #7c2533 60%, #5c1a25 100%);
  border-radius: 20px; padding: 32px; color: white; position: relative; overflow: hidden;
  margin-bottom: 24px;
}
.buyer-hero::before {
  content:''; position:absolute; top:-60px; right:-60px;
  width:220px; height:220px; border-radius:50%;
  background: radial-gradient(circle, rgba(248,113,113,0.3) 0%, transparent 70%);
}
.buyer-hero::after {
  content:''; position:absolute; bottom:-40px; left:40%;
  width:140px; height:140px; border-radius:50%;
  background: radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%);
}

.hero-badge {
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2);
  border-radius:99px; padding:5px 14px; font-size:12px; font-weight:700;
  backdrop-filter:blur(4px); margin-bottom:12px;
}
.hero-title { font-family:'Roboto',sans-serif; font-size:28px; font-weight:900; margin:0 0 6px; line-height:1.2; }
.hero-sub   { font-size:13px; opacity:0.7; margin:0 0 24px; }

.hero-stats { display:flex; gap:24px; flex-wrap:wrap; }
.hero-stat  { display:flex; flex-direction:column; gap:2px; }
.hero-stat-val { font-family:'Roboto',sans-serif; font-size:24px; font-weight:900; line-height:1; }
.hero-stat-lbl { font-size:11px; opacity:0.6; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }

.dash-section-title {
  font-family:'Roboto',sans-serif; font-size:15px; font-weight:800;
  color: var(--text-primary); margin:0 0 14px; display:flex; align-items:center; gap:8px;
}

.listing-row {
  display:flex; align-items:center; gap:12px;
  padding:12px 20px; border-bottom:1px solid var(--border);
  transition:background 0.15s;
}
.listing-row:last-child { border-bottom:none; }
.listing-row:hover { background:var(--primary-50); }

.order-row {
  display:flex; align-items:center; gap:12px;
  padding:12px 20px; border-bottom:1px solid var(--border);
  transition:background 0.15s;
}
.order-row:last-child { border-bottom:none; }
.order-row:hover { background:#fff5f5; }

.quick-action {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:8px; padding:18px 10px; border-radius:14px; border:2px dashed;
  cursor:pointer; transition:all 0.2s; text-align:center; background:white;
  font-family:'Roboto',sans-serif; font-size:12px; font-weight:700;
}
.quick-action:hover { transform:translateY(-2px); }

.perf-bar-wrap { display:flex; flex-direction:column; gap:10px; }
.perf-bar { background:#f1f5f9; border-radius:99px; height:8px; overflow:hidden; }
.perf-fill { height:100%; border-radius:99px; transition:width 0.8s cubic-bezier(0.4,0,0.2,1); }

.notif-dot {
  width:8px; height:8px; border-radius:50%; background:#ef4444; flex-shrink:0;
}
.notif-item { display:flex; align-items:flex-start; gap:12px; padding:'10px 0'; border-bottom:1px solid var(--border); }
.notif-item:last-child { border-bottom:none; }

.wishlist-item {
  display:flex; align-items:center; gap:12px; padding:12px 20px;
  border-bottom:1px solid var(--border); transition:background 0.15s;
}
.wishlist-item:hover { background:#fff5f5; }
.wishlist-item:last-child { border-bottom:none; }

.mode-pill {
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 12px; border-radius:99px; font-size:11px; font-weight:800;
  text-transform:uppercase; letter-spacing:0.05em;
}
`;

function injectCSS() {
  if (document.getElementById('ud-css')) return;
  const s = document.createElement('style');
  s.id = 'ud-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => '₹' + n.toLocaleString('en-IN');
const delay = i => ({ animationDelay: `${i * 0.07}s` });

function Card({ children, style = {} }) {
  return <div className="card" style={{ borderRadius:16, overflow:'hidden', ...style }}>{children}</div>;
}

function CardHeader({ title, icon, action, accentColor }) {
  return (
    <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span className="dash-section-title" style={{ color: accentColor, margin:0 }}>
        {icon} {title}
      </span>
      {action}
    </div>
  );
}

// ─── SELLER DASHBOARD ─────────────────────────────────────────────────────────
function SellerDashboard({ user, listings, orders, navigate }) {
  const mySales   = orders.filter(o => o.sellerId === user.id);
  const revenue   = mySales.filter(o => o.status === 'completed').reduce((s, o) => s + o.price, 0);
  const pending   = mySales.filter(o => o.status === 'pending').length;
  const totalViews= listings.reduce((s, l) => s + l.views, 0);
  const avgViews  = listings.length ? Math.round(totalViews / listings.length) : 0;

  // Mock performance data
  const perfData = [
    { label:'Profile Complete', pct: 72, color:'#3b9edd' },
    { label:'Response Rate',    pct: 91, color:'#22c55e' },
    { label:'Listing Quality',  pct: 58, color:'#f59e0b' },
  ];
  const notifications = [
    { text: 'New message from Rahul about Sony Headphones', time: '2 min ago', type: 'msg' },
    { text: 'Your listing "iPhone 13" got 12 new views', time: '1 hr ago', type: 'eye' },
    { text: 'Order #1043 marked as completed', time: '3 hr ago', type: 'check' },
  ];

  return (
    <div className="dash-fade-in">
      {/* ── Seller Hero Banner ── */}
      <div className="seller-hero">
        <div style={{ position:'relative', zIndex:1 }}>
          <div className="hero-badge">
            <Flame size={12}/> Seller Dashboard
          </div>
          <h2 className="hero-title">
            Namaste, {user.name.split(' ')[0]} 👋
          </h2>
          <p className="hero-sub">Aaj apni sales track karo aur naye buyers tak pahuncho</p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-val">{listings.length}</span>
              <span className="hero-stat-lbl">Active Listings</span>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }} />
            <div className="hero-stat">
              <span className="hero-stat-val">{fmt(revenue)}</span>
              <span className="hero-stat-lbl">Total Revenue</span>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }} />
            <div className="hero-stat">
              <span className="hero-stat-val">{totalViews}</span>
              <span className="hero-stat-lbl">Total Views</span>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }} />
            <div className="hero-stat">
              <span className="hero-stat-val">{mySales.length}</span>
              <span className="hero-stat-lbl">Total Sales</span>
            </div>
          </div>
        </div>

        {/* Mode switch top-right */}
        <div style={{ position:'absolute', top:20, right:20, zIndex:2 }}>
          <ModeSwitch />
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:'Pending Orders', val: pending,   icon:<Clock size={20}/>,      bg:'#fff7ed', iconClr:'#f97316', textClr:'#c2410c', decoClr:'#f97316' },
          { label:'Avg Views/Item', val: avgViews,  icon:<Eye size={20}/>,        bg:'#eff6ff', iconClr:'#3b82f6', textClr:'#1d4ed8', decoClr:'#3b82f6' },
          { label:'Total Reviews',  val: 18,         icon:<Star size={20}/>,       bg:'#fefce8', iconClr:'#eab308', textClr:'#a16207', decoClr:'#eab308' },
          { label:'New Messages',   val: 4,          icon:<MessageSquare size={20}/>, bg:'#f0fdf4', iconClr:'#22c55e', textClr:'#15803d', decoClr:'#22c55e' },
        ].map((s, i) => (
          <div key={s.label} className="dash-stat-card" style={{ background:s.bg, border:`1px solid ${s.decoClr}22`, ...delay(i) }}>
            <div className="deco" style={{ background:s.decoClr }} />
            <div style={{ color:s.iconClr, marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontFamily:'Roboto,sans-serif', fontSize:26, fontWeight:900, color:s.textClr, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11, fontWeight:700, color:s.textClr, opacity:0.7, marginTop:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* ── My Active Listings ── */}
        <Card style={{ animationDelay:'0.15s' }}>
          <CardHeader
            title="Active Listings"
            icon={<Package size={15}/>}
            accentColor="#1a4a72"
            action={
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/add-item')}>
                <Plus size={13}/> Add
              </button>
            }
          />
          {listings.length === 0 ? (
            <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>📦</div>
              <div style={{ fontWeight:700, marginBottom:12 }}>Abhi koi listing nahi</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/add-item')}>
                Pehli listing banao →
              </button>
            </div>
          ) : (
            <>
              {listings.slice(0,4).map(item => (
                <div key={item.id} className="listing-row">
                  <span style={{ fontSize:26, flexShrink:0 }}>{item.image}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', gap:8, marginTop:2 }}>
                      <span style={{ display:'flex', alignItems:'center', gap:3 }}><Eye size={10}/>{item.views}</span>
                      <span>📍{item.city}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:800, fontSize:14, color:'#1a4a72' }}>{fmt(item.price)}</div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ fontSize:9, fontWeight:800, background:'#dcfce7', color:'#15803d', padding:'2px 6px', borderRadius:99 }}>ACTIVE</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding:'12px 20px', textAlign:'center' }}>
                <button style={{ background:'none', border:'none', color:'#1a4a72', fontWeight:700, fontSize:12, cursor:'pointer' }} onClick={() => navigate('/dashboard/listings')}>
                  View all {listings.length} listings →
                </button>
              </div>
            </>
          )}
        </Card>

        {/* ── Recent Sales ── */}
        <Card style={{ animationDelay:'0.2s' }}>
          <CardHeader
            title="Recent Sales"
            icon={<TrendingUp size={15}/>}
            accentColor="#16a34a"
            action={
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/orders')}>View all</button>
            }
          />
          {mySales.length === 0 ? (
            <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🏪</div>
              <div style={{ fontWeight:700 }}>Abhi koi sale nahi</div>
              <div style={{ fontSize:12, marginTop:6 }}>Listings add karo aur buyers tak pahuncho</div>
            </div>
          ) : (
            mySales.slice(0,4).map(order => (
              <div key={order.id} className="listing-row">
                <div style={{ width:36, height:36, borderRadius:10, background: order.status==='completed'?'#dcfce7':'#fff7ed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {order.status === 'completed' ? <CheckCircle size={18} color="#16a34a"/> : <Clock size={18} color="#f97316"/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{order.itemTitle}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{order.date}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:800, fontSize:14, color:'#16a34a' }}>+{fmt(order.price)}</div>
                  <span className={`badge ${order.status==='completed'?'badge-green':'badge-orange'}`} style={{ fontSize:9 }}>{order.status}</span>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 0.7fr', gap:20 }}>
        {/* ── Performance Score ── */}
        <Card style={{ animationDelay:'0.25s' }}>
          <CardHeader title="Seller Performance" icon={<BarChart2 size={15}/>} accentColor="#7c3aed" />
          <div style={{ padding:20 }}>
            <div className="perf-bar-wrap">
              {perfData.map(p => (
                <div key={p.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
                    <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{p.label}</span>
                    <span style={{ fontWeight:800, color:p.color }}>{p.pct}%</span>
                  </div>
                  <div className="perf-bar">
                    <div className="perf-fill" style={{ width:`${p.pct}%`, background:p.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:20, padding:14, background:'#eff6ff', borderRadius:12, border:'1px solid #bfdbfe' }}>
              <div style={{ fontSize:12, fontWeight:800, color:'#1d4ed8', marginBottom:6 }}>💡 Pro Tip</div>
              <div style={{ fontSize:12, color:'#1e40af', lineHeight:1.5 }}>
                Listing quality score badhaone ke liye 4+ photos add karo aur attributes fill karo. 3x zyada buyers contact karte hain!
              </div>
            </div>
          </div>
        </Card>

        {/* ── Quick Actions ── */}
        <Card style={{ animationDelay:'0.3s' }}>
          <CardHeader title="Quick Actions" icon={<Zap size={15}/>} accentColor="#f97316" />
          <div style={{ padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Add Listing', icon:'📦', color:'#1a4a72', border:'#bfdbfe', onClick:() => navigate('/dashboard/add-item') },
              { label:'My Listings', icon:'📋', color:'#16a34a', border:'#bbf7d0', onClick:() => navigate('/dashboard/listings') },
              { label:'View Orders', icon:'🧾', color:'#7c3aed', border:'#e9d5ff', onClick:() => navigate('/dashboard/orders')   },
              { label:'My Profile',  icon:'👤', color:'#f97316', border:'#fed7aa', onClick:() => navigate('/dashboard/profile')  },
            ].map(a => (
              <div key={a.label} className="quick-action"
                style={{ borderColor:a.border, color:a.color }}
                onClick={a.onClick}>
                <span style={{ fontSize:24 }}>{a.icon}</span>
                <span style={{ fontSize:11, color:a.color }}>{a.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Notifications ── */}
      <Card style={{ marginTop:20, animationDelay:'0.35s' }}>
        <CardHeader title="Recent Activity" icon={<Bell size={15}/>} accentColor="#0f2942" />
        <div>
          {notifications.map((n, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 20px', borderBottom: i<notifications.length-1?'1px solid var(--border)':'none' }}>
              <div style={{ marginTop:2, flexShrink:0 }}>
                {n.type==='msg'   && <div style={{ width:8, height:8, borderRadius:'50%', background:'#3b82f6', marginTop:4 }}/>}
                {n.type==='eye'   && <div style={{ width:8, height:8, borderRadius:'50%', background:'#8b5cf6', marginTop:4 }}/>}
                {n.type==='check' && <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', marginTop:4 }}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)' }}>{n.text}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── BUYER DASHBOARD ──────────────────────────────────────────────────────────
function BuyerDashboard({ user, orders, navigate }) {
  const myOrders  = orders.filter(o => o.buyerId === user.id);
  const completed = myOrders.filter(o => o.status === 'completed');
  const pending   = myOrders.filter(o => o.status === 'pending');
  const spent     = completed.reduce((s, o) => s + o.price, 0);

  // Mock wishlist + recommendations
  const wishlist = [
    { id:1, title:'Samsung Galaxy S24', price:72000, emoji:'📱', city:'Mumbai', discount: 8 },
    { id:2, title:'Honda Activa 6G',    price:78000, emoji:'🛵', city:'Delhi',  discount: 0 },
    { id:3, title:'MacBook Air M2',     price:95000, emoji:'💻', city:'Bangalore', discount: 5 },
  ];
  const recommended = [
    { id:1, title:'Sony WH-1000XM5 Headphones', price:18500, emoji:'🎧', city:'Delhi',     rating:4.8 },
    { id:2, title:'Gym Equipment Bundle',        price:12000, emoji:'💪', city:'Lucknow',   rating:4.5 },
    { id:3, title:'Vintage Guitar',              price:8000,  emoji:'🎸', city:'Jaipur',    rating:4.7 },
  ];

  return (
    <div className="dash-fade-in">
      {/* ── Buyer Hero Banner ── */}
      <div className="buyer-hero">
        <div style={{ position:'relative', zIndex:1 }}>
          <div className="hero-badge">
            <ShoppingCart size={12}/> Buyer Dashboard
          </div>
          <h2 className="hero-title">
            Hey {user.name.split(' ')[0]}, kya dhoond rahe ho? 🛍️
          </h2>
          <p className="hero-sub">Aaj ke best deals aur tumhara order status yahan hai</p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-val">{myOrders.length}</span>
              <span className="hero-stat-lbl">Total Orders</span>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }}/>
            <div className="hero-stat">
              <span className="hero-stat-val">{pending.length}</span>
              <span className="hero-stat-lbl">Pending</span>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }}/>
            <div className="hero-stat">
              <span className="hero-stat-val">{fmt(spent)}</span>
              <span className="hero-stat-lbl">Total Spent</span>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }}/>
            <div className="hero-stat">
              <span className="hero-stat-val">{wishlist.length}</span>
              <span className="hero-stat-lbl">Wishlist</span>
            </div>
          </div>
        </div>
        <div style={{ position:'absolute', top:20, right:20, zIndex:2 }}>
          <ModeSwitch />
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:'Orders Placed',    val: myOrders.length,  icon:<ShoppingCart size={20}/>, bg:'#fef2f2', iconClr:'#ef4444', textClr:'#b91c1c', decoClr:'#ef4444' },
          { label:'Completed',        val: completed.length, icon:<CheckCircle size={20}/>,  bg:'#f0fdf4', iconClr:'#22c55e', textClr:'#15803d', decoClr:'#22c55e' },
          { label:'Wishlist Items',   val: wishlist.length,  icon:<Heart size={20}/>,        bg:'#fdf2f8', iconClr:'#ec4899', textClr:'#9d174d', decoClr:'#ec4899' },
          { label:'Total Spent',      val: fmt(spent),       icon:<Tag size={20}/>,          bg:'#fff7ed', iconClr:'#f97316', textClr:'#c2410c', decoClr:'#f97316' },
        ].map((s, i) => (
          <div key={s.label} className="dash-stat-card" style={{ background:s.bg, border:`1px solid ${s.decoClr}22`, ...delay(i) }}>
            <div className="deco" style={{ background:s.decoClr }}/>
            <div style={{ color:s.iconClr, marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontFamily:'Roboto,sans-serif', fontSize: typeof s.val==='string'?18:26, fontWeight:900, color:s.textClr, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11, fontWeight:700, color:s.textClr, opacity:0.7, marginTop:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* ── Recent Orders ── */}
        <Card>
          <CardHeader
            title="My Orders"
            icon={<ShoppingCart size={15}/>}
            accentColor="#b91c1c"
            action={<button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/orders')}>View all</button>}
          />
          {myOrders.length === 0 ? (
            <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🛒</div>
              <div style={{ fontWeight:700, marginBottom:12 }}>Koi order nahi abhi</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>Marketplace browse karo</button>
            </div>
          ) : (
            myOrders.slice(0,4).map(order => (
              <div key={order.id} className="order-row">
                <div style={{ width:36, height:36, borderRadius:10, background: order.status==='completed'?'#fef2f2':'#fff7ed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {order.status==='completed' ? <CheckCircle size={18} color="#ef4444"/> : <Clock size={18} color="#f97316"/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{order.itemTitle}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{order.date}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:800, fontSize:14, color:'#b91c1c' }}>{fmt(order.price)}</div>
                  <span className={`badge ${order.status==='completed'?'badge-green':'badge-orange'}`} style={{ fontSize:9 }}>{order.status}</span>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* ── Wishlist ── */}
        <Card>
          <CardHeader
            title="My Wishlist"
            icon={<Heart size={15}/>}
            accentColor="#9d174d"
            action={<span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>{wishlist.length} items</span>}
          />
          {wishlist.map(item => (
            <div key={item.id} className="wishlist-item">
              <span style={{ fontSize:28, flexShrink:0 }}>{item.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>📍 {item.city}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:800, fontSize:14, color:'#b91c1c' }}>{fmt(item.price)}</div>
                {item.discount > 0 && (
                  <span style={{ fontSize:9, fontWeight:800, background:'#fef2f2', color:'#b91c1c', padding:'2px 6px', borderRadius:99 }}>
                    {item.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 0.7fr', gap:20 }}>
        {/* ── Recommended For You ── */}
        <Card>
          <CardHeader title="Aapke Liye Recommendations" icon={<Target size={15}/>} accentColor="#7c3aed" />
          <div style={{ padding:'0 0 8px' }}>
            {recommended.map((item, i) => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i<recommended.length-1?'1px solid var(--border)':'none', cursor:'pointer', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#fdf4ff'}
                onMouseLeave={e => e.currentTarget.style.background='white'}>
                <span style={{ fontSize:32, flexShrink:0 }}>{item.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{item.title}</div>
                  <div style={{ display:'flex', gap:8, marginTop:3, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>📍 {item.city}</span>
                    <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>⭐ {item.rating}</span>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:800, fontSize:15, color:'#7c3aed' }}>{fmt(item.price)}</div>
                  <button style={{ marginTop:4, background:'#7c3aed', color:'white', border:'none', borderRadius:99, padding:'3px 10px', fontSize:10, fontWeight:800, cursor:'pointer' }}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Quick Actions (Buyer) ── */}
        <Card>
          <CardHeader title="Quick Actions" icon={<Zap size={15}/>} accentColor="#f97316" />
          <div style={{ padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Browse All',   icon:'🛍️', color:'#b91c1c', border:'#fecdd3', onClick:() => navigate('/')                       },
              { label:'My Orders',    icon:'📦', color:'#7c3aed', border:'#e9d5ff', onClick:() => navigate('/dashboard/orders')         },
              { label:'My Wishlist',  icon:'❤️', color:'#ec4899', border:'#fbcfe8', onClick:() => navigate('/dashboard/profile')       },
              { label:'My Profile',   icon:'👤', color:'#f97316', border:'#fed7aa', onClick:() => navigate('/dashboard/profile')       },
            ].map(a => (
              <div key={a.label} className="quick-action"
                style={{ borderColor:a.border, color:a.color }}
                onClick={a.onClick}>
                <span style={{ fontSize:24 }}>{a.icon}</span>
                <span style={{ fontSize:11, color:a.color }}>{a.label}</span>
              </div>
            ))}
          </div>

          {/* Savings tracker */}
          <div style={{ margin:'0 16px 16px', padding:14, background:'linear-gradient(135deg,#fff5f5,#fdf2f8)', borderRadius:12, border:'1px solid #fecdd3', textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#9d174d', textTransform:'uppercase', marginBottom:4, letterSpacing:'0.05em' }}>💰 Total Saved</div>
            <div style={{ fontFamily:'Roboto,sans-serif', fontSize:22, fontWeight:900, color:'#b91c1c' }}>₹4,200</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Deals & discounts se</div>
          </div>
        </Card>
      </div>

      {/* ── Browse by Category ── */}
      <Card style={{ marginTop:20 }}>
        <CardHeader title="Category se Dhoondo" icon={<Tag size={15}/>} accentColor="#b91c1c" />
        <div style={{ padding:20, display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { label:'Mobiles',     emoji:'📱', color:'#3b82f6' },
            { label:'Vehicles',    emoji:'🚗', color:'#f97316' },
            { label:'Properties',  emoji:'🏠', color:'#22c55e' },
            { label:'Electronics', emoji:'💻', color:'#8b5cf6' },
            { label:'Fashion',     emoji:'👗', color:'#ec4899' },
            { label:'Furniture',   emoji:'🛋',  color:'#a855f7' },
            { label:'Jobs',        emoji:'💼', color:'#64748b' },
            { label:'More →',      emoji:'📦', color:'#6b7280' },
          ].map(cat => (
            <div key={cat.label} onClick={() => navigate('/')}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:'#f9fafb', borderRadius:99, border:`1.5px solid ${cat.color}33`, cursor:'pointer', transition:'all 0.2s', fontWeight:700, fontSize:13, color:cat.color }}
              onMouseEnter={e => { e.currentTarget.style.background = cat.color; e.currentTarget.style.color='white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color=cat.color; }}>
              <span style={{ fontSize:18 }}>{cat.emoji}</span>
              {cat.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── BOTH MODE DASHBOARD ──────────────────────────────────────────────────────
function BothDashboard({ user, listings, orders, navigate }) {
  const isSeller = user.mode === 'seller';
  return isSeller
    ? <SellerDashboard user={user} listings={listings} orders={orders} navigate={navigate}/>
    : <BuyerDashboard  user={user} orders={orders}                      navigate={navigate}/>;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [listings, setListings] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  injectCSS();

  useEffect(() => {
    Promise.all([mockAPI.getMyListings(user.id), mockAPI.getMyOrders(user.id)])
      .then(([l, o]) => { setListings(l); setOrders(o); setLoading(false); });
  }, [user.id]);

  if (loading) return <LoadingSpinner center />;

  // ── Route to correct dashboard ──
  if (user.canBuy && user.canSell) {
    return <BothDashboard user={user} listings={listings} orders={orders} navigate={navigate}/>;
  }
  if (user.canSell) {
    return <SellerDashboard user={user} listings={listings} orders={orders} navigate={navigate}/>;
  }
  return <BuyerDashboard user={user} orders={orders} navigate={navigate}/>;
}

