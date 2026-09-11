"use client";
// src/components/dashboard/user/UserListings.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockAPI } from '../../../server/trpcClient';
import EmptyState  from '../../shared/EmptyState';
import LoadingSpinner from '../../shared/LoadingSpinner';

export default function UserListings() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    mockAPI.getMyListings(user.id).then(l => { setListings(l); setLoading(false); });
  }, [user.id]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    setDeleting(id);
    await mockAPI.deleteItem(id);
    setListings(prev => prev.filter(l => l.id !== id));
    setDeleting(null);
  };

  if (loading) return <LoadingSpinner center />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Listings ({listings.length})</h2>
          <p className="page-sub">Manage your active listings</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/add-item')}>
          <Plus size={16}/> Add New Listing
        </button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon="📦" title="No Listings Yet"
          desc="Start selling by creating your first listing."
          action={<button className="btn btn-primary" onClick={() => navigate('/dashboard/add-item')}><Plus size={15}/> Create Listing</button>}
        />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
          {listings.map(item => (
            <div key={item.id} className="card" style={{ overflow:'visible' }}>
              <div style={{ padding:'20px 20px 14px', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <span style={{ fontSize:36 }}>{item.image}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{item.title}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <span className="badge badge-blue" style={{fontSize:10}}>{item.category}</span>
                      <span className={`badge ${item.status==='active'?'badge-green':'badge-gray'}`} style={{fontSize:10}}>{item.status}</span>
                      <span className="badge badge-gray" style={{fontSize:10}}>{item.condition}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily:'Roboto,sans-serif', fontSize:20, fontWeight:800, color:'var(--primary-700)' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
                <div style={{ display:'flex', gap:12, color:'var(--text-muted)', fontSize:12 }}>
                  <span>📍 {item.city}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:3 }}><Eye size={12}/> {item.views} views</span>
                  <span>📅 {item.createdAt}</span>
                </div>
              </div>
              <div className="divider" />
              <div style={{ padding:'12px 16px', display:'flex', gap:8 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex:1 }}>
                  <Edit size={13}/> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} disabled={deleting===item.id}>
                  {deleting===item.id ? <div className="spinner" style={{width:13,height:13,borderColor:'rgba(0,0,0,0.2)',borderTopColor:'#dc2626'}} /> : <Trash2 size={13}/>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

