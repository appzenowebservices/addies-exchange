"use client";
// src/components/dashboard/user/profile/sections/VerificationSection.jsx
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Upload, Phone } from 'lucide-react';

const GOV_ID_TYPES = ['Aadhaar Card', 'PAN Card', 'Passport', 'Voter ID', 'Driving License'];

const STATUS_BADGE = {
  pending:  <span className="badge badge-orange">⏳ Pending</span>,
  approved: <span className="badge badge-green">✅ Approved</span>,
  rejected: <span className="badge badge-red">❌ Rejected</span>,
};

function UploadBox({ label, sub, value, onUpload }) {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*,application/pdf';
    input.onchange = e => onUpload(e.target.files[0]?.name || 'uploaded');
    input.click();
  };
  return (
    <div className="upload-box" onClick={handleClick}>
      <div className="upload-box-icon">📄</div>
      <div className="upload-box-label">{value ? `✅ ${value}` : label}</div>
      <div className="upload-box-sub">{value ? 'Click to replace' : sub}</div>
    </div>
  );
}

function OTPModal({ onClose, onVerify }) {
  const [otp, setOtp] = useState('');
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
      <div className="card card-body" style={{ width:320, padding:28 }}>
        <h3 style={{ fontFamily:'Roboto,sans-serif', fontWeight:800, marginBottom:8 }}>Enter OTP</h3>
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>6-digit OTP sent to your mobile</p>
        <input className="form-input" placeholder="● ● ● ● ● ●" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} style={{ fontSize:20, letterSpacing:8, textAlign:'center' }} />
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { if(otp.length===6) { onVerify(); onClose(); } }}>Verify</button>
        </div>
      </div>
    </div>
  );
}

export default function VerificationSection({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const [showOTP, setShowOTP] = useState(false);

  const verifyItems = [
    {
      label: 'Email Verification',
      sub:   data.emailVerified ? 'Your email is verified' : 'Verify your email address',
      verified: data.emailVerified,
      action: !data.emailVerified && (
        <button className="btn btn-secondary btn-sm" onClick={() => set('emailVerified', true)}>
          Send Link
        </button>
      ),
    },
    {
      label: 'Mobile Verification (OTP)',
      sub:   data.mobileVerified ? 'Mobile number verified' : 'Verify via OTP',
      verified: data.mobileVerified,
      action: !data.mobileVerified && (
        <button className="btn btn-secondary btn-sm" onClick={() => setShowOTP(true)}>
          <Phone size={13}/> Send OTP
        </button>
      ),
    },
  ];

  return (
    <div className="profile-section">
      {showOTP && <OTPModal onClose={() => setShowOTP(false)} onVerify={() => set('mobileVerified', true)} />}

      <div className="profile-section-header">
        <span className="profile-section-title"><ShieldCheck size={16}/>Verification</span>
        {STATUS_BADGE[data.verificationStatus || 'pending']}
      </div>
      <div className="profile-section-body">

        {/* Email + Mobile */}
        {verifyItems.map(item => (
          <div className="verify-item" key={item.label}>
            <div>
              <div className="verify-label">{item.label}</div>
              <div className="verify-sub">{item.sub}</div>
            </div>
            <div className="verify-action">
              {item.verified
                ? <div className="verified-icon"><CheckCircle size={15}/>Verified</div>
                : <><div className="unverified-icon"><XCircle size={15}/>Unverified</div>{item.action}</>
              }
            </div>
          </div>
        ))}

        {/* Government ID */}
        <div className="field-grid-2">
          <div className="form-group">
            <label className="form-label">Government ID Type</label>
            <select className="form-select" value={data.govIdType || ''} onChange={e => set('govIdType', e.target.value)}>
              <option value="">Select ID type</option>
              {GOV_ID_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">ID Number</label>
            <input className="form-input" placeholder="XXXX-XXXX-XXXX" value={data.govIdNumber || ''} onChange={e => set('govIdNumber', e.target.value)} />
          </div>
        </div>

        {/* Document Uploads */}
        <div className="field-grid-3">
          <div className="form-group">
            <label className="form-label">ID Proof Upload</label>
            <UploadBox label="Upload ID Proof" sub="JPG, PNG or PDF" value={data.idProofFile} onUpload={v => set('idProofFile', v)} />
          </div>
          <div className="form-group">
            <label className="form-label">Selfie with ID</label>
            <UploadBox label="Selfie with ID" sub="JPG or PNG only" value={data.selfieFile} onUpload={v => set('selfieFile', v)} />
          </div>
          <div className="form-group">
            <label className="form-label">Address Proof</label>
            <UploadBox label="Address Proof" sub="Utility bill, Rent agreement" value={data.addressProofFile} onUpload={v => set('addressProofFile', v)} />
          </div>
        </div>

        {/* Verification Status */}
        <div className="form-group">
          <label className="form-label">Verification Status</label>
          <div style={{ display:'flex', gap:10 }}>
            {['pending','approved','rejected'].map(s => (
              <button key={s} type="button"
                className={`btn btn-sm ${data.verificationStatus===s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => set('verificationStatus', s)}
                style={{ textTransform:'capitalize' }}>
                {s === 'pending' ? '⏳' : s === 'approved' ? '✅' : '❌'} {s}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

