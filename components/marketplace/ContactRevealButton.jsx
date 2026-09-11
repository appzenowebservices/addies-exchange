"use client";
// src/components/marketplace/ContactRevealButton.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ADDIES EXCHANGE — Contact Number Reveal + Chat with Seller Button
//
// Features:
//  1. "Show Contact Number" → reveals masked number after confirmation
//  2. "Chat with Seller"    → opens in-app chat conversation
//  3. Ad Gate               → optional short ad shown before reveal (monetization)
//  4. Lead tracking         → every reveal is logged for analytics
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, X, Shield, Eye, Loader2, CheckCheck } from 'lucide-react';
import { useAuth }  from '../../context/AuthContext';
import { useChat }  from '../../context/ChatContext';
import { RevenueTracker, AD_INVENTORY } from './AdEngine';
import './contact-reveal.css';

// ── Contact reveal log (in-memory; production: POST to /api/leads) ─────────
const _revealLog = [];

function logReveal(itemId, buyerId) {
  _revealLog.push({ itemId, buyerId, ts: Date.now() });
}

// ── Mini Ad Gate (shown for 3s before revealing number) ────────────────────
function AdGate({ ad, onDone }) {
  const [count, setCount] = useState(3);

  React.useEffect(() => {
    RevenueTracker.impression(ad.id);
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) { clearInterval(timer); onDone(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ad, onDone]);

  return (
    <div className="cr-ad-gate" style={{ background: ad.gradient }}>
      <div className="cr-ad-gate-label">Ad · Skipping in {count}s</div>
      <div className="cr-ad-gate-emoji">{ad.emoji}</div>
      <div className="cr-ad-gate-title" style={{ color: ad.accentColor }}>{ad.title}</div>
      <div className="cr-ad-gate-desc">{ad.desc}</div>
      <button
        className="cr-ad-gate-cta"
        style={{ background: ad.accentColor, color: '#000' }}
        onClick={() => {
          RevenueTracker.click(ad.id);
          window.open(ad.url || '#', '_blank', 'noopener');
        }}
      >
        {ad.cta}
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ContactRevealButton({ item, showAdGate = true }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrCreateConversation, openConversation } = useChat();

  const [phase,       setPhase]       = useState('idle');
  // idle → confirming → ad_gate → revealed | chat_opened
  const [phoneNum,    setPhoneNum]    = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [gateAd,      setGateAd]      = useState(null);

  // Pick a relevant ad for the gate
  const pickGateAd = useCallback(() => {
    const relevant = AD_INVENTORY.filter(a =>
      a.status === 'approved' &&
      (a.isExternal || a.advertiserId !== 'addies') &&
      (a.targetCategories.some(tc =>
        tc.toLowerCase().includes(item.category?.toLowerCase() || '')
      ) || a.targetCategories.length === 0)
    );
    return relevant[Math.floor(Math.random() * relevant.length)] || null;
  }, [item.category]);

  // ── Show Contact Number Flow ─────────────────────────────────────────────
  const handleShowContact = () => {
    if (!user) { navigate('/auth'); return; }

    if (item.sellerId === user.id) {
      alert('Ye aapki khud ki listing hai.');
      return;
    }

    if (phase === 'revealed') return; // already revealed

    if (showAdGate && phase === 'idle') {
      const ad = pickGateAd();
      setGateAd(ad);
      setPhase(ad ? 'ad_gate' : 'revealing');
      if (!ad) revealNumber();
      return;
    }

    revealNumber();
  };

  const revealNumber = useCallback(() => {
    setPhase('revealing');
    // Simulate API call delay
    setTimeout(() => {
      const num = item.sellerPhone || '+91 98765-43210'; // production: fetch from API
      setPhoneNum(num);
      setPhase('revealed');
      logReveal(item.id, user?.id);
    }, 600);
  }, [item, user]);

  const handleAdDone = useCallback(() => {
    revealNumber();
  }, [revealNumber]);

  const copyPhone = () => {
    if (!phoneNum) return;
    navigator.clipboard.writeText(phoneNum).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Chat with Seller Flow ─────────────────────────────────────────────────
  const handleChat = () => {
    if (!user) { navigate('/auth'); return; }
    if (item.sellerId === user.id) { alert('Apne aap se chat nahi kar sakte!'); return; }

    const conv = getOrCreateConversation({
      itemId: item.id,
      itemTitle: item.title,
      itemEmoji: item.image,
      itemPrice: item.price,
      buyerId:    user.id,
      buyerName:  user.name,
      buyerAvatar: user.avatar,
      sellerId:   item.sellerId || 'seller-default',
      sellerName: item.sellerName || 'Seller',
      sellerAvatar: null,
    });

    navigate(`/chat/${conv.id}`);
  };

  return (
    <div className="cr-root">

      {/* ── Ad Gate overlay ──────────────────────────────────────────────── */}
      {phase === 'ad_gate' && gateAd && (
        <div className="cr-overlay">
          <div className="cr-overlay-inner">
            <AdGate ad={gateAd} onDone={handleAdDone}/>
          </div>
        </div>
      )}

      {/* ── Chat with Seller Button ─────────────────────────────────────── */}
      <button className="cr-btn cr-btn-chat" onClick={handleChat}>
        <MessageCircle size={17}/>
        <span>Chat with Seller</span>
      </button>

      {/* ── Contact Number Button / Revealed State ────────────────────── */}
      {phase === 'revealed' ? (
        <div className="cr-revealed">
          <div className="cr-phone-row">
            <Phone size={15} className="cr-phone-icon"/>
            <a href={`tel:${phoneNum}`} className="cr-phone-num">{phoneNum}</a>
            <button className="cr-copy-btn" onClick={copyPhone} title="Copy number">
              {copied ? <CheckCheck size={13} color="#22c55e"/> : <Eye size={13}/>}
            </button>
          </div>
          <p className="cr-reveal-hint">
            <Shield size={11}/> Apni safety ke liye public place pe milein
          </p>
        </div>
      ) : (
        <button
          className="cr-btn cr-btn-contact"
          onClick={handleShowContact}
          disabled={phase === 'revealing'}
        >
          {phase === 'revealing' ? (
            <><Loader2 size={16} className="cr-spin"/> Fetching number…</>
          ) : (
            <><Phone size={16}/> Show Contact Number</>
          )}
        </button>
      )}

      {/* Safety note */}
      <p className="cr-safety-note">
        <Shield size={11}/> Kabhi advance payment na karein. Milkar item dekhein.
      </p>
    </div>
  );
}

