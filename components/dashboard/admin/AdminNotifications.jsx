"use client";
// src/components/dashboard/admin/AdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Send, Check, X, Bell, Mail, MessageSquare, Eye, Search } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const CHANNELS = [
  { key:'push',  label:'Push',  icon:<Bell size={14}/>,          color:'#7c3aed', bg:'#f3e8ff' },
  { key:'email', label:'Email', icon:<Mail size={14}/>,          color:'#2181c4', bg:'#dbeafe' },
  { key:'sms',   label:'SMS',   icon:<MessageSquare size={14}/>, color:'#16a34a', bg:'#dcfce7' },
];

const TRIGGERS = ['user_signup','item_posted','order_placed','order_completed','kyc_approved','kyc_rejected','item_sold','item_flagged','password_reset','message_received','listing_expiring','payment_received'];

const STATUS_CFG = {
  active:  { label:'Active',  color:'#16a34a', bg:'#dcfce7' },
  draft:   { label:'Draft',   color:'#ca8a04', bg:'#fef9c3' },
  paused:  { label:'Paused',  color:'#94a3b8', bg:'#f1f5f9' },
};

// Variable chip helper
const VARS = ['{{user_name}}','{{item_title}}','{{amount}}','{{date}}','{{link}}','{{otp}}'];

function TemplateModal({ template, onSave, onClose }) {
  const isEdit = !!template;
  const [form, setForm] = useState(template || {
    name:'', channel:'push', trigger:'user_signup', subject:'', body:'', status:'draft',
  });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const insertVar = (v) => set('body', form.body + v);

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:400, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', padding:28, width:'min(580px,95vw)', zIndex:401, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17 }}>{isEdit ? '✏️ Edit Template' : '➕ New Template'}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
        </div>

        {/* Channel tabs */}
        <div className="form-group">
          <label className="form-label">Channel</label>
          <div style={{ display:'flex', gap:8 }}>
            {CHANNELS.map(c => (
              <button key={c.key} onClick={() => set('channel', c.key)}
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', borderRadius:'var(--radius-md)', border:`2px solid ${form.channel===c.key ? c.color : 'var(--border)'}`, background: form.channel===c.key ? c.bg : 'white', color: form.channel===c.key ? c.color : 'var(--text-muted)', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.15s' }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="form-group" style={{ gridColumn:'1/-1' }}>
            <label className="form-label">Template Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Welcome - New User"/>
          </div>
          <div className="form-group">
            <label className="form-label">Trigger Event</label>
            <select className="form-select" value={form.trigger} onChange={e => set('trigger', e.target.value)}>
              {TRIGGERS.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* Subject (email/push only) */}
        {form.channel !== 'sms' && (
          <div className="form-group">
            <label className="form-label">Subject / Title *</label>
            <input className="form-input" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder={form.channel==='email' ? 'Email subject line' : 'Push notification title'}/>
          </div>
        )}

        {/* Body */}
        <div className="form-group">
          <label className="form-label">
            {form.channel === 'sms' ? 'SMS Body' : form.channel === 'email' ? 'Email Body' : 'Notification Body'}
            {form.channel === 'sms' && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:8 }}>{form.body.length}/160 chars</span>}
          </label>
          {/* Variable chips */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
            <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, alignSelf:'center' }}>Insert:</span>
            {VARS.map(v => (
              <button key={v} onClick={() => insertVar(v)}
                style={{ background:'var(--primary-50)', color:'var(--primary-700)', border:'1px solid var(--primary-200)', borderRadius:99, padding:'2px 10px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'monospace' }}>
                {v}
              </button>
            ))}
          </div>
          <textarea className="form-input" rows={form.channel==='email' ? 6 : 3} value={form.body} onChange={e => set('body', e.target.value)}
            placeholder={`Write your ${form.channel} message here...`} style={{ resize:'vertical', minHeight: form.channel==='email'?120:80, fontFamily:'inherit' }}/>
        </div>

        {/* Preview box */}
        {(form.subject || form.body) && (
          <div style={{ background:'var(--primary-50)', border:'1px solid var(--primary-100)', borderRadius:'var(--radius-md)', padding:14, marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--primary-700)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>👁 Preview</div>
            {form.subject && <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{form.subject}</div>}
            <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{form.body}</div>
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" style={{ flex:1 }} disabled={!form.name || !form.body} onClick={() => onSave(form)}>
            <Check size={14}/> {isEdit ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </>
  );
}

function SendModal({ template, onClose, onSend }) {
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSend = async () => {
    setSending(true);
    await onSend(template.id, target);
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1200);
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:400, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', padding:28, width:'min(420px,94vw)', zIndex:401, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16 }}>🚀 Send Notification</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
        </div>
        <div style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:12, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:13 }}>{template.name}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{template.channel.toUpperCase()} · {template.trigger}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Send To</label>
          <select className="form-select" value={target} onChange={e => setTarget(e.target.value)}>
            <option value="all">All Users</option>
            <option value="buyers">Buyers Only</option>
            <option value="sellers">Sellers Only</option>
            <option value="verified">KYC Verified Only</option>
            <option value="active">Active in Last 7 Days</option>
          </select>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={handleSend} disabled={sending || sent}>
            {sent ? '✓ Sent!' : sending ? 'Sending…' : <><Send size={14}/> Send Now</>}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminNotifications() {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);  // null | 'add' | template obj
  const [sending,   setSending]   = useState(null);  // template to send
  const [search,    setSearch]    = useState('');
  const [filterCh,  setFilterCh]  = useState('all');
  const [logs,      setLogs]      = useState([]);

  useEffect(() => {
    Promise.all([mockAPI.getNotificationTemplates(), mockAPI.getNotificationLogs()])
      .then(([t, l]) => { setTemplates(t); setLogs(l); setLoading(false); });
  }, []);

  const handleSave = async (form) => {
    if (modal === 'add') {
      const newT = await mockAPI.createNotificationTemplate(form);
      setTemplates(prev => [...prev, newT]);
    } else {
      await mockAPI.updateNotificationTemplate(modal.id, form);
      setTemplates(prev => prev.map(t => t.id===modal.id ? { ...t, ...form } : t));
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    await mockAPI.deleteNotificationTemplate(id);
    setTemplates(prev => prev.filter(t => t.id!==id));
  };

  const handleSend = async (id, target) => {
    const log = await mockAPI.sendNotification(id, target);
    setLogs(prev => [log, ...prev]);
    setTemplates(prev => prev.map(t => t.id===id ? { ...t, sentCount:(t.sentCount||0)+1 } : t));
  };

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.trigger.includes(q);
    const matchCh = filterCh==='all' || t.channel===filterCh;
    return matchSearch && matchCh;
  });

  if (loading) return <LoadingSpinner center/>;

  const chCount = (ch) => templates.filter(t => t.channel===ch).length;

  return (
    <div>
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">Notification Management</h2>
          <p className="page-sub">Manage Push · Email · SMS templates</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
          <Plus size={15}/> New Template
        </button>
      </div>

      {/* Summary */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Total Templates', n: templates.length,              c:'#2181c4', bg:'#dbeafe' },
          { l:'Push',            n: chCount('push'),               c:'#7c3aed', bg:'#f3e8ff' },
          { l:'Email',           n: chCount('email'),              c:'#2181c4', bg:'#dbeafe' },
          { l:'SMS',             n: chCount('sms'),                c:'#16a34a', bg:'#dcfce7' },
          { l:'Active',          n: templates.filter(t=>t.status==='active').length, c:'#16a34a', bg:'#dcfce7' },
          { l:'Draft',           n: templates.filter(t=>t.status==='draft').length,  c:'#ca8a04', bg:'#fef9c3' },
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
          <input className="form-input" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:34 }}/>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[{ key:'all', label:'All' }, ...CHANNELS].map(c => (
            <button key={c.key} onClick={() => setFilterCh(c.key)}
              style={{ padding:'7px 14px', borderRadius:'var(--radius-md)', border:`1.5px solid ${filterCh===c.key?'var(--primary-500)':'var(--border)'}`, background: filterCh===c.key?'var(--primary-50)':'white', color: filterCh===c.key?'var(--primary-700)':'var(--text-muted)', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
              {c.icon||null} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:14, marginBottom:24 }}>
        {filtered.map(t => {
          const ch   = CHANNELS.find(c => c.key===t.channel) || CHANNELS[0];
          const sc   = STATUS_CFG[t.status] || STATUS_CFG.draft;
          return (
            <div key={t.id} className="card" style={{ padding:0, overflow:'hidden' }}>
              {/* Card Header */}
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ background:ch.bg, color:ch.color, padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                    {ch.icon} {ch.label}
                  </span>
                  <span style={{ background:sc.bg, color:sc.color, padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>
                    {sc.label}
                  </span>
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>
                  {t.trigger.replace(/_/g,' ')}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontWeight:800, fontSize:14, marginBottom:4, fontFamily:'Syne,sans-serif' }}>{t.name}</div>
                {t.subject && <div style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 }}>📌 {t.subject}</div>}
                <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {t.body}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                    Sent <strong style={{ color:'var(--text-primary)' }}>{(t.sentCount||0).toLocaleString()}</strong> times
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div style={{ display:'flex', gap:0, borderTop:'1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" style={{ flex:1, borderRadius:0, padding:'10px 0', fontSize:12, gap:4, justifyContent:'center', display:'flex', alignItems:'center' }}
                  onClick={() => setModal(t)}><Pencil size={13}/> Edit</button>
                <div style={{ width:1, background:'var(--border)' }}/>
                <button className="btn btn-ghost btn-sm" style={{ flex:1, borderRadius:0, padding:'10px 0', fontSize:12, gap:4, justifyContent:'center', display:'flex', alignItems:'center', color: t.status!=='active'?'#94a3b8':'var(--primary-600)' }}
                  disabled={t.status!=='active'}
                  onClick={() => setSending(t)}><Send size={13}/> Send</button>
                <div style={{ width:1, background:'var(--border)' }}/>
                <button className="btn btn-ghost btn-sm" style={{ flex:1, borderRadius:0, padding:'10px 0', fontSize:12, gap:4, justifyContent:'center', display:'flex', alignItems:'center', color:'#dc2626' }}
                  onClick={() => handleDelete(t.id)}><Trash2 size={13}/> Delete</button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', padding:40, textAlign:'center', color:'var(--text-muted)' }}>
            No templates found. <button className="btn btn-ghost btn-sm" onClick={() => setModal('add')}>Create one →</button>
          </div>
        )}
      </div>

      {/* Recent Send Logs */}
      <div className="card">
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-base)' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13 }}>📋 Recent Send Logs</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Template</th><th>Channel</th><th>Target</th><th>Sent To</th><th>Timestamp</th><th>Status</th></tr>
            </thead>
            <tbody>
              {logs.slice(0,10).map(log => {
                const ch = CHANNELS.find(c => c.key===log.channel);
                return (
                  <tr key={log.id}>
                    <td style={{ fontWeight:600, fontSize:13 }}>{log.templateName}</td>
                    <td>
                      <span style={{ background:ch?.bg||'#f1f5f9', color:ch?.color||'#64748b', padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                        {ch?.icon} {ch?.label||log.channel}
                      </span>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{log.target}</td>
                    <td style={{ fontWeight:700, fontSize:13 }}>{log.sentCount?.toLocaleString()}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'monospace' }}>{log.timestamp}</td>
                    <td>
                      <span style={{ background:'#dcfce7', color:'#16a34a', padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700 }}>Delivered</span>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--text-muted)' }}>No sends yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal && <TemplateModal template={modal==='add'?null:modal} onSave={handleSave} onClose={() => setModal(null)}/>}
      {sending && <SendModal template={sending} onClose={() => setSending(null)} onSend={handleSend}/>}
    </div>
  );
}

