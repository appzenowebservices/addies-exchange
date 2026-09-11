"use client";
// src/components/dashboard/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockAPI.getAllOrders().then(o => { setOrders(o); setLoading(false); });
  }, []);

  const formatPrice = n => '₹' + n.toLocaleString('en-IN');

  if (loading) return <LoadingSpinner center />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">All Orders ({orders.length})</h2>
          <p className="page-sub">Platform-wide order history</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Item</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-muted)' }}>#{order.id}</td>
                  <td style={{ fontWeight:600, fontSize:13 }}>{order.itemTitle}</td>
                  <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{order.buyerId}</td>
                  <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{order.sellerId}</td>
                  <td style={{ fontWeight:700, color:'var(--primary-700)' }}>{formatPrice(order.price)}</td>
                  <td style={{ fontSize:12, color:'var(--text-muted)' }}>{order.date}</td>
                  <td>
                    <span className={`badge ${order.status==='completed'?'badge-green':order.status==='pending'?'badge-orange':'badge-gray'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

