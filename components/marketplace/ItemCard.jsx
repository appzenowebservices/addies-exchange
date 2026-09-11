"use client";
// src/components/marketplace/ItemCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MapPin, Tag, MessageCircle, Heart } from 'lucide-react';
import { mockAPI } from '../../server/trpcClient';

export default function ItemCard({ item, user, onView }) {
  const navigate   = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [ordered,  setOrdered]  = useState(false);
  const [wished,   setWished]   = useState(false);

  // Click on card → go to detail page
  const handleCardClick = () => {
    onView && onView(item);
    navigate(`/item/${item.id}`);
  };

  const handleBuy = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/auth'); return; }
    if (!user.canBuy) { alert('Switch to Buyer mode to purchase items.'); return; }
    if (item.sellerId === user.id) { alert('You cannot buy your own listing.'); return; }
    setOrdering(true);
    try {
      await mockAPI.placeOrder({ itemId: item.id, buyerId: user.id });
      setOrdered(true);
    } finally { setOrdering(false); }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setWished(w => !w);
  };

  const handleContact = (e) => {
    e.stopPropagation();
    navigate(`/item/${item.id}`);
  };

  const isNew = item.condition === 'Like New' || item.condition === 'Brand New';

  return (
    <div className="item-card" role="article" onClick={handleCardClick} style={{ cursor:'pointer' }}>
      {/* Image area */}
      <div className="item-card-image">
        <span className="item-emoji">{item.image}</span>

        {/* Condition badge — bottom left */}
        <span className={`item-condition-badge ${isNew ? 'badge-green' : 'badge-blue'}`}>
          {item.condition}
        </span>

        {/* Wishlist heart — top right */}
        <button
          className={`item-wishlist-btn ${wished ? 'wished' : ''}`}
          onClick={handleWishlist}
          title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={wished ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="item-card-body">
        <div className="item-category">
          <Tag size={11}/> {item.category}
        </div>

        <h3 className="item-title">{item.title}</h3>

        <div className="item-price">₹{item.price.toLocaleString('en-IN')}</div>

        <div className="item-meta">
          <span><MapPin size={11}/> {item.city}</span>
          <span><Eye size={11}/> {item.views}</span>
          <span>{item.createdAt}</span>
        </div>

        {ordered ? (
          <div className="btn btn-full" style={{ background:'#dcfce7', color:'#16a34a', border:'1px solid #bbf7d0', cursor:'default', fontSize:13, fontWeight:700 }}>
            ✓ Order Placed!
          </div>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={handleContact}>
              <MessageCircle size={13}/> Contact
            </button>
            {(!user || user.canBuy) && item.sellerId !== user?.id && (
              <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={handleBuy} disabled={ordering}>
                {ordering ? <div className="spinner" style={{width:13,height:13}}/> : '🛒 Buy'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

