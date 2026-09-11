"use client";
// src/components/dashboard/user/profile/sections/SecuritySection.jsx
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, Smartphone, Monitor, AlertTriangle } from 'lucide-react';

function ToggleSwitch({ on, onToggle }) {
  return (
    <button type="button" className={`toggle-switch ${on ? 'on' : 'off'}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </button>
  );
}

const MOCK_SESSIONS = [
  { id:1, device:'Chrome on Windows',    ip:'122.xx.xx.01', location:'Delhi, IN',     current:true,  time:'Active now'    },
  { id:2, device:'Safari on iPhone 14',  ip:'103.xx.xx.44', location:'Mumbai, IN',    current:false, time:'2 hrs ago'     },
  { id:3, device:'Firefox on MacBook',   ip:'115.xx.xx.22', location:'Bangalore, IN', current:false, time:'Yesterday'     },
];

const MOCK_ACTIVITY = [
  { action:'Login',          ip:'122.xx.xx.01', location:'Delhi',     time:'Today 10:32 AM',  success:true  },
  { action:'Password Changed', ip:'122.xx.xx.01', location:'Delhi',   time:'Dec 15, 09:15 AM',success:true  },
  { action:'Login attempt',  ip:'185.xx.xx.99', location:'Unknown',   time:'Dec 10, 03:42 AM',success:false },
];

export default function SecuritySection({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const [pwd, setPwd]   = useState({ current:'', newPwd:'', confirm:'' });
  const [show, setShow] = useState({});
  const [pwdMsg, setPwdMsg] = useState('');
  const [activeSection, setActiveSection] = useState('password');

  const handlePwdChange = () => {
    if (!pwd.current)  { setPwdMsg('Enter current password'); return; }
    if (pwd.newPwd.length < 6) { setPwdMsg('New password must be 6+ characters'); return; }
    if (pwd.newPwd !== pwd.confirm) { setPwdMsg('Passwords do not match'); return; }
    setPwdMsg('✅ Password changed successfully!');
    setPwd({ current:'', newPwd:'', confirm:'' });
    setTimeout(() => setPwdMsg(''), 3000);
  };

  const sections = [
    { id:'password',  label:'Change Password',    icon:<Lock      size={14}/> },
    { id:'2fa',       label:'2FA Authentication', icon:<Shield    size={14}/> },
    { id:'activity',  label:'Login Activity',     icon:<Monitor   size={14}/> },
    { id:'sessions',  label:'Device Sessions',    icon:<Smartphone size={14}/> },
    { id:'danger',    label:'Danger Zone',        icon:<AlertTriangle size={14}/> },
  ];

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title"><Lock size={16}/>Security</span>
      </div>
      <div className="profile-section-body">

        {/* Section nav */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {sections.map(s => (
            <button key={s.id} type="button"
              className={`btn btn-sm ${activeSection===s.id?'btn-primary':'btn-secondary'}`}
              onClick={() => setActiveSection(s.id)}
              style={{ display:'flex', alignItems:'center', gap:5 }}>
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Change Password */}
        {activeSection === 'password' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:440 }}>
            {pwdMsg && <div className={`alert ${pwdMsg.startsWith('✅')?'alert-success':'alert-error'}`}>{pwdMsg}</div>}
            {[
              { key:'current', label:'Current Password' },
              { key:'newPwd',  label:'New Password' },
              { key:'confirm', label:'Confirm New Password' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <div style={{ position:'relative' }}>
                  <input className="form-input" type={show[f.key]?'text':'password'} placeholder="••••••••" value={pwd[f.key]} onChange={e => setPwd(p=>({...p,[f.key]:e.target.value}))} style={{ paddingRight:40 }} />
                  <button type="button" onClick={() => setShow(s=>({...s,[f.key]:!s[f.key]}))}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                    {show[f.key]?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ alignSelf:'flex-start' }} onClick={handlePwdChange}>
              <Lock size={14}/> Update Password
            </button>
          </div>
        )}

        {/* 2FA */}
        {activeSection === '2fa' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { key:'tfa_sms',         label:'SMS Authentication',      sub:'Receive OTP on mobile', },
              { key:'tfa_email',       label:'Email Authentication',    sub:'Receive OTP on email',  },
              { key:'tfa_app',         label:'Authenticator App',       sub:'Google/Microsoft Authenticator', },
            ].map(item => (
              <div className="security-item" key={item.key}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{item.label}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{item.sub}</div>
                </div>
                <ToggleSwitch on={!!data[item.key]} onToggle={() => set(item.key, !data[item.key])} />
              </div>
            ))}
          </div>
        )}

        {/* Login Activity */}
        {activeSection === 'activity' && (
          <div>
            {MOCK_ACTIVITY.map((a,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: a.success?'#16a34a':'#dc2626', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{a.action}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.ip} · {a.location}</div>
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.time}</div>
                <span className={`badge ${a.success?'badge-green':'badge-red'}`}>{a.success?'Success':'Failed'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Device Sessions */}
        {activeSection === 'sessions' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {MOCK_SESSIONS.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:14, background: s.current?'var(--primary-50)':'white', borderRadius:'var(--radius-md)', border:`1px solid ${s.current?'var(--primary-200)':'var(--border)'}` }}>
                <Monitor size={22} color={s.current?'var(--primary-600)':'var(--text-muted)'} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{s.device} {s.current && <span className="badge badge-green" style={{marginLeft:6,fontSize:10}}>Current</span>}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.ip} · {s.location} · {s.time}</div>
                </div>
                {!s.current && <button className="btn btn-danger btn-sm">Revoke</button>}
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" style={{ alignSelf:'flex-start' }}>Revoke All Other Sessions</button>
          </div>
        )}

        {/* Danger Zone */}
        {activeSection === 'danger' && (
          <div style={{ background:'#fff1f2', borderRadius:'var(--radius-md)', padding:20, border:'1.5px solid #fecdd3' }}>
            <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:800, color:'#be123c', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}><AlertTriangle size={16}/>Danger Zone</div>
            <p style={{ fontSize:13, color:'#9f1239', marginBottom:16 }}>Once you deactivate your account, it will be suspended. All your listings will be hidden. This action is reversible within 30 days by contacting support.</p>
            <button className="btn btn-danger" onClick={() => { if(confirm('Deactivate account? You can reactivate within 30 days.')) alert('Account deactivation request submitted.'); }}>
              <AlertTriangle size={15}/> Deactivate Account
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

