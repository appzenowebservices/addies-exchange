"use client";
// src/components/dashboard/admin/AdminChatMonitor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Flag, Eye, Ban, Search, Filter, AlertTriangle, CheckCircle, MessageSquare, X, Shield } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const FLAG_REASONS = ['Spam', 'Abusive Language', 'Fraud / Scam', 'Harassment', 'Hate Speech', 'Other'];

const STATUS_CFG = {
  clean:     { label: 'Clean',     color: '#16a34a', bg: '#dcfce7' },
  flagged:   { label: 'Flagged',   color: '#dc2626', bg: '#fee2e2' },
  reviewed:  { label: 'Reviewed',  color: '#ca8a04', bg: '#fef9c3' },
  blocked:   { label: 'Blocked',   color: '#7c3aed', bg: '#f3e8ff' },
};

function FlagModal({ conv, onClose, onFlag }) {
  const [reason, setReason] = useState(FLAG_REASONS[0]);
  const [note,   setNote]   = useState('');
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:400, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', padding:28, width:'min(440px,94vw)', zIndex:401, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16 }}>🚩 Flag Conversation</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
        </div>
        <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
          Flagging: <strong>{conv.user1}</strong> ↔ <strong>{conv.user2}</strong>
        </div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <select className="form-select" value={reason} onChange={e => setReason(e.target.value)}>
            {FLAG_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Admin Note (optional)</label>
          <textarea className="form-input" rows={3} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add context for this flag..." style={{ resize:'vertical', minHeight:80 }}/>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm" style={{ flex:1 }} onClick={() => onFlag(conv.id, reason, note)}>
            <Flag size={14}/> Confirm Flag
          </button>
        </div>
      </div>
    </>
  );
}

function ConvDetailModal({ conv, onClose, onFlag, onBlock, onMarkReviewed }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [conv]);
  const sc = STATUS_CFG[conv.status] || STATUS_CFG.clean;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:400, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', width:'min(680px,96vw)', maxHeight:'90vh', display:'flex', flexDirection:'column', zIndex:401, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        {/* Modal Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-base)', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15 }}>💬 Conversation View</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
              {conv.user1} ↔ {conv.user2} · {conv.messages.length} messages · re: {conv.itemTitle}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ background:sc.bg, color:sc.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>{sc.label}</span>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
          {conv.messages.map((msg, i) => {
            const isUser1 = msg.sender === conv.user1;
            return (
              <div key={i} style={{ display:'flex', flexDirection: isUser1 ? 'row' : 'row-reverse', gap:10, alignItems:'flex-end' }}>
                <div style={{ width:32, height:32, borderRadius:50, background: isUser1 ? 'var(--primary-100)' : '#fce7f3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color: isUser1 ? 'var(--primary-700)' : '#be185d', flexShrink:0 }}>
                  {msg.sender.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{ maxWidth:'65%' }}>
                  <div style={{
                    background: msg.flagged ? '#fee2e2' : isUser1 ? 'var(--primary-50)' : '#f8fafc',
                    border: msg.flagged ? '1.5px solid #fca5a5' : '1px solid var(--border)',
                    borderRadius: isUser1 ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                    padding:'10px 14px', fontSize:13, color:'var(--text-primary)', lineHeight:1.5
                  }}>
                    {msg.flagged && <div style={{ fontSize:10, color:'#dc2626', fontWeight:700, marginBottom:4 }}>⚠ AUTO-FLAGGED</div>}
                    {msg.text}
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3, textAlign: isUser1 ? 'left' : 'right' }}>{msg.time}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>

        {/* Action Bar */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', background:'var(--bg-base)', display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
          <button className="btn btn-danger btn-sm" onClick={() => onFlag(conv)}>
            <Flag size={13}/> Flag
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onBlock(conv.id)} style={{ color:'#7c3aed' }}>
            <Ban size={13}/> Block Users
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onMarkReviewed(conv.id)}>
            <CheckCircle size={13}/> Mark Reviewed
          </button>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft:'auto' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminChatMonitor() {
  const [convs,       setConvs]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState('all');
  const [selected,    setSelected]    = useState(null);   // conv to view
  const [flagging,    setFlagging]    = useState(null);   // conv to flag

  useEffect(() => {
    mockAPI.getConversations().then(r => { setConvs(r); setLoading(false); });
  }, []);

  const handleFlag = async (id, reason, note) => {
    await mockAPI.flagConversation(id, reason, note);
    setConvs(prev => prev.map(c => c.id===id ? { ...c, status:'flagged', flagReason:reason, adminNote:note } : c));
    setFlagging(null);
    setSelected(prev => prev?.id===id ? { ...prev, status:'flagged', flagReason:reason } : prev);
  };

  const handleBlock = async (id) => {
    if (!confirm('Block both users in this conversation?')) return;
    await mockAPI.blockConversation(id);
    setConvs(prev => prev.map(c => c.id===id ? { ...c, status:'blocked' } : c));
    setSelected(prev => prev?.id===id ? { ...prev, status:'blocked' } : prev);
  };

  const handleMarkReviewed = async (id) => {
    await mockAPI.reviewConversation(id);
    setConvs(prev => prev.map(c => c.id===id ? { ...c, status:'reviewed' } : c));
    setSelected(prev => prev?.id===id ? { ...prev, status:'reviewed' } : prev);
  };

  const filtered = convs.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.user1.toLowerCase().includes(q) || c.user2.toLowerCase().includes(q) || c.itemTitle.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <LoadingSpinner center/>;

  const counts = { total: convs.length, flagged: convs.filter(c=>c.status==='flagged').length, reviewed: convs.filter(c=>c.status==='reviewed').length, blocked: convs.filter(c=>c.status==='blocked').length };

  return (
    <div>
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">Chat Monitoring</h2>
          <p className="page-sub">Monitor conversations · Flag suspicious activity</p>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Total Chats',  n: counts.total,    c:'#2181c4', bg:'#dbeafe' },
          { l:'Flagged',      n: counts.flagged,  c:'#dc2626', bg:'#fee2e2' },
          { l:'Reviewed',     n: counts.reviewed, c:'#ca8a04', bg:'#fef9c3' },
          { l:'Blocked',      n: counts.blocked,  c:'#7c3aed', bg:'#f3e8ff' },
          { l:'Clean',        n: convs.filter(c=>c.status==='clean').length, c:'#16a34a', bg:'#dcfce7' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, color:s.c, padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700, display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:15 }}>{s.n}</span>{s.l}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="form-input" placeholder="Search users or item..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft:34 }}/>
        </div>
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width:'auto', minWidth:130 }}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Conversation List */}
      <div className="card">
        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 100px', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-base)' }}>
          {['Participants', 'Item', 'Messages', 'Status', 'Actions'].map((h,i) => (
            <div key={i} style={{ fontSize:10, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>No conversations found</div>
        ) : filtered.map(conv => {
          const sc = STATUS_CFG[conv.status] || STATUS_CFG.clean;
          const hasAutoFlag = conv.messages?.some(m => m.flagged);
          return (
            <div key={conv.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 100px', gap:8, padding:'14px 20px', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
              {/* Participants */}
              <div>
                <div style={{ fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                  {conv.user1} ↔ {conv.user2}
                  {hasAutoFlag && <AlertTriangle size={12} color="#dc2626" title="Auto-flagged message"/>}
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{conv.lastActivity}</div>
              </div>
              {/* Item */}
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600 }}>{conv.itemTitle}</div>
              {/* Message count */}
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
                <MessageSquare size={13} color="var(--text-muted)"/>
                {conv.messages.length}
              </div>
              {/* Status */}
              <span style={{ background:sc.bg, color:sc.color, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, display:'inline-block' }}>{sc.label}</span>
              {/* Actions */}
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn-ghost btn-sm" title="View conversation" onClick={() => setSelected(conv)} style={{ padding:'6px 8px' }}>
                  <Eye size={14}/>
                </button>
                <button className="btn btn-ghost btn-sm" title="Flag" onClick={() => setFlagging(conv)} style={{ padding:'6px 8px', color:'#dc2626' }}>
                  <Flag size={14}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <ConvDetailModal
          conv={selected}
          onClose={() => setSelected(null)}
          onFlag={conv => { setSelected(null); setFlagging(conv); }}
          onBlock={handleBlock}
          onMarkReviewed={handleMarkReviewed}
        />
      )}

      {/* Flag Modal */}
      {flagging && (
        <FlagModal
          conv={flagging}
          onClose={() => setFlagging(null)}
          onFlag={handleFlag}
        />
      )}
    </div>
  );
}

