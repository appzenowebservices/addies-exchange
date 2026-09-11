"use client";
// src/components/dashboard/admin/AdminCategories.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import LoadingSpinner from '../../shared/LoadingSpinner';

const ICONS = ['📱','🚗','🏠','👗','⚽','🛋️','📚','📦','🍕','💊','🎮','🎵','🌿','✈️','💎'];

// ✅ FIX: subcategory object ya string dono se naam nikalo
const subName = (s) => (typeof s === 'object' && s !== null) ? s.name : s;

function CategoryRow({ cat, onEdit, onDelete, onToggle }) {
  const [open, setOpen] = useState(false);
  const isActive = cat.status === 'active';
  const subs = cat.subcategories || [];

  return (
    <div className="cat-row">
      <div className="cat-row-main" onClick={() => setOpen(o => !o)}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
          <span style={{ fontSize:26, lineHeight:1 }}>{cat.icon}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>{cat.name}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>
              /{cat.slug} · {subs.length} subcategories
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--primary-700)' }}>{cat.commission}% commission</span>
          <span style={{ background: isActive?'#dcfce7':'#f1f5f9', color: isActive?'#16a34a':'#64748b', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onEdit(cat); }}><Pencil size={13}/></button>
          <button className="btn btn-ghost btn-sm" style={{ color:'#dc2626' }} onClick={e => { e.stopPropagation(); onDelete(cat.id); }}><Trash2 size={13}/></button>
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onToggle(cat.id); }}>
            {isActive ? <ToggleRight size={18} color="#16a34a"/> : <ToggleLeft size={18} color="#94a3b8"/>}
          </button>
          {open ? <ChevronUp size={15} color="#94a3b8"/> : <ChevronDown size={15} color="#94a3b8"/>}
        </div>
      </div>
      {open && (
        <div className="cat-row-subs">
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
            Subcategories
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {subs.length === 0 ? (
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>No subcategories</span>
            ) : subs.map((s, i) => (
              // ✅ FIX: subName() se string nikalo, object directly render mat karo
              <span key={i} style={{ background:'var(--primary-50)', color:'var(--primary-700)', padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:600 }}>
                {subName(s)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryModal({ cat, onSave, onClose }) {
  // ✅ FIX: subcategories normalize karo — objects ko string names mein convert karo
  const normalizeSubs = (subs) => (subs || []).map(s => subName(s)).filter(Boolean);

  const [form, setForm] = useState(
    cat
      ? { ...cat, subcategories: normalizeSubs(cat.subcategories) }
      : { name:'', slug:'', icon:'📦', commission:7, subcategories:[] }
  );
  const [subInput, setSubInput] = useState('');
  const isEdit = !!cat;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const autoSlug = v => v.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');

  const addSub = () => {
    const s = subInput.trim();
    if (s && !form.subcategories.includes(s)) {
      set('subcategories', [...form.subcategories, s]);
      setSubInput('');
    }
  };
  const removeSub = s => set('subcategories', form.subcategories.filter(x => x !== s));

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:'var(--radius-xl)', padding:28, width:'min(500px,94vw)', zIndex:301, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17 }}>{isEdit ? '✏️ Edit Category' : '➕ Add Category'}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
        </div>

        {/* Icon picker */}
        <div className="form-group">
          <label className="form-label">Icon</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => set('icon', ic)}
                style={{ width:42, height:42, fontSize:22, border:`2px solid ${form.icon===ic?'var(--primary-500)':'var(--border)'}`, borderRadius:'var(--radius-md)', background: form.icon===ic?'var(--primary-50)':'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={e => { set('name', e.target.value); if (!isEdit) set('slug', autoSlug(e.target.value)); }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Slug</label>
            <input className="form-input" value={form.slug} onChange={e => set('slug', autoSlug(e.target.value))}/>
          </div>
          <div className="form-group">
            <label className="form-label">Commission %</label>
            <input className="form-input" type="number" min="0" max="50" value={form.commission} onChange={e => set('commission', +e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input className="form-input" type="number" min="1" value={form.order||1} onChange={e => set('order', +e.target.value)}/>
          </div>
        </div>

        {/* Subcategories */}
        <div className="form-group">
          <label className="form-label">Subcategories</label>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <input className="form-input" style={{ flex:1 }} placeholder="Add subcategory…" value={subInput}
              onChange={e => setSubInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && addSub()}/>
            <button className="btn btn-secondary btn-sm" onClick={addSub}><Plus size={14}/></button>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {form.subcategories.map((s, i) => (
              <span key={i} style={{ background:'var(--primary-50)', color:'var(--primary-700)', padding:'4px 10px', borderRadius:99, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                {s}
                <button onClick={() => removeSub(s)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary-400)', display:'flex', alignItems:'center', padding:0 }}><X size={12}/></button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" style={{ flex:1 }} disabled={!form.name} onClick={() => onSave(form)}>
            <Check size={14}/> {isEdit ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminCategories() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [busy,    setBusy]    = useState(null);

  useEffect(() => {
    mockAPI.getAdminCategories().then(c => { setCats(c); setLoading(false); });
  }, []);

  const handleSave = async (form) => {
    setBusy('save');
    if (modal === 'add') {
      const newCat = await mockAPI.addCategory(form);
      setCats(prev => [...prev, newCat]);
    } else {
      await mockAPI.updateCategory(modal.id, form);
      setCats(prev => prev.map(c => c.id===modal.id ? { ...c, ...form } : c));
    }
    setBusy(null); setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await mockAPI.deleteCategory(id);
    setCats(prev => prev.filter(c => c.id!==id));
  };

  const handleToggle = async (id) => {
    setCats(prev => prev.map(c => c.id===id ? { ...c, status: c.status==='active'?'inactive':'active' } : c));
    await mockAPI.updateCategory(id, { status: cats.find(c=>c.id===id)?.status==='active' ? 'inactive' : 'active' });
  };

  if (loading) return <LoadingSpinner center/>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">Category Management</h2>
          <p className="page-sub">{cats.length} categories configured</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
          <Plus size={15}/> Add Category
        </button>
      </div>

      {/* Summary */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Total',          n: cats.length,                                        c:'#2181c4', bg:'#dbeafe' },
          { l:'Active',         n: cats.filter(c=>c.status==='active').length,         c:'#16a34a', bg:'#dcfce7' },
          { l:'Inactive',       n: cats.filter(c=>c.status!=='active').length,         c:'#94a3b8', bg:'#f1f5f9' },
          { l:'Avg Commission', n: cats.length ? Math.round(cats.reduce((a,c)=>a+c.commission,0)/cats.length)+'%' : '0%', c:'#7c3aed', bg:'#f3e8ff' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, color:s.c, padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700, display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:16 }}>{s.n}</span>{s.l}
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {cats.sort((a,b) => (a.order||0)-(b.order||0)).map(cat => (
            <CategoryRow key={cat.id} cat={cat} onEdit={setModal} onDelete={handleDelete} onToggle={handleToggle}/>
          ))}
        </div>
      </div>

      {modal && (
        <CategoryModal
          cat={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        .cat-row { border-bottom: 1px solid var(--border); }
        .cat-row:last-child { border-bottom: none; }
        .cat-row-main { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; cursor:pointer; gap:12px; flex-wrap:wrap; transition:background 0.15s; }
        .cat-row-main:hover { background: var(--primary-50); }
        .cat-row-subs { padding:0 20px 16px 72px; }
      `}</style>
    </div>
  );
}

