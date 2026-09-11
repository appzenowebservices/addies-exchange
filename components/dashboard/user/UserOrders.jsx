"use client";
// src/components/dashboard/user/UserOrders.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { mockAPI } from '../../../server/trpcClient';
import EmptyState from '../../shared/EmptyState';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function UserOrders() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bought'); // bought | sold

  useEffect(() => {
    mockAPI.getMyOrders(user.id).then(o => { setOrders(o); setLoading(false); });
  }, [user.id]);

  if (loading) return <LoadingSpinner center />;

  const bought = orders.filter(o => o.buyerId  === user.id);
  const sold   = orders.filter(o => o.sellerId === user.id);
  const shown  = tab === 'bought' ? bought : sold;
  const formatP = n => '₹' + n.toLocaleString('en-IN');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Orders</h2>
          <p className="page-sub">Track your purchases and sales</p>
        </div>
      </div>

      {user.canBuy && user.canSell && (
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--primary-50)', borderRadius:99, padding:4, width:'fit-content', border:'1.5px solid var(--primary-200)' }}>
          {[['bought','🛒 Purchased',bought.length],['sold','🏪 Sales',sold.length]].map(([t,l,c]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'8px 20px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, transition:'all 0.2s', background: tab===t?'white':'transparent', color: tab===t?'var(--primary-700)':'var(--text-secondary)', boxShadow: tab===t?'var(--shadow-sm)':'none' }}>
              {l} ({c})
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState
          icon={tab==='bought'?'🛒':'🏪'}
          title={tab==='bought'?'No Purchases Yet':'No Sales Yet'}
          desc={tab==='bought'?'Browse the marketplace to find great deals.':'Your listings haven\'t sold yet. Keep going!'}
          action={tab==='bought' && <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Marketplace</button>}
        />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th><th>Item</th>
                  {tab==='bought'?<th>Seller</th>:<th>Buyer</th>}
                  <th>Amount</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-muted)' }}>#{order.id}</td>
                    <td style={{ fontWeight:600, fontSize:13 }}>{order.itemTitle}</td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{tab==='bought'?order.sellerId:order.buyerId}</td>
                    <td style={{ fontWeight:700, color:'var(--primary-700)' }}>{formatP(order.price)}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{order.date}</td>
                    <td><span className={`badge ${order.status==='completed'?'badge-green':order.status==='pending'?'badge-orange':'badge-gray'}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

