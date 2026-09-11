"use client";
// src/components/dashboard/user/profile/sections/WalletSection.jsx
import React, { useState } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

const MOCK_TRANSACTIONS = [
  { id:'t1', type:'credit', label:'Sale - Sony Headphones',    amount:18500, date:'2024-12-18', icon:'💰' },
  { id:'t2', type:'debit',  label:'Purchase - Samsung TV',     amount:42000, date:'2024-12-08', icon:'🛍' },
  { id:'t3', type:'credit', label:'Refund - Order #o3',        amount:5000,  date:'2024-12-01', icon:'↩️' },
  { id:'t4', type:'debit',  label:'Withdrawal to Bank',        amount:15000, date:'2024-11-25', icon:'🏦' },
  { id:'t5', type:'credit', label:'Added Money - UPI',         amount:10000, date:'2024-11-20', icon:'💳' },
];

export default function WalletSection({ data, onChange }) {
  const balance    = data.walletBalance ?? 32500;
  const [addAmt,   setAddAmt]   = useState('');
  const [withAmt,  setWithAmt]  = useState('');
  const [tab,      setTab]      = useState('txn');
  const [adding,   setAdding]   = useState(false);
  const [withdrawing, setWith]  = useState(false);

  const handleAdd = () => {
    if (!addAmt || isNaN(+addAmt) || +addAmt <= 0) return;
    onChange({ ...data, walletBalance: balance + +addAmt });
    setAddAmt(''); setAdding(false);
  };

  const handleWithdraw = () => {
    if (!withAmt || +withAmt > balance) return;
    onChange({ ...data, walletBalance: balance - +withAmt });
    setWithAmt(''); setWith(false);
  };

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title"><Wallet size={16}/>Wallet</span>
      </div>
      <div className="profile-section-body">

        {/* Balance Card */}
        <div className="wallet-balance-card">
          <div className="wallet-label">Available Balance</div>
          <div className="wallet-amount">₹{balance.toLocaleString('en-IN')}</div>
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.25)' }} onClick={() => setAdding(a => !a)}>
              <Plus size={14}/> Add Money
            </button>
            <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.25)' }} onClick={() => setWith(w => !w)}>
              <ArrowUpRight size={14}/> Withdraw
            </button>
          </div>
        </div>

        {/* Add Money */}
        {adding && (
          <div style={{ background:'var(--primary-50)', borderRadius:'var(--radius-md)', padding:16, border:'1px solid var(--primary-200)', display:'flex', gap:10, alignItems:'flex-end' }}>
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Amount to Add (₹)</label>
              <input className="form-input" type="number" placeholder="500" value={addAmt} onChange={e => setAddAmt(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[500,1000,2000,5000].map(q => (
                <button key={q} className="btn btn-secondary btn-sm" onClick={() => setAddAmt(String(q))}>+{q}</button>
              ))}
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add</button>
            </div>
          </div>
        )}

        {/* Withdraw */}
        {withdrawing && (
          <div style={{ background:'#fff7ed', borderRadius:'var(--radius-md)', padding:16, border:'1px solid #fed7aa', display:'flex', gap:10, alignItems:'flex-end' }}>
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Withdraw Amount (₹)</label>
              <input className="form-input" type="number" placeholder="1000" value={withAmt} onChange={e => setWithAmt(e.target.value)} max={balance} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleWithdraw} disabled={+withAmt > balance}>Request Withdrawal</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, borderBottom:'2px solid var(--border)', paddingBottom:0 }}>
          {[['txn','Transaction History'],['pending','Pending Withdrawals']].map(([t,l]) => (
            <button key={t} type="button"
              onClick={() => setTab(t)}
              style={{ padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, color: tab===t?'var(--primary-600)':'var(--text-muted)', borderBottom: tab===t?'2.5px solid var(--primary-500)':'2.5px solid transparent', marginBottom:-2, transition:'all 0.2s' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {tab === 'txn' && (
          <div>
            {MOCK_TRANSACTIONS.map(txn => (
              <div key={txn.id} className="txn-item">
                <div className="txn-icon" style={{ background: txn.type==='credit'?'#dcfce7':'#fee2e2' }}>
                  {txn.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{txn.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{txn.date}</div>
                </div>
                <div className={txn.type==='credit'?'txn-amount-cr':'txn-amount-dr'}>
                  {txn.type==='credit'?'+':'-'}₹{txn.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'pending' && (
          <div style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🏦</div>
            <div style={{ fontWeight:600 }}>No pending withdrawals</div>
          </div>
        )}

      </div>
    </div>
  );
}

