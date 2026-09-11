"use client";
// src/components/dashboard/admin/AdminSettings.jsx
import React, { useState } from 'react';
import { Save, Globe, Lock, Bell, DollarSign, Image, Sliders } from 'lucide-react';

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', background: value?'var(--primary-500)':'#e2e8f0', position:'relative', transition:'all 0.2s', flexShrink:0 }}>
      <span style={{ position:'absolute', top:3, left: value?23:3, width:18, height:18, borderRadius:50, background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </button>
  );
}

function ToggleRow({ label, sub, value, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid var(--border)' }}>
      <div>
        <div style={{ fontWeight:600, fontSize:14 }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange}/>
    </div>
  );
}

const TABS = [
  { key:'general',  label:'General',       icon:<Globe size={15}/> },
  { key:'security', label:'Security',      icon:<Lock  size={15}/> },
  { key:'notif',    label:'Notifications', icon:<Bell  size={15}/> },
  { key:'payment',  label:'Payments',      icon:<DollarSign size={15}/> },
  { key:'media',    label:'Media',         icon:<Image size={15}/> },
  { key:'advanced', label:'Advanced',      icon:<Sliders size={15}/> },
];

export default function AdminSettings() {
  const [tab,   setTab]   = useState('general');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    siteName:         'Addies Exchange',
    tagline:          'Buy & Sell Anything, Anywhere',
    supportEmail:     'support@addiesexchange.com',
    supportPhone:     '+91 9876543210',
    contactAddress:   'Lucknow, Uttar Pradesh, India',
    timezone:         'Asia/Kolkata',
    currency:         'INR',
    language:         'en',
    maxListingsPerUser: 50,
    itemExpiryDays:   30,
    featuredDays:     7,
  });

  const [security, setSecurity] = useState({
    allowRegistration:        true,
    requireEmailVerification: false,
    maintenanceMode:          false,
    twoFARequired:            false,
    sessionTimeout:           30,
    maxLoginAttempts:         5,
    lockoutDuration:          15,
    allowGoogleLogin:         true,
    allowPhoneLogin:          true,
  });

  const [notif, setNotif] = useState({
    emailEnabled:       true,
    smsEnabled:         true,
    pushEnabled:        true,
    orderAlerts:        true,
    kycAlerts:          true,
    reportAlerts:       true,
    marketingEmails:    false,
    adminDigestEmail:   true,
    digestFrequency:    'daily',
  });

  const [payment, setPayment] = useState({
    razorpayEnabled:    true,
    razorpayKeyId:      'rzp_test_xxxxxxxxxxxxxxxx',
    razorpayKeySecret:  '••••••••••••••••',
    upiEnabled:         true,
    cashEnabled:        true,
    applyGST:           true,
    gstPercent:         18,
    applyTDS:           false,
    tdsPercent:         1,
    withdrawalMinimum:  500,
    withdrawalCycle:    'weekly',
  });

  const [media, setMedia] = useState({
    maxImageSize:    5,
    maxImagesPerItem:8,
    allowedTypes:    'jpg, jpeg, png, webp',
    autoCompress:    true,
    watermarkEnabled:false,
    watermarkText:   'Addies Exchange',
    cdnEnabled:      false,
    cdnUrl:          '',
  });

  const [advanced, setAdvanced] = useState({
    debugMode:          false,
    apiRateLimit:       100,
    cacheEnabled:       true,
    cacheTTL:           3600,
    itemAutoApprove:    false,
    kycAutoApprove:     false,
    chatEnabled:        true,
    reviewsEnabled:     true,
    boostEnabled:       true,
    featuredEnabled:    true,
    analyticsEnabled:   true,
    googleAnalyticsId:  'UA-XXXXXXXXX-X',
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const sg = (setter) => (key) => (val) => setter(s => ({ ...s, [key]: val }));
  const setG = sg(setGeneral);
  const setSec = sg(setSecurity);
  const setN = sg(setNotif);
  const setPay = sg(setPayment);
  const setMed = sg(setMedia);
  const setAdv = sg(setAdvanced);

  return (
    <div>
      <div className="page-header" style={{ marginBottom:20 }}>
        <div>
          <h2 className="page-title">System Settings</h2>
          <p className="page-sub">Configure all platform-wide options</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved!' : <><Save size={15}/> Save Changes</>}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--bg-base)', padding:4, borderRadius:'var(--radius-lg)', width:'fit-content', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13, transition:'all 0.2s',
              background: tab===t.key ? 'white' : 'transparent',
              color:      tab===t.key ? 'var(--primary-700)' : 'var(--text-muted)',
              boxShadow:  tab===t.key ? 'var(--shadow-sm)' : 'none',
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:680, display:'flex', flexDirection:'column', gap:16 }}>

        {/* ── GENERAL ── */}
        {tab === 'general' && (<>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🌐 Site Identity</span></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['Site Name','siteName','text'],['Tagline','tagline','text'],['Support Email','supportEmail','email'],['Support Phone','supportPhone','tel'],['Contact Address','contactAddress','text']].map(([label,key,type]) => (
                  <div key={key} className="form-group" style={{ gridColumn: key==='contactAddress'?'1/-1':'auto' }}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" type={type} value={general[key]} onChange={e => setGeneral(s=>({...s,[key]:e.target.value}))}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🌍 Locale</span></div>
            <div className="card-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-select" value={general.timezone} onChange={e => setGeneral(s=>({...s,timezone:e.target.value}))}>
                  {['Asia/Kolkata','Asia/Dubai','UTC','America/New_York','Europe/London'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={general.currency} onChange={e => setGeneral(s=>({...s,currency:e.target.value}))}>
                  {['INR','USD','EUR','AED','GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-select" value={general.language} onChange={e => setGeneral(s=>({...s,language:e.target.value}))}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>📋 Listing Rules</span></div>
            <div className="card-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['Max Listings / User','maxListingsPerUser'],['Item Expiry (days)','itemExpiryDays'],['Featured Duration (days)','featuredDays']].map(([label,key]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type="number" value={general[key]} onChange={e => setGeneral(s=>({...s,[key]:+e.target.value}))}/>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ── SECURITY ── */}
        {tab === 'security' && (<>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🔒 Access Control</span></div>
            <div className="card-body">
              <ToggleRow label="Allow New Registrations"       sub="Users can create new accounts"                value={security.allowRegistration}        onChange={setSec('allowRegistration')}/>
              <ToggleRow label="Require Email Verification"    sub="New accounts must verify email before login"  value={security.requireEmailVerification}  onChange={setSec('requireEmailVerification')}/>
              <ToggleRow label="Require 2FA for Admins"        sub="All admin logins must use 2FA"                value={security.twoFARequired}             onChange={setSec('twoFARequired')}/>
              <ToggleRow label="Allow Google Login"            sub="OAuth login via Google"                       value={security.allowGoogleLogin}          onChange={setSec('allowGoogleLogin')}/>
              <ToggleRow label="Allow Phone Login"             sub="OTP-based mobile login"                      value={security.allowPhoneLogin}           onChange={setSec('allowPhoneLogin')}/>
              <ToggleRow label="Maintenance Mode"              sub="Temporarily disable public access"            value={security.maintenanceMode}           onChange={setSec('maintenanceMode')}/>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🛡 Session & Lockout</span></div>
            <div className="card-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['Session Timeout (min)','sessionTimeout'],['Max Login Attempts','maxLoginAttempts'],['Lockout Duration (min)','lockoutDuration']].map(([label,key]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type="number" value={security[key]} onChange={e => setSecurity(s=>({...s,[key]:+e.target.value}))}/>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ── NOTIFICATIONS ── */}
        {tab === 'notif' && (<>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>📡 Channels</span></div>
            <div className="card-body">
              <ToggleRow label="Email Notifications" sub="Send transactional emails"            value={notif.emailEnabled}     onChange={setN('emailEnabled')}/>
              <ToggleRow label="SMS Notifications"   sub="Send OTP and alert SMS"               value={notif.smsEnabled}       onChange={setN('smsEnabled')}/>
              <ToggleRow label="Push Notifications"  sub="Browser and mobile push alerts"       value={notif.pushEnabled}      onChange={setN('pushEnabled')}/>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🔔 Alert Types</span></div>
            <div className="card-body">
              <ToggleRow label="Order Alerts"         sub="Notify on new orders"                value={notif.orderAlerts}      onChange={setN('orderAlerts')}/>
              <ToggleRow label="KYC Alerts"           sub="Notify on KYC submission"            value={notif.kycAlerts}        onChange={setN('kycAlerts')}/>
              <ToggleRow label="Report Alerts"        sub="Notify on new reports"               value={notif.reportAlerts}     onChange={setN('reportAlerts')}/>
              <ToggleRow label="Marketing Emails"     sub="Promotional emails to users"         value={notif.marketingEmails}  onChange={setN('marketingEmails')}/>
              <ToggleRow label="Admin Digest Email"   sub="Daily/weekly summary for admin"      value={notif.adminDigestEmail} onChange={setN('adminDigestEmail')}/>
            </div>
          </div>
          {notif.adminDigestEmail && (
            <div className="card">
              <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>📅 Digest Frequency</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Send Digest</label>
                  <select className="form-select" value={notif.digestFrequency} onChange={e => setNotif(s=>({...s,digestFrequency:e.target.value}))} style={{ maxWidth:200 }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </>)}

        {/* ── PAYMENTS ── */}
        {tab === 'payment' && (<>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>💳 Payment Gateways</span></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <ToggleRow label="Razorpay" sub="Primary payment gateway" value={payment.razorpayEnabled} onChange={setPay('razorpayEnabled')}/>
              {payment.razorpayEnabled && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Key ID</label>
                    <input className="form-input" value={payment.razorpayKeyId} onChange={e => setPayment(s=>({...s,razorpayKeyId:e.target.value}))}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Key Secret</label>
                    <input className="form-input" type="password" value={payment.razorpayKeySecret} onChange={e => setPayment(s=>({...s,razorpayKeySecret:e.target.value}))}/>
                  </div>
                </div>
              )}
              <ToggleRow label="UPI Direct" sub="Accept direct UPI payments" value={payment.upiEnabled}      onChange={setPay('upiEnabled')}/>
              <ToggleRow label="Cash on Delivery" sub="Allow COD for listings"  value={payment.cashEnabled}     onChange={setPay('cashEnabled')}/>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🧾 Tax & Withdrawal</span></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <ToggleRow label="Apply GST" sub="Add GST on platform fees" value={payment.applyGST} onChange={setPay('applyGST')}/>
              {payment.applyGST && (
                <div className="form-group">
                  <label className="form-label">GST %</label>
                  <input className="form-input" type="number" value={payment.gstPercent} onChange={e => setPayment(s=>({...s,gstPercent:+e.target.value}))} style={{ maxWidth:120 }}/>
                </div>
              )}
              <ToggleRow label="Apply TDS" sub="Deduct TDS on payouts" value={payment.applyTDS} onChange={setPay('applyTDS')}/>
              {payment.applyTDS && (
                <div className="form-group">
                  <label className="form-label">TDS %</label>
                  <input className="form-input" type="number" value={payment.tdsPercent} onChange={e => setPayment(s=>({...s,tdsPercent:+e.target.value}))} style={{ maxWidth:120 }}/>
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Min Withdrawal (₹)</label>
                  <input className="form-input" type="number" value={payment.withdrawalMinimum} onChange={e => setPayment(s=>({...s,withdrawalMinimum:+e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Withdrawal Cycle</label>
                  <select className="form-select" value={payment.withdrawalCycle} onChange={e => setPayment(s=>({...s,withdrawalCycle:e.target.value}))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>)}

        {/* ── MEDIA ── */}
        {tab === 'media' && (
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🖼 Media & Uploads</span></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Max Image Size (MB)</label>
                  <input className="form-input" type="number" value={media.maxImageSize} onChange={e => setMedia(s=>({...s,maxImageSize:+e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Images / Item</label>
                  <input className="form-input" type="number" value={media.maxImagesPerItem} onChange={e => setMedia(s=>({...s,maxImagesPerItem:+e.target.value}))}/>
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Allowed Types</label>
                  <input className="form-input" value={media.allowedTypes} onChange={e => setMedia(s=>({...s,allowedTypes:e.target.value}))}/>
                </div>
              </div>
              <ToggleRow label="Auto Compress Images" sub="Compress uploads to save storage" value={media.autoCompress}    onChange={setMed('autoCompress')}/>
              <ToggleRow label="Watermark Images"      sub="Add watermark text to images"    value={media.watermarkEnabled} onChange={setMed('watermarkEnabled')}/>
              {media.watermarkEnabled && (
                <div className="form-group">
                  <label className="form-label">Watermark Text</label>
                  <input className="form-input" value={media.watermarkText} onChange={e => setMedia(s=>({...s,watermarkText:e.target.value}))}/>
                </div>
              )}
              <ToggleRow label="CDN Enabled" sub="Serve images via CDN URL" value={media.cdnEnabled} onChange={setMed('cdnEnabled')}/>
              {media.cdnEnabled && (
                <div className="form-group">
                  <label className="form-label">CDN Base URL</label>
                  <input className="form-input" type="url" value={media.cdnUrl} onChange={e => setMedia(s=>({...s,cdnUrl:e.target.value}))} placeholder="https://cdn.example.com"/>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ADVANCED ── */}
        {tab === 'advanced' && (<>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>⚙️ Feature Flags</span></div>
            <div className="card-body">
              <ToggleRow label="Chat Enabled"       sub="Users can chat with sellers"             value={advanced.chatEnabled}      onChange={setAdv('chatEnabled')}/>
              <ToggleRow label="Reviews Enabled"    sub="Buyers can leave reviews"                value={advanced.reviewsEnabled}   onChange={setAdv('reviewsEnabled')}/>
              <ToggleRow label="Boost Enabled"      sub="Sellers can boost listings"              value={advanced.boostEnabled}     onChange={setAdv('boostEnabled')}/>
              <ToggleRow label="Featured Enabled"   sub="Sellers can feature listings"            value={advanced.featuredEnabled}  onChange={setAdv('featuredEnabled')}/>
              <ToggleRow label="Auto-Approve Items" sub="Skip admin review for new listings"      value={advanced.itemAutoApprove}  onChange={setAdv('itemAutoApprove')}/>
              <ToggleRow label="Auto-Approve KYC"   sub="Skip manual KYC review"                  value={advanced.kycAutoApprove}   onChange={setAdv('kycAutoApprove')}/>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:800, fontFamily:'Syne,sans-serif' }}>🔧 Performance & Dev</span></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <ToggleRow label="Debug Mode"     sub="Enable verbose logging (dev only)" value={advanced.debugMode}     onChange={setAdv('debugMode')}/>
              <ToggleRow label="Cache Enabled"  sub="Cache API responses"               value={advanced.cacheEnabled}  onChange={setAdv('cacheEnabled')}/>
              <ToggleRow label="Analytics"      sub="Enable usage analytics"            value={advanced.analyticsEnabled} onChange={setAdv('analyticsEnabled')}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">API Rate Limit (req/min)</label>
                  <input className="form-input" type="number" value={advanced.apiRateLimit} onChange={e => setAdvanced(s=>({...s,apiRateLimit:+e.target.value}))}/>
                </div>
                {advanced.cacheEnabled && (
                  <div className="form-group">
                    <label className="form-label">Cache TTL (seconds)</label>
                    <input className="form-input" type="number" value={advanced.cacheTTL} onChange={e => setAdvanced(s=>({...s,cacheTTL:+e.target.value}))}/>
                  </div>
                )}
                {advanced.analyticsEnabled && (
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Google Analytics ID</label>
                    <input className="form-input" value={advanced.googleAnalyticsId} onChange={e => setAdvanced(s=>({...s,googleAnalyticsId:e.target.value}))}/>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>)}

      </div>
    </div>
  );
}

