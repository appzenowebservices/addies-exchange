"use client";
// src/components/marketplace/ItemDetailPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ADDIES EXCHANGE — Item Detail Page (Updated)
//
// ✅ New Features Added:
//  1. ContactRevealButton — OLX-style "Show Contact Number" + "Chat with Seller"
//  2. Ads in Right Sidebar — Sponsored listings + Banner Ad
//  3. TopBannerAd at top of page
//  4. Ad in Related Items section
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Eye, Heart, Share2, CheckCircle,
  ShieldCheck, Clock, Tag, Flag, Zap, Star,
} from 'lucide-react';
import { useAuth }  from '../../context/AuthContext';
import { mockAPI }  from '../../server/trpcClient';
import MarketplaceNav  from './MarketplaceNav';
import ContactRevealButton from './ContactRevealButton';
import { TopBannerAd, default as AdCard } from './AdCard';
import { InterestTracker, pickAds, AD_INVENTORY } from './AdEngine';
import './item-detail.css';

// ── Condition config ───────────────────────────────────────────────────────────
const COND_CFG = {
  'Brand New': { bg:'#dcfce7', color:'#15803d', icon:'✨', desc:'Never used, original packaging' },
  'Like New':  { bg:'#dbeafe', color:'#1d4ed8', icon:'💎', desc:'Used once or twice, no visible wear' },
  'Good':      { bg:'#fef9c3', color:'#854d0e', icon:'👍', desc:'Minor signs of use, fully functional' },
  'Fair':      { bg:'#fff7ed', color:'#c2410c', icon:'🔧', desc:'Visible wear but works perfectly' },
  'For Parts': { bg:'#f1f5f9', color:'#475569', icon:'⚙️', desc:'Not fully functional, sold as-is' },
};

const SAFETY_TIPS = [
  'Meet in a public place like a mall or market',
  'Inspect the item thoroughly before paying',
  'Never send money in advance via transfer',
  'Bring a friend for high-value transactions',
];

// ── Sidebar Ad Component ───────────────────────────────────────────────────────
function SidebarAd({ ad }) {
  if (!ad) return null;
  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Sponsored
      </p>
      <AdCard ad={ad}/>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ItemDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item,        setItem]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [related,     setRelated]     = useState([]);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [ordering,    setOrdering]    = useState(false);
  const [ordered,     setOrdered]     = useState(false);
  const [imgIndex,    setImgIndex]    = useState(0);
  const [copied,      setCopied]      = useState(false);
  const [topAd,       setTopAd]       = useState(null);
  const [topAdOpen,   setTopAdOpen]   = useState(true);
  const [sidebarAds,  setSidebarAds]  = useState([]);

  useEffect(() => {
    setLoading(true);
    mockAPI.getItems().then(items => {
      const found = items.find(i => String(i.id) === String(id));
      if (found) {
        setItem(found);
        InterestTracker.trackView(found);
        setRelated(items.filter(i => i.category === found.category && i.id !== found.id).slice(0, 4));

        // Pick ads for this page
        const profile = InterestTracker.getProfile();
        const ads = pickAds(profile, found.category, 3);
        setTopAd(ads[0] || null);
        setSidebarAds(ads.slice(1));
      }
      setLoading(false);
    });
  }, [id]);

  const handleBuy = async () => {
    if (!user)               { navigate('/auth'); return; }
    if (!user.canBuy)        { alert('Buyer mode mein switch karo.'); return; }
    if (item.sellerId === user.id) { alert('Apna khud ka item nahi kharid sakte.'); return; }
    setOrdering(true);
    try {
      await mockAPI.placeOrder({ itemId: item.id, buyerId: user.id });
      setOrdered(true);
    } finally { setOrdering(false); }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true); setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) return (
    <div className="detail-page">
      <MarketplaceNav/>
      <div className="detail-skeleton">
        <div className="ds-img"/>
        <div className="ds-body">
          <div className="ds-line w60"/><div className="ds-line w40"/>
          <div className="ds-line w80"/><div className="ds-line w30"/>
        </div>
      </div>
    </div>
  );

  if (!item) return (
    <div className="detail-page">
      <MarketplaceNav/>
      <div className="detail-not-found">
        <span style={{fontSize:52}}>😕</span>
        <h2>Item nahi mila</h2>
        <p>Ye listing hata di gayi ya exist nahi karti.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>← Marketplace Jaao</button>
      </div>
    </div>
  );

  const cond   = COND_CFG[item.condition] || COND_CFG['Good'];
  const images = [item.image, item.image, item.image];

  return (
    <div className="detail-page">
      <MarketplaceNav/>

      {/* ── Top Banner Ad ── */}
      {topAd && topAdOpen && (
        <TopBannerAd ad={topAd} onClose={() => setTopAdOpen(false)}/>
      )}

      {/* ── Breadcrumb ── */}
      <div className="detail-breadcrumb">
        <div className="detail-breadcrumb-inner">
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15}/> Back
          </button>
          <span className="bc-sep">›</span>
          <span className="bc-link" onClick={() => navigate('/')}>Marketplace</span>
          <span className="bc-sep">›</span>
          <span className="bc-link" onClick={() => navigate(`/?cat=${item.category}`)}>{item.category}</span>
          <span className="bc-sep">›</span>
          <span className="bc-current">{item.title.slice(0,32)}{item.title.length > 32 ? '…' : ''}</span>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="detail-main">

        {/* ══ LEFT — Images + Stats ══ */}
        <div className="detail-left">
          {/* Image gallery */}
          <div className="detail-gallery">
            <div className="detail-gallery-main">
              <span className="detail-main-emoji">{images[imgIndex]}</span>
              <div className="detail-img-badges">
                <span className="detail-cond-badge" style={{ background: cond.bg, color: cond.color }}>
                  {cond.icon} {item.condition}
                </span>
                {item.sellerVerified && (
                  <span className="detail-verified-badge">
                    <CheckCircle size={11}/> Verified Seller
                  </span>
                )}
              </div>
              <div className="detail-img-actions">
                <button className="detail-action-btn"
                  onClick={() => { if (!user) navigate('/auth'); else setWishlisted(w => !w); }}
                  title="Wishlist">
                  <Heart size={17} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#64748b'}/>
                </button>
                <button className="detail-action-btn" onClick={handleShare} title={copied ? 'Copied!' : 'Share'}>
                  {copied ? <CheckCircle size={17} color="#16a34a"/> : <Share2 size={17} color="#64748b"/>}
                </button>
              </div>
              {item.negotiable && <span className="detail-negotiable-tag">💬 Price Negotiable</span>}
            </div>
            <div className="detail-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`detail-thumb ${imgIndex === i ? 'active' : ''}`}
                  onClick={() => setImgIndex(i)}>
                  <span style={{fontSize:24}}>{img}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="detail-stats-row">
            <div className="detail-stat"><Eye size={14}/> {item.views} views</div>
            <div className="detail-stat"><Clock size={14}/> {item.createdAt}</div>
            <div className="detail-stat"><MapPin size={14}/> {item.city}</div>
            <div className="detail-stat"><Tag size={14}/> {item.category}</div>
          </div>

          {/* Safety tips */}
          <div className="detail-safety">
            <div className="detail-safety-header">
              <ShieldCheck size={15} color="#1a5a85"/>
              <span>Safety Tips</span>
            </div>
            <ul className="detail-safety-list">
              {SAFETY_TIPS.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>

        {/* ══ RIGHT — Details + CTA ══ */}
        <div className="detail-right">
          <div className="detail-category-tag"><Tag size={11}/> {item.category}</div>

          <h1 className="detail-title">{item.title}</h1>

          <div className="detail-price-row">
            <span className="detail-price">₹{item.price.toLocaleString('en-IN')}</span>
            {item.negotiable && <span className="detail-neg-chip">💬 Negotiable</span>}
          </div>

          {/* Condition card */}
          <div className="detail-cond-card" style={{ borderColor: cond.color + '40', background: cond.bg + '60' }}>
            <span style={{ fontSize: 20 }}>{cond.icon}</span>
            <div>
              <p className="detail-cond-label" style={{ color: cond.color }}>Condition: {item.condition}</p>
              <p className="detail-cond-desc">{cond.desc}</p>
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h3 className="detail-section-title">Description</h3>
            <p className="detail-description">
              {item.description
                || `${item.title} — ${item.condition} condition mein available hai ${item.city} mein. Price ₹${item.price.toLocaleString('en-IN')} fixed${item.negotiable ? ' (negotiable)' : ''}. Genuine buyers hi contact karein.`
              }
            </p>
          </div>

          {/* Details grid */}
          <div className="detail-section">
            <h3 className="detail-section-title">Item Details</h3>
            <div className="detail-info-grid">
              {[
                ['Category',  item.category],
                ['Condition', item.condition],
                ['Location',  item.city],
                ['Listed On', item.createdAt],
                ['Views',     `${item.views} people viewed`],
                ['Seller',    item.sellerName || 'Private Seller'],
              ].map(([label, value]) => (
                <div key={label} className="detail-info-row">
                  <span className="detail-info-label">{label}</span>
                  <span className="detail-info-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seller card */}
          <div className="detail-seller-card">
            <div className="detail-seller-avatar">
              {(item.sellerName || 'S').slice(0, 2).toUpperCase()}
            </div>
            <div className="detail-seller-info">
              <p className="detail-seller-name">
                {item.sellerName || 'Private Seller'}
                {item.sellerVerified && (
                  <span className="detail-seller-verified"><CheckCircle size={12}/> Verified</span>
                )}
              </p>
              <p className="detail-seller-meta">
                <MapPin size={11}/> {item.city}
                {item.sellerRating && (
                  <span> &nbsp;·&nbsp; <Star size={11} fill="#fbbf24" color="#fbbf24"/> {item.sellerRating}</span>
                )}
              </p>
            </div>
          </div>

          {/* ── CTA — OLX Style: Chat + Contact Number ── */}
          <div className="detail-cta-wrap">
            {ordered ? (
              <div className="detail-ordered-banner">
                <CheckCircle size={18}/> Order Placed! Seller will contact you soon.
              </div>
            ) : item.sellerId === user?.id ? (
              <div className="detail-own-listing-note">
                🏷️ Ye aapki apni listing hai
              </div>
            ) : (
              <>
                {/* ✅ OLX-Style: Chat + Contact Number Reveal */}
                <ContactRevealButton item={item} showAdGate={true}/>

                {/* Buy Now button (optional e-commerce style) */}
                {(!user || user.canBuy) && (
                  <button className="detail-btn-buy" onClick={handleBuy} disabled={ordering}
                    style={{ marginTop: 8 }}>
                    {ordering
                      ? <><div className="detail-spinner"/> Processing…</>
                      : <><Zap size={16}/> Buy Now — ₹{item.price.toLocaleString('en-IN')}</>
                    }
                  </button>
                )}

                {/* Wishlist */}
                <button className="detail-btn-wishlist"
                  onClick={() => { if (!user) navigate('/auth'); else setWishlisted(w => !w); }}>
                  <Heart size={15} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : 'currentColor'}/>
                  {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>
              </>
            )}
          </div>

          {/* ── Sidebar Ads ────────────────────────────────────────────── */}
          {sidebarAds.length > 0 && (
            <div className="detail-sidebar-ads">
              <p className="detail-sidebar-ads-label">Sponsored</p>
              {sidebarAds.map(ad => <SidebarAd key={ad.id} ad={ad}/>)}
            </div>
          )}

          {/* Report */}
          <button className="detail-report-btn">
            <Flag size={12}/> Report this listing
          </button>
        </div>
      </div>

      {/* ── Related Items ── */}
      {related.length > 0 && (
        <div className="detail-related">
          <div className="detail-related-inner">
            <h2 className="detail-related-title">Similar Listings in {item.category}</h2>
            <div className="detail-related-grid">
              {related.map((r, idx) => {
                const rc = COND_CFG[r.condition] || COND_CFG['Good'];
                return (
                  <React.Fragment key={r.id}>
                    {/* Insert an ad after 2nd related item */}
                    {idx === 2 && sidebarAds[1] && (
                      <div className="detail-related-ad">
                        <AdCard ad={sidebarAds[1]}/>
                      </div>
                    )}
                    <div className="detail-related-card" onClick={() => navigate(`/item/${r.id}`)}>
                      <div className="detail-related-img">
                        <span style={{fontSize:36}}>{r.image}</span>
                        <span className="detail-related-cond" style={{background:rc.bg, color:rc.color}}>
                          {r.condition}
                        </span>
                      </div>
                      <div className="detail-related-body">
                        <p className="detail-related-name">{r.title}</p>
                        <p className="detail-related-price">₹{r.price.toLocaleString('en-IN')}</p>
                        <p className="detail-related-city"><MapPin size={10}/> {r.city}</p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

