"use client";
// src/components/chat/ChatPage.jsx
import React from 'react';

export default function ChatPage() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12, color:'var(--text-muted)' }}>
      <div style={{ fontSize:48 }}>💬</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'var(--text-primary)' }}>Chat</div>
      <div style={{ fontSize:14 }}>Coming soon…</div>
    </div>
  );
}

