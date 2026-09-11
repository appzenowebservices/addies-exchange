"use client";
// src/components/dashboard/user/profile/sections/BuyerSection.jsx
import React, { useState } from 'react';
import { ShoppingBag, Heart, ShoppingCart, MessageSquare, Clock } from 'lucide-react';

const MOCK_WISHLIST = [
  { id:1, title:'Samsung Galaxy S24', price:72000, image:'📱', city:'Mumbai' },
  { id:2, title:'Honda Activa 6G',    price:78000, image:'🛵', city:'Delhi'  },
];
const MOCK_CART    = [
  { id:1, title:'Sony WH-1000XM5', price:18500, qty:1, image:'🎧' },
];
const MOCK_HISTORY = [
  { id:'o1', title:'iPhone 14 Pro', price:85000, status:'completed', date:'2024-11-20' },
  { id:'o2', title:'MacBook Air M2', price:95000, status:'pending',   date:'2024-12-15' },
];

export default function BuyerSection({ data }) {
  const [tab, setTab] = useState('wishlist');

  const tabs = [
    { id:'wishlist', label:'Wishlist',   icon:<Heart size={13}/>,        count: MOCK_WISHLIST.length },
    { id:'cart',     label:'Cart',       icon:<ShoppingCart size={13}/>, count: MOCK_CART.length    },
    { id:'history',  label:'Purchases',  icon:<Clock size={13}/>,        count: MOCK_HISTORY.length },
    { id:'chats',    label:'Chats',      icon:<MessageSquare size={13}/>,count: 3                   },
  ];

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title"><ShoppingBag size={16}/>Buyer Activity</span>
      </div>
      <div className="profile-section-body">

        {/* Sub-tabs */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} type="button"
              className={`btn btn-sm ${tab===t.id?'btn-primary':'btn-secondary'}`}
              onClick={() => setTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:5 }}>
              {t.icon}{t.label}
              <span style={{ background: tab===t.id?'rgba(255,255,255,0.25)':'var(--primary-100)', color: tab===t.id?'white':'var(--primary-700)', borderRadius:99, padding:'1px 7px', fontSize:11, fontWeight:800 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Wishlist */}
        {tab === 'wishlist' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {MOCK_WISHLIST.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:'var(--primary-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                <span style={{ fontSize:32 }}>{item.image}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{item.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>📍 {item.city}</div>
                </div>
                <div style={{ fontWeight:800, color:'var(--primary-700)', fontSize:15 }}>₹{item.price.toLocaleString('en-IN')}</div>
                <button className="btn btn-danger btn-sm">💔</button>
              </div>
            ))}
          </div>
        )}

        {/* Cart */}
        {tab === 'cart' && (
          <div>
            {MOCK_CART.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:'var(--primary-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', marginBottom:8 }}>
                <span style={{ fontSize:32 }}>{item.image}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{item.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>Qty: {item.qty}</div>
                </div>
                <div style={{ fontWeight:800, color:'var(--primary-700)', fontSize:15 }}>₹{item.price.toLocaleString('en-IN')}</div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
              <button className="btn btn-primary">🛒 Checkout</button>
            </div>
          </div>
        )}

        {/* Purchase History */}
        {tab === 'history' && (
          <div>
            {MOCK_HISTORY.map(order => (
              <div key={order.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{order.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{order.date}</div>
                </div>
                <div style={{ fontWeight:700, color:'var(--primary-700)' }}>₹{order.price.toLocaleString('en-IN')}</div>
                <span className={`badge ${order.status==='completed'?'badge-green':'badge-orange'}`}>{order.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chats */}
        {tab === 'chats' && (
          <div>
            {[
              { name:'Ravi Kumar', item:'iPhone 14 Pro', time:'2 hrs ago', unread:2 },
              { name:'Priya Sharma', item:'MacBook Air M2', time:'Yesterday', unread:0 },
              { name:'Amit Patel', item:'Royal Enfield', time:'Dec 12', unread:1 },
            ].map((chat,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary-400),var(--primary-600))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:15 }}>{chat.name[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{chat.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Re: {chat.item}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{chat.time}</div>
                  {chat.unread > 0 && <span style={{ background:'var(--primary-500)', color:'white', borderRadius:99, width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>{chat.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

