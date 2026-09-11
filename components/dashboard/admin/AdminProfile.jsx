"use client";
// src/components/dashboard/admin/AdminProfile.jsx
import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Shield, Monitor, Smartphone, Globe, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { mockAPI } from '../../../server/trpcClient';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../shared/LoadingSpinner';

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile,   setProfile]   = useState(null);
  const [activity,  setActivity]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('info');
  const [saved,     setSaved]     = useState(false);
  const [showPwd,   setShowPwd]   = useState({ current:false, new:false, confirm:false });
  const [form,      setForm]      = useState({});
  const [pwdForm,   setPwdForm]   = useState({ current:'', new:'', confirm:'' });
  const [pwdError,  setPwdError]  = useState('');
  const [twoFA,     setTwoFA]     = useState(false);

  useEffect(() => {
    Promise.all([mockAPI.getAdminProfile(), mockAPI.getLoginActivity()])
      .then(([p, a]) => { setProfile(p); setForm({ name: p.name, email: p.email, phone: p.phone||'', city: p.city||'' }); setActivity(a); setLoading(false); });
  }, []);

  const handleSaveInfo = async () => {
    await mockAPI.updateAdminProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePwd = () => {
    if (!pwdForm.current) return setPwdError('Enter current password');
    if (pwdForm.new.length < 6) return setPwdError('New password must be at least 6 characters');
    if (pwdForm.new !== pwdForm.confirm) return setPwdError('Passwords do not match');
    setPwdError('');
    setSaved(true);
    setPwdForm({ current:'', new:'', confirm:'' });
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { key:'info',     label:'Basic Info'  },
    { key:'security', label:'Security'    },
    { key:'activity', label:'Login Activity' },
  ];

  if (loading) return <LoadingSpinner center/>;

  return (
    <div style={{ maxWidth:720 }}>
      <div className="page-header" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div className="avatar avatar-lg" style={{ background:'linear-gradient(135deg,var(--primary-500),var(--primary-700))', color:'white', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20 }}>
            {profile?.avatar}
          </div>
          <div>
            <h2 className="page-title">{profile?.name}</h2>
            <p className="page-sub">🛡 Super Admin · {profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--bg-base)', padding:4, borderRadius:'var(--radius-lg)', width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding:'8px 18px', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13, transition:'all 0.2s',
              background: tab===t.key ? 'white' : 'transparent',
              color:      tab===t.key ? 'var(--primary-700)' : 'var(--text-muted)',
              boxShadow:  tab===t.key ? 'var(--shadow-sm)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {tab === 'info' && (
        <div className="card">
          <div className="card-header"><span style={{ fontFamily:'Syne,sans-serif', fontWeight:800 }}>👤 Basic Information</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                { label:'Full Name', key:'name',  type:'text'  },
                { label:'Email',     key:'email', type:'email' },
                { label:'Phone',     key:'phone', type:'tel'   },
                { label:'City',      key:'city',  type:'text'  },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} value={form[f.key]||''} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}/>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value="Super Admin" disabled style={{ opacity:0.6 }}/>
            </div>
            <div className="form-group">
              <label className="form-label">Admin ID</label>
              <input className="form-input" value={profile?.id} disabled style={{ opacity:0.6, fontFamily:'monospace' }}/>
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start' }} onClick={handleSaveInfo}>
              {saved ? '✓ Saved!' : <><Save size={14}/> Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Change password */}
          <div className="card">
            <div className="card-header"><span style={{ fontFamily:'Syne,sans-serif', fontWeight:800 }}>🔐 Change Password</span></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'Current Password', key:'current' },
                { label:'New Password',     key:'new'     },
                { label:'Confirm Password', key:'confirm' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <div style={{ position:'relative' }}>
                    <input className="form-input" type={showPwd[f.key]?'text':'password'}
                      value={pwdForm[f.key]} onChange={e => setPwdForm(p => ({...p, [f.key]: e.target.value}))}
                      style={{ paddingRight:40 }}/>
                    <button onClick={() => setShowPwd(p => ({...p, [f.key]: !p[f.key]}))}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                      {showPwd[f.key] ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
              ))}
              {pwdError && <div style={{ color:'#dc2626', fontSize:12, fontWeight:600 }}>⚠ {pwdError}</div>}
              <button className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start' }} onClick={handleChangePwd}>
                {saved ? '✓ Password Changed!' : <><Shield size={14}/> Update Password</>}
              </button>
            </div>
          </div>

          {/* 2FA */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800 }}>🔑 Two-Factor Authentication</span>
              <button onClick={() => setTwoFA(t => !t)}
                style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', background: twoFA?'var(--primary-500)':'#e2e8f0', position:'relative', transition:'all 0.2s' }}>
                <span style={{ position:'absolute', top:3, left: twoFA?23:3, width:18, height:18, borderRadius:50, background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
              </button>
            </div>
            <div style={{ padding:'0 20px 16px', fontSize:13, color:'var(--text-secondary)' }}>
              {twoFA ? '✅ 2FA is enabled. Your account is protected with an authenticator app.' : '⚠️ 2FA is disabled. Enable it for extra security.'}
            </div>
          </div>

          {/* Active sessions */}
          <div className="card">
            <div className="card-header"><span style={{ fontFamily:'Syne,sans-serif', fontWeight:800 }}>💻 Active Sessions</span></div>
            <div>
              {[
                { device:'Chrome / Windows', loc:'Lucknow, IN', time:'Current session', current:true },
                { device:'Safari / iPhone',  loc:'Lucknow, IN', time:'2 hours ago',     current:false },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom: i===0?'1px solid var(--border)':'none' }}>
                  <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:'var(--primary-50)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {s.device.includes('iPhone') ? <Smartphone size={18} color="var(--primary-600)"/> : <Monitor size={18} color="var(--primary-600)"/>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{s.device}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.loc} · {s.time}</div>
                  </div>
                  {s.current
                    ? <span style={{ background:'#dcfce7', color:'#16a34a', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>● Current</span>
                    : <button className="btn btn-ghost btn-sm" style={{ color:'#dc2626', fontSize:12 }}><LogOut size={13}/> Revoke</button>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Activity */}
      {tab === 'activity' && (
        <div className="card">
          <div className="card-header"><span style={{ fontFamily:'Syne,sans-serif', fontWeight:800 }}>📋 Login Activity</span></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date & Time</th><th>IP Address</th><th>Location</th><th>Device</th><th>Status</th></tr>
              </thead>
              <tbody>
                {activity.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize:12, fontFamily:'monospace', color:'var(--text-secondary)' }}>{log.time}</td>
                    <td style={{ fontSize:12, fontFamily:'monospace', color:'var(--text-muted)' }}>{log.ip}</td>
                    <td style={{ fontSize:13 }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Globe size={12} color="#94a3b8"/>{log.city}</span>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{log.device}</td>
                    <td>
                      {log.status === 'success'
                        ? <span style={{ display:'flex', alignItems:'center', gap:5, color:'#16a34a', fontSize:12, fontWeight:700 }}><CheckCircle size={13}/> Success</span>
                        : <span style={{ display:'flex', alignItems:'center', gap:5, color:'#dc2626', fontSize:12, fontWeight:700 }}><XCircle size={13}/> Failed</span>
                      }
                    </td>
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

