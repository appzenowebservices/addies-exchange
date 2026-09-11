"use client";
// src/components/layout/Footer.jsx
// Path: C:\xampp\htdocs\addies-exchange\src\components\layout\Footer.jsx
//
// ── Shows ONLY on public pages: / and /item/:id
// ── Hidden on: /admin/*, /dashboard/*, /auth, /chat
// ── Categories: LIFO order, max 12 shown (last added = first shown)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../server/mockData';
import './footer.css';

// ── Static link columns ───────────────────────────────────────────────────────
const COMPANY_LINKS = [
  { label: 'About Us',               path: '#' },
  { label: 'Contact Us',             path: '#' },
  { label: 'Marketplace Disclaimer', path: '#' },
  { label: 'FAQ',                    path: '#' },
  { label: 'Careers',                path: '#' },
];

const PATRONAGE_LINKS = [
  { label: 'Help Center',               path: '#' },
  { label: 'Privacy Covenants',         path: '#' },
  { label: 'Partner Program',           path: '#' },
  { label: 'Terms of Trade',            path: '#' },
  { label: 'Vendor Registration',       path: '#' },
  { label: 'Delivery Partner Onboarding', path: '#' },
];

const LEGAL_LINKS = [
  { label: 'Terms & Conditions',          path: '#' },
  { label: 'Privacy Policy',             path: '#' },
  { label: 'Refund & Cancellation Policy', path: '#' },
  { label: 'Shipping / Delivery Policy', path: '#' },
  { label: 'Grievance Redressal Policy', path: '#' },
  { label: 'How We Operate',             path: '#' },
];

// ── LIFO: reverse array, skip 'all', take first 12 ───────────────────────────
const footerCategories = [...CATEGORIES]
  .reverse()
  .filter(c => c.id !== 'all')
  .slice(0, 12);

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="ae-footer">
      <div className="ae-footer-top">
        <div className="ae-footer-inner">

          {/* ── Company ── */}
          <div className="ae-footer-col">
            <h4 className="ae-footer-heading">Company</h4>
            <ul className="ae-footer-list">
              {COMPANY_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.path} className="ae-footer-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Patronage ── */}
          <div className="ae-footer-col">
            <h4 className="ae-footer-heading">Patronage</h4>
            <ul className="ae-footer-list">
              {PATRONAGE_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.path} className="ae-footer-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal & Policies ── */}
          <div className="ae-footer-col">
            <h4 className="ae-footer-heading">Legal &amp; Policies</h4>
            <ul className="ae-footer-list">
              {LEGAL_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.path} className="ae-footer-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Categories (LIFO, max 12, 2 columns) ── */}
          <div className="ae-footer-col ae-footer-col-wide">
            <div className="ae-footer-cat-header">
              <h4 className="ae-footer-heading">Categories</h4>
              <button className="ae-footer-see-all" onClick={() => navigate('/')}>
                see all →
              </button>
            </div>
            <div className="ae-footer-cat-grid">
              {footerCategories.map(cat => (
                <button key={cat.id} className="ae-footer-cat-link"
                  onClick={() => navigate(`/?cat=${cat.id}`)}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="ae-footer-bottom">
        <div className="ae-footer-bottom-inner">
          <div className="ae-footer-logo">
            <div className="ae-footer-logo-icon">AE</div>
            <span className="ae-footer-logo-text">Addies Exchange</span>
          </div>
          <p className="ae-footer-copy">
            © {new Date().getFullYear()} Addies Exchange. All rights reserved.
          </p>
          <div className="ae-footer-socials">
            <a href="#" className="ae-footer-social-btn" title="Facebook">f</a>
            <a href="#" className="ae-footer-social-btn" title="Instagram">in</a>
            <a href="#" className="ae-footer-social-btn" title="Twitter">𝕏</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

