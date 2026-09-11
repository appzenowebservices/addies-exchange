"use client";
// src/components/dashboard/user/profile/sections/PublicProfileView.jsx
import React from 'react';
import { Globe, MapPin, Clock, Shield, Package, Star } from 'lucide-react';

const BADGE_META = {
  bronze: { emoji:'🥉', label:'Bronze Verified', color:'#cd7f32' },
  silver: { emoji:'🥈', label:'Silver Verified', color:'#808080' },
  gold:   { emoji:'🥇', label:'Gold Verified',   color:'#b8860b' },
};

function TrustRing({ score }) {
  const r   = 26;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ position:'relative', width:60, height:60 }}>
      <svg width="60" height="60" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke="white" strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'Roboto,sans-serif', fontSize:13, fontWeight:800, color:'white' }}>{score}%</div>
    </div>
  );
}

export default function PublicProfileView({ user, profileData }) {
  const badge      = profileData.currentPackage;
  const badgeMeta  = badge && badge !== 'none' ? BADGE_META[badge] : null;
  const trustScore = profileData.trustScore || 72;

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title"><Globe size={16}/>Public Profile Preview</span>
        <span className="badge badge-blue" style={{ fontSize:11 }}>What others see</span>
      </div>
      <div className="profile-section-body">

        <div style={{ fontSize:12, color:'var(--text-secondary)', padding:'8px 12px', background:'var(--primary-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--primary-200)', marginBottom:4 }}>
          ℹ️ This is how your profile appears on the public marketplace to other buyers and sellers.
        </div>

        {/* Public card */}
        <div className="public-profile-card">
          <div style={{ display:'flex', gap:16, flex:1, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.4)', background:'linear-gradient(135deg,rgba(59,158,221,0.5),rgba(26,103,160,0.7))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, color:'white', fontFamily:'Roboto,sans-serif', flexShrink:0 }}>
              {user.avatar}
            </div>
            <div style={{ flex:1, minWidth:160 }}>
              <div style={{ fontFamily:'Roboto,sans-serif', fontSize:20, fontWeight:800, marginBottom:4 }}>
                {user.name}
                {badgeMeta && <span style={{ marginLeft:8 }}>{badgeMeta.emoji}</span>}
              </div>
              {badgeMeta && (
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:6 }}>{badgeMeta.label}</div>
              )}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {user.canBuy  && <span style={{ background:'rgba(255,255,255,0.15)', color:'white', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>🛒 Buyer</span>}
                {user.canSell && <span style={{ background:'rgba(255,255,255,0.15)', color:'white', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>🏪 Seller</span>}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <TrustRing score={trustScore} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:700 }}>TRUST SCORE</span>
            </div>
          </div>
        </div>

        {/* Public info grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
          {[
            { icon:<MapPin size={15}/>,   label:'Location',       val: profileData.city ? `${profileData.city}${profileData.state?', '+profileData.state:''}` : 'Not set' },
            { icon:<Star   size={15}/>,   label:'Seller Rating',  val: `${profileData.rating||0} / 5 ⭐` },
            { icon:<Package size={15}/>,  label:'Total Listings', val: profileData.totalListings || 0 },
            { icon:<Shield size={15}/>,   label:'Verified Badge', val: badgeMeta ? badgeMeta.label : 'Not verified' },
            { icon:<Clock  size={15}/>,   label:'Member Since',   val: user.createdAt || '2024' },
            { icon:<Clock  size={15}/>,   label:'Last Active',    val: profileData.lastActive || 'Today' },
          ].map(item => (
            <div key={item.label} style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:14, border:'1px solid var(--primary-100)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--primary-600)', marginBottom:6 }}>
                {item.icon}
                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{item.label}</span>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{String(item.val)}</div>
            </div>
          ))}
        </div>

        {/* Bio preview */}
        {profileData.bio && (
          <div style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:14, border:'1px solid var(--primary-100)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase' }}>About</div>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{profileData.bio}</p>
          </div>
        )}

      </div>
    </div>
  );
}

