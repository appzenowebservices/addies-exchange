"use client";
// src/components/dashboard/admin/AdminCMS.jsx
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, X, Check, Pencil } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const PAGE_ICONS = { terms: '📜', privacy: '🔒', faq: '❓', about: 'ℹ️', refund: '💸', contact: '📞' };

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', background: value ? 'var(--primary-500)' : '#e2e8f0', position:'relative', transition:'all 0.2s', flexShrink:0 }}>
      <span style={{ position:'absolute', top:3, left: value ? 23 : 3, width:18, height:18, borderRadius:50, background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </button>
  );
}

// FAQ item row
function FAQItem({ item, index, onChange, onDelete, onMove, total }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden', marginBottom:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'var(--bg-base)', cursor:'pointer' }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize:12, fontWeight:800, color:'var(--text-muted)', minWidth:22 }}>Q{index+1}</span>
        <div style={{ flex:1, fontWeight:600, fontSize:13 }}>{item.question || <span style={{ color:'var(--text-muted)' }}>Untitled question…</span>}</div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={e => { e.stopPropagation(); onMove(index, -1); }} disabled={index===0}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', opacity: index===0?0.3:1 }}><ChevronUp size={14}/></button>
          <button onClick={e => { e.stopPropagation(); onMove(index, 1); }} disabled={index===total-1}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', opacity: index===total-1?0.3:1 }}><ChevronDown size={14}/></button>
          <button onClick={e => { e.stopPropagation(); onDelete(index); }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#dc2626' }}><Trash2 size={13}/></button>
        </div>
        {open ? <ChevronUp size={14} color="#94a3b8"/> : <ChevronDown size={14} color="#94a3b8"/>}
      </div>
      {open && (
        <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:10 }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Question</label>
            <input className="form-input" value={item.question} onChange={e => onChange(index, 'question', e.target.value)} placeholder="Enter question…"/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Answer</label>
            <textarea className="form-input" rows={3} value={item.answer} onChange={e => onChange(index, 'answer', e.target.value)}
              placeholder="Enter answer…" style={{ resize:'vertical', minHeight:72, fontFamily:'inherit' }}/>
          </div>
        </div>
      )}
    </div>
  );
}

// Rich-text-like editor (textarea with formatting toolbar)
function ContentEditor({ value, onChange }) {
  const ref = React.useRef(null);

  const wrap = (before, after='') => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const sel = value.slice(start, end) || 'text';
    const newVal = value.slice(0, start) + before + sel + (after||before) + value.slice(end);
    onChange(newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, start + before.length + sel.length); }, 0);
  };

  const tools = [
    { label:'H2',   action: () => wrap('\n## ', '\n') },
    { label:'H3',   action: () => wrap('\n### ', '\n') },
    { label:'B',    action: () => wrap('**') },
    { label:'I',    action: () => wrap('*') },
    { label:'• List', action: () => wrap('\n- ') },
    { label:'1. List', action: () => wrap('\n1. ') },
    { label:'---', action: () => onChange(value + '\n\n---\n\n') },
  ];

  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
      {/* Toolbar */}
      <div style={{ display:'flex', gap:4, padding:'8px 10px', background:'var(--bg-base)', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
        {tools.map((t,i) => (
          <button key={i} onClick={t.action}
            style={{ padding:'3px 10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'white', cursor:'pointer', fontSize:11, fontWeight:700, color:'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text-muted)', alignSelf:'center' }}>Markdown supported</span>
      </div>
      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
        style={{ width:'100%', minHeight:340, padding:14, border:'none', fontFamily:'monospace', fontSize:13, lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box' }}
        placeholder="Write content here… Markdown is supported.&#10;&#10;## Section Heading&#10;&#10;Paragraph text goes here.&#10;&#10;- Bullet point&#10;- Another point"/>
    </div>
  );
}

// Markdown preview (basic)
function Preview({ content }) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 style="margin:16px 0 6px;font-size:15px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="margin:20px 0 8px;font-size:18px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="margin:24px 0 10px;font-size:22px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;margin-left:20px">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;margin-left:20px">$1</li>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>')
    .replace(/\n\n/g, '</p><p style="margin:8px 0">')
    .replace(/\n/g, '<br/>');
  return (
    <div style={{ padding:20, minHeight:340, lineHeight:1.7, fontSize:14, color:'var(--text-primary)' }}
      dangerouslySetInnerHTML={{ __html: '<p style="margin:8px 0">' + html + '</p>' }}/>
  );
}

export default function AdminCMS() {
  const [pages,   setPages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(null);   // selected page id
  const [preview, setPreview] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [newSlug, setNewSlug] = useState('');

  useEffect(() => {
    mockAPI.getCMSPages().then(p => { setPages(p); setActive(p[0]?.id); setLoading(false); });
  }, []);

  const activePage = pages.find(p => p.id === active);

  const updatePage = (field, value) => {
    setPages(prev => prev.map(p => p.id === active ? { ...p, [field]: value } : p));
  };

  const handleSave = async () => {
    await mockAPI.saveCMSPage(activePage);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // FAQ helpers
  const addFAQ    = () => updatePage('faqs', [...(activePage.faqs||[]), { question:'', answer:'' }]);
  const deleteFAQ = (i) => updatePage('faqs', activePage.faqs.filter((_,idx) => idx!==i));
  const changeFAQ = (i, field, val) => updatePage('faqs', activePage.faqs.map((f,idx) => idx===i ? {...f,[field]:val} : f));
  const moveFAQ   = (i, dir) => {
    const arr = [...activePage.faqs];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    updatePage('faqs', arr);
  };

  const handleAddPage = () => {
    const slug = newSlug.trim().toLowerCase().replace(/\s+/g,'-');
    if (!slug) return;
    const newPage = { id: `page_${Date.now()}`, slug, title: slug.replace(/-/g,' ').replace(/\b\w/g, c=>c.toUpperCase()), content:'', published:false, faqs:[], lastEdited: new Date().toISOString().split('T')[0] };
    setPages(prev => [...prev, newPage]);
    setActive(newPage.id);
    setNewSlug(''); setAdding(false);
  };

  if (loading) return <LoadingSpinner center/>;

  return (
    <div style={{ display:'flex', gap:16, height:'calc(100vh - 140px)', minHeight:500 }}>

      {/* Sidebar — page list */}
      <div style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Pages</div>
        {pages.map(p => (
          <button key={p.id} onClick={() => { setActive(p.id); setPreview(false); }}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--radius-md)', border:`1.5px solid ${active===p.id?'var(--primary-400)':'var(--border)'}`, background: active===p.id?'var(--primary-50)':'white', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
            <span style={{ fontSize:18 }}>{PAGE_ICONS[p.slug] || '📄'}</span>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontWeight:700, fontSize:13, color: active===p.id?'var(--primary-700)':'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</div>
              <div style={{ fontSize:10, marginTop:1 }}>
                <span style={{ background: p.published?'#dcfce7':'#f1f5f9', color: p.published?'#16a34a':'#94a3b8', padding:'1px 6px', borderRadius:99, fontWeight:700 }}>
                  {p.published ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>
          </button>
        ))}

        {/* Add page */}
        {adding ? (
          <div style={{ display:'flex', gap:6, marginTop:4 }}>
            <input className="form-input" style={{ flex:1, fontSize:12, padding:'6px 8px' }} placeholder="slug (e.g. refund)" value={newSlug} onChange={e => setNewSlug(e.target.value)} onKeyDown={e => e.key==='Enter' && handleAddPage()} autoFocus/>
            <button className="btn btn-ghost btn-sm" onClick={handleAddPage} style={{ padding:'6px 8px', color:'#16a34a' }}><Check size={14}/></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)} style={{ padding:'6px 8px' }}><X size={14}/></button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm" style={{ marginTop:4, justifyContent:'flex-start', color:'var(--primary-600)' }} onClick={() => setAdding(true)}>
            <Plus size={14}/> Add Page
          </button>
        )}
      </div>

      {/* Editor area */}
      {activePage && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12, overflow:'hidden' }}>
          {/* Top bar */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <div style={{ flex:1 }}>
              <input className="form-input" style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, padding:'8px 12px' }}
                value={activePage.title} onChange={e => updatePage('title', e.target.value)}/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>Published</span>
              <Toggle value={activePage.published} onChange={v => updatePage('published', v)}/>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview(p => !p)}>
              {preview ? <><EyeOff size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              {saved ? '✓ Saved!' : <><Save size={14}/> Save</>}
            </button>
          </div>

          {/* Slug + last edited */}
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>
              🔗 <strong>/pages/{activePage.slug}</strong>
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Last edited: {activePage.lastEdited}</div>
          </div>

          {/* Content area */}
          <div className="card" style={{ flex:1, padding:0, overflow:'auto' }}>
            {activePage.slug === 'faq' ? (
              /* FAQ special editor */
              <div style={{ padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14 }}>❓ FAQ Items ({activePage.faqs?.length||0})</div>
                  <button className="btn btn-primary btn-sm" onClick={addFAQ}><Plus size={14}/> Add Question</button>
                </div>
                {(activePage.faqs||[]).length === 0 ? (
                  <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
                    No FAQs yet. <button className="btn btn-ghost btn-sm" onClick={addFAQ}>Add first question →</button>
                  </div>
                ) : (activePage.faqs||[]).map((faq,i) => (
                  <FAQItem key={i} item={faq} index={i} total={activePage.faqs.length}
                    onChange={changeFAQ} onDelete={deleteFAQ} onMove={moveFAQ}/>
                ))}
              </div>
            ) : preview ? (
              <Preview content={activePage.content}/>
            ) : (
              <ContentEditor value={activePage.content} onChange={v => updatePage('content', v)}/>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

