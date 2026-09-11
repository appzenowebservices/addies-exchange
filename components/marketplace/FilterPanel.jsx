"use client";
// src/components/marketplace/FilterPanel.jsx
// Location: C:\xampp\htdocs\addies-exchange\src\components\marketplace\FilterPanel.jsx

import React, { useState, useCallback } from 'react';
import {
  X, SlidersHorizontal, ChevronDown, ChevronUp,
  MapPin, Tag, Star, Clock, RefreshCw, Check,
} from 'lucide-react';

// ── Helper: parse relative date strings ("2 days ago", "5 hours ago") ─────────
function parseRelativeDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;           // ISO / parseable string — done
  const s = String(val).toLowerCase().trim();
  if (s === 'just now' || s === 'today') return new Date();
  const match = s.match(/^(\d+)\s*(minute|hour|day|week|month|year)s?\s+ago$/);
  if (match) {
    const n   = parseInt(match[1], 10);
    const ms  = { minute:60e3, hour:36e5, day:864e5, week:6048e5, month:2592e6, year:31536e6 }[match[2]] || 0;
    return new Date(Date.now() - n * ms);
  }
  return null;
}

// ── Filter config ─────────────────────────────────────────────────────────────
const PRICE_PRESETS = [
  { label: 'Under ₹1,000',        min: 0,       max: 1000    },
  { label: '₹1,000 – ₹5,000',    min: 1000,    max: 5000    },
  { label: '₹5,000 – ₹25,000',   min: 5000,    max: 25000   },
  { label: '₹25,000 – ₹1 Lakh',  min: 25000,   max: 100000  },
  { label: '₹1 Lakh – ₹5 Lakh',  min: 100000,  max: 500000  },
  { label: 'Above ₹5 Lakh',       min: 500000,  max: 99999999},
];

const CONDITIONS = [
  { id: 'Brand New',  emoji: '✨', desc: 'Never used'     },
  { id: 'Like New',   emoji: '💎', desc: 'Barely used'    },
  { id: 'Good',       emoji: '👍', desc: 'Minor wear'     },
  { id: 'Fair',       emoji: '🔧', desc: 'Visible wear'   },
  { id: 'For Parts',  emoji: '⚙️', desc: 'Not working'   },
];

const SORT_OPTIONS = [
  { id: 'newest',     label: '🕒 Newest First'        },
  { id: 'oldest',     label: '📅 Oldest First'        },
  { id: 'price_asc',  label: '💰 Price: Low to High'  },
  { id: 'price_desc', label: '💸 Price: High to Low'  },
  { id: 'views',      label: '👁 Most Viewed'          },
];

const POSTING_DATE = [
  { id: '1',  label: 'Last 24 hours' },
  { id: '7',  label: 'Last 7 days'   },
  { id: '30', label: 'Last 30 days'  },
  { id: '90', label: 'Last 3 months' },
  { id: '',   label: 'Any time'      },
];

const INDIAN_CITIES = [
  'Delhi','Mumbai','Bangalore','Hyderabad','Chennai','Kolkata','Lucknow',
  'Pune','Jaipur','Ahmedabad','Surat','Kanpur','Nagpur','Indore','Bhopal',
  'Patna','Vadodara','Ludhiana','Agra','Nashik','Faridabad','Meerut',
  'Rajkot','Varanasi','Srinagar','Noida','Gurgaon',
];

// ── Collapsible section wrapper ────────────────────────────────────────────────
function FilterSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section-header" onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {icon} <span className="filter-section-title">{title}</span>
        </span>
        {open ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

// ── Main FilterPanel ───────────────────────────────────────────────────────────
export default function FilterPanel({ filters, onChange, onClose, isMobile = false }) {
  const set = useCallback((key, val) => onChange({ ...filters, [key]: val }), [filters, onChange]);

  const activeCount = [
    filters.priceMin || filters.priceMax,
    filters.conditions?.length,
    filters.city,
    filters.postedWithin,
    filters.sort !== 'newest',
    filters.negotiableOnly,
    filters.withPhotoOnly,
    filters.verifiedSeller,
  ].filter(Boolean).length;

  const reset = () => onChange({
    priceMin: '', priceMax: '',
    conditions: [], city: '', postedWithin: '',
    sort: 'newest',
    negotiableOnly: false, withPhotoOnly: false, verifiedSeller: false,
    pricePreset: '',
  });

  return (
    <div className={`filter-panel ${isMobile ? 'filter-panel-mobile' : ''}`}>
      {/* Header */}
      <div className="filter-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--primary-600)' }}/>
          <span className="filter-panel-title">Filters</span>
          {activeCount > 0 && (
            <span className="filter-count-badge">{activeCount} active</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeCount > 0 && (
            <button className="filter-reset-btn" onClick={reset}>
              <RefreshCw size={12}/> Reset
            </button>
          )}
          {isMobile && (
            <button className="filter-close-btn" onClick={onClose}>
              <X size={16}/>
            </button>
          )}
        </div>
      </div>

      <div className="filter-panel-body">

        {/* ── Sort By ── */}
        <FilterSection title="Sort By" icon={<Tag size={13}/>}>
          {SORT_OPTIONS.map(opt => (
            <label key={opt.id} className="filter-radio-row">
              <input type="radio" name="sort" value={opt.id}
                checked={filters.sort === opt.id}
                onChange={() => set('sort', opt.id)}/>
              <span>{opt.label}</span>
            </label>
          ))}
        </FilterSection>

        {/* ── Price Range ── */}
        <FilterSection title="Price Range" icon={<span style={{ fontSize: 13 }}>₹</span>}>
          {/* Custom Min/Max — separate rows, single onChange */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Min Price (₹)</span>
              <input className="filter-price-input" type="number" placeholder="₹ Minimum"
                value={filters.pricePreset ? "" : (filters.priceMin || "")}
                onChange={e => onChange({ ...filters, priceMin: e.target.value, pricePreset: "" })}/>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Max Price (₹)</span>
              <input className="filter-price-input" type="number" placeholder="₹ Maximum"
                value={filters.pricePreset ? "" : (filters.priceMax || "")}
                onChange={e => onChange({ ...filters, priceMax: e.target.value, pricePreset: "" })}/>
            </div>
          </div>
          {/* Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PRICE_PRESETS.map(p => (
              <button key={p.label}
                className={`filter-preset-btn ${filters.pricePreset === p.label ? 'active' : ''}`}
                onClick={() => onChange({ ...filters, priceMin: p.min, priceMax: p.max, pricePreset: p.label })}>
                {filters.pricePreset === p.label && <Check size={11}/>}
                {p.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* ── Condition ── */}
        <FilterSection title="Condition" icon={<Star size={13}/>}>
          {CONDITIONS.map(c => {
            const selected = (filters.conditions || []).includes(c.id);
            return (
              <button key={c.id}
                className={`filter-condition-btn ${selected ? 'active' : ''}`}
                onClick={() => {
                  const cur = filters.conditions || [];
                  set('conditions', selected ? cur.filter(x => x !== c.id) : [...cur, c.id]);
                }}>
                <span>{c.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{c.id}</div>
                  <div style={{ fontSize: 10, color: selected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{c.desc}</div>
                </div>
                {selected && <Check size={12} style={{ marginLeft: 'auto', flexShrink: 0 }}/>}
              </button>
            );
          })}
        </FilterSection>

        {/* ── City / Location ── */}
        <FilterSection title="City / Location" icon={<MapPin size={13}/>}>
          <input className="filter-city-input"
            placeholder="Type city name…"
            value={filters.city}
            onChange={e => set('city', e.target.value)}/>
          <div className="filter-city-pills">
            {INDIAN_CITIES.slice(0, 12).map(city => (
              <button key={city}
                className={`filter-city-pill ${filters.city === city ? 'active' : ''}`}
                onClick={() => set('city', filters.city === city ? '' : city)}>
                {city}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* ── Posted Within ── */}
        <FilterSection title="Posted Within" icon={<Clock size={13}/>}>
          {POSTING_DATE.map(p => (
            <label key={p.id} className="filter-radio-row">
              <input type="radio" name="postedWithin" value={p.id}
                checked={filters.postedWithin === p.id}
                onChange={() => set('postedWithin', p.id)}/>
              <span>{p.label}</span>
            </label>
          ))}
        </FilterSection>

        {/* ── Quick Toggles ── */}
        <FilterSection title="More Options" icon={<SlidersHorizontal size={13}/>} defaultOpen={false}>
          {[
            { key: 'negotiableOnly', label: '💬 Negotiable Price Only' },
            { key: 'withPhotoOnly',  label: '📷 With Photos Only'      },
            { key: 'verifiedSeller', label: '✅ Verified Sellers Only'  },
          ].map(opt => (
            <label key={opt.key} className="filter-toggle-row">
              <span style={{ fontSize: 13, fontWeight: 500 }}>{opt.label}</span>
              <div
                className={`filter-toggle-switch ${filters[opt.key] ? 'on' : 'off'}`}
                onClick={() => set(opt.key, !filters[opt.key])}>
                <div className="filter-toggle-knob"/>
              </div>
            </label>
          ))}
        </FilterSection>

      </div>

      {/* Mobile Apply button */}
      {isMobile && (
        <div className="filter-panel-footer">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Default filter state (export for parent to use) ───────────────────────────
export const DEFAULT_FILTERS = {
  priceMin: '', priceMax: '',
  conditions: [], city: '', postedWithin: '',
  sort: 'newest', pricePreset: '',
  negotiableOnly: false, withPhotoOnly: false, verifiedSeller: false,
};

// ── Apply filters to items array ───────────────────────────────────────────────
export function applyFilters(items, filters, search, category) {
  let result = items.filter(item => {
    // Search
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());

    // Category
    const matchCat = category === 'all' || item.category === category;

    // City
    const matchCity = !filters.city ||
      item.city.toLowerCase().includes(filters.city.toLowerCase());

    // ── FIX 1: Price Range ──────────────────────────────────────────────────
    // Bug was: priceMin=0 (e.g. "Under ₹1,000") failed the !== '' check
    // because 0 is falsy. Use null-check instead of empty-string check.
    const rawMin = filters.priceMin;
    const rawMax = filters.priceMax;
    const min = (rawMin !== '' && rawMin !== null && rawMin !== undefined)
      ? Number(rawMin) : null;
    const max = (rawMax !== '' && rawMax !== null && rawMax !== undefined)
      ? Number(rawMax) : null;
    const matchPrice = (min === null || item.price >= min) &&
                       (max === null || item.price <= max);

    // Condition
    const matchCond = !filters.conditions?.length ||
      filters.conditions.includes(item.condition);

    // Negotiable
    const matchNeg = !filters.negotiableOnly || item.negotiable;

    // Verified seller
    const matchVerif = !filters.verifiedSeller || item.sellerVerified;

    // ── FIX 2: Posted Within ────────────────────────────────────────────────
    // Bug was: postedWithin was tracked in state but never used in filter logic
    let matchDate = true;
    if (filters.postedWithin && filters.postedWithin !== '') {
      const daysAgo  = parseInt(filters.postedWithin, 10);
      const cutoff   = new Date(Date.now() - daysAgo * 864e5);
      const itemDate = parseRelativeDate(item.createdAt);
      if (itemDate) matchDate = itemDate >= cutoff;
      // if date unparseable → don't exclude the item (fail open)
    }

    return matchSearch && matchCat && matchCity && matchPrice &&
           matchCond && matchNeg && matchVerif && matchDate;
  });

  // Sort
  switch (filters.sort) {
    case 'oldest':     result.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
    case 'price_asc':  result.sort((a,b) => a.price - b.price); break;
    case 'price_desc': result.sort((a,b) => b.price - a.price); break;
    case 'views':      result.sort((a,b) => b.views - a.views); break;
    default:           result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return result;
}

