"use client";
// src/components/dashboard/user/profile/sections/SellerStats.jsx
import React from 'react';
import { Store, Star, Clock, Eye, TrendingUp, Package, MessageSquare } from 'lucide-react';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:18, color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
    </div>
  );
}

export default function SellerStats({ data }) {
  const stats = [
    { icon: <Package  size={18} color="var(--primary-600)"/>, val: data.totalListings || 0,  lbl: 'Active Listings' },
    { icon: <TrendingUp size={18} color="#16a34a"/>,          val: data.totalSold     || 0,  lbl: 'Total Sold'      },
    { icon: <Eye      size={18} color="#7c3aed"/>,            val: data.totalViews    || 0,  lbl: 'Total Views'     },
    { icon: <MessageSquare size={18} color="#ea580c"/>,       val: data.totalReviews  || 0,  lbl: 'Total Reviews'   },
  ];

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title"><Store size={16}/>Seller Statistics</span>
        <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#f59e0b' }}>
          <Stars rating={data.rating || 0} />
          <span style={{ color:'var(--text-primary)' }}>{data.rating || 0}/5</span>
        </span>
      </div>
      <div className="profile-section-body">

        {/* Stats grid */}
        <div className="seller-grid">
          {stats.map(s => (
            <div className="seller-stat" key={s.lbl}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}>{s.icon}</div>
              <div className="seller-stat-val">{s.val}</div>
              <div className="seller-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Rating + Response + Last Active */}
        <div className="field-grid-3">
          <div style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:14, border:'1px solid var(--primary-100)' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', marginBottom:8 }}>Seller Rating</div>
            <Stars rating={data.rating || 0} />
            <div style={{ fontSize:18, fontWeight:800, marginTop:4 }}>{data.rating || 0} / 5</div>
          </div>
          <div style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:14, border:'1px solid var(--primary-100)' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>Response Time</div>
            <div style={{ fontSize:18, fontWeight:800 }}>{data.responseTime || '< 1 hr'}</div>
          </div>
          <div style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:14, border:'1px solid var(--primary-100)' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', marginBottom:8 }}>Last Active</div>
            <div style={{ fontSize:14, fontWeight:700 }}>{data.lastActive || 'Today'}</div>
          </div>
        </div>

        {/* Reviews list preview */}
        <div>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12, color:'var(--text-primary)' }}>Recent Reviews</div>
          {(data.reviews || [
            { id:1, by:'Arjun S.', rating:5, text:'Great seller! Item was exactly as described.', date:'2024-12-10' },
            { id:2, by:'Priya M.', rating:4, text:'Fast delivery, good packaging. Recommended.', date:'2024-12-05' },
          ]).map(r => (
            <div key={r.id} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{r.by}</div>
                <div style={{ display:'flex', gap:2 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: i<=r.rating?'#f59e0b':'#e2e8f0', fontSize:13 }}>★</span>)}
                </div>
              </div>
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{r.text}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{r.date}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

