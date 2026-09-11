"use client";
// src/components/marketplace/AdCard.jsx
// Location: C:\xampp\htdocs\addies-exchange\src\components\marketplace\AdCard.jsx

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Zap, TrendingUp } from 'lucide-react';
import { RevenueTracker } from './AdEngine';

// ── Ad Card — handles all 3 types: promoted, banner, native ───────────────────
export default function AdCard({ ad }) {
  const navigate   = useNavigate();
  const trackedRef = useRef(false);

  // Track impression once when card mounts
  useEffect(() => {
    if (!trackedRef.current) {
      RevenueTracker.impression(ad.id);
      trackedRef.current = true;
    }
  }, [ad.id]);

  const handleClick = () => {
    RevenueTracker.click(ad.id);
    if (ad.isExternal && ad.url && ad.url !== '#') {
      window.open(ad.url, '_blank', 'noopener');
    } else if (ad.url && !ad.isExternal) {
      navigate(ad.url);
    }
  };

  // ── Promoted listing — looks like a premium item card ─────────────────────
  if (ad.type === 'promoted') return (
    <div className="ad-card ad-promoted" onClick={handleClick}
      style={{ background: ad.gradient, borderColor: ad.accentColor + '44' }}>
      {/* Ad label */}
      <div className="ad-label-strip">
        <span className="ad-label-tag">{ad.label}</span>
        <span className="ad-badge" style={{ color: ad.accentColor }}>{ad.badge}</span>
      </div>

      {/* Emoji hero */}
      <div className="ad-emoji-wrap" style={{ background: ad.accentColor + '18' }}>
        <span className="ad-emoji">{ad.emoji}</span>
        {ad.city && (
          <span className="ad-city-tag">📍 {ad.city}</span>
        )}
      </div>

      {/* Body */}
      <div className="ad-body">
        <div className="ad-title" style={{ color: 'white' }}>{ad.title}</div>
        <div className="ad-desc" style={{ color: 'rgba(255,255,255,0.65)' }}>{ad.desc}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div className="ad-price" style={{ color: ad.accentColor }}>{ad.price}</div>
          {ad.originalPrice && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
              {ad.originalPrice}
            </div>
          )}
        </div>

        <button className="ad-cta-btn" style={{ background: ad.accentColor, color: '#000' }}>
          {ad.cta} →
        </button>
      </div>
    </div>
  );

  // ── Banner ad — wide brand advertisement ──────────────────────────────────
  if (ad.type === 'banner') return (
    <div className="ad-card ad-banner" onClick={handleClick}
      style={{ background: ad.gradient, borderColor: ad.accentColor + '33' }}>
      <div className="ad-label-strip">
        <span className="ad-label-tag">{ad.label}</span>
        <span className="ad-badge" style={{ color: ad.accentColor }}>{ad.badge}</span>
        {ad.isExternal && <ExternalLink size={10} style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}/>}
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '0 14px 14px' }}>
        <div className="ad-banner-emoji" style={{ background: ad.accentColor + '22' }}>
          {ad.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ad-title" style={{ color: 'white', fontSize: 13 }}>{ad.title}</div>
          <div className="ad-desc" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 }}>
            {ad.desc}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 14px 14px' }}>
        <button className="ad-cta-btn ad-cta-outline"
          style={{ borderColor: ad.accentColor, color: ad.accentColor }}>
          {ad.cta}
        </button>
      </div>
    </div>
  );

  // ── Native ad — styled to blend with listing grid ─────────────────────────
  if (ad.type === 'native') return (
    <div className="ad-card ad-native" onClick={handleClick}
      style={{ background: ad.gradient, borderColor: ad.accentColor + '44' }}>
      <div className="ad-label-strip">
        <span className="ad-label-tag" style={{ background: ad.accentColor + '33', color: ad.accentColor }}>
          {ad.label}
        </span>
        <span className="ad-badge" style={{ color: ad.accentColor }}>{ad.badge}</span>
      </div>

      <div className="ad-emoji-wrap" style={{ background: ad.accentColor + '15', height: 120 }}>
        <span style={{ fontSize: 52 }}>{ad.emoji}</span>
      </div>

      <div className="ad-body">
        <div className="ad-title" style={{ color: 'white', fontSize: 14 }}>{ad.title}</div>
        <div className="ad-desc" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{ad.desc}</div>
        {ad.price && (
          <div className="ad-price" style={{ color: ad.accentColor, fontSize: 18, margin: '6px 0' }}>
            {ad.price}
          </div>
        )}
        <button className="ad-cta-btn" style={{ background: ad.accentColor, color: '#000', marginTop: 8 }}>
          <Zap size={12}/> {ad.cta}
        </button>
      </div>
    </div>
  );

  return null;
}

// ── Top Banner Strip — full width ad above grid (high visibility) ──────────────
export function TopBannerAd({ ad, onClose }) {
  const navigate = useNavigate();
  if (!ad) return null;

  const handleClick = () => {
    RevenueTracker.click(ad.id);
    RevenueTracker.impression(ad.id);
    if (ad.isExternal) window.open(ad.url, '_blank', 'noopener');
    else if (ad.url) navigate(ad.url);
  };

  return (
    <div className="top-banner-ad" style={{ background: ad.gradient }}>
      <div className="top-banner-inner">
        <span style={{ fontSize: 22 }}>{ad.emoji}</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{ad.title}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 8 }}>{ad.desc}</span>
        </div>
        <button className="top-banner-cta"
          style={{ background: ad.accentColor, color: '#000' }}
          onClick={handleClick}>
          {ad.cta}
        </button>
        <button className="top-banner-close" onClick={onClose}>✕</button>
      </div>
      <div className="top-banner-label">Ad</div>
    </div>
  );
}

