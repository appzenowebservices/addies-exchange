"use client";
// src/components/marketplace/MarketplacePage.jsx
// Location: C:\xampp\htdocs\addies-exchange\src\components\marketplace\MarketplacePage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockAPI } from '../../server/trpcClient';
import { CATEGORIES } from '../../server/mockData';
import ItemCard       from './ItemCard';
import MarketplaceNav from './MarketplaceNav';
import FilterPanel, { DEFAULT_FILTERS, applyFilters } from './FilterPanel';
import './marketplace.css';

const TRENDING = ['iPhone 14','Honda Activa','Samsung TV','Royal Enfield','Sofa Set','MacBook'];

export default function MarketplacePage() {
  const { user }  = useAuth();
  const searchRef = useRef(null);

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category,    setCategory]    = useState('all');
  const [showSuggest, setShowSuggest] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters,     setFilters]     = useState(DEFAULT_FILTERS);
  const [showFilter,  setShowFilter]  = useState(true);   // desktop sidebar — open by default
  const [showMFilter, setShowMFilter] = useState(false);  // mobile drawer

  useEffect(() => {
    mockAPI.getItems().then(i => { setItems(i); setLoading(false); });
  }, []);

  const handleCategory = useCallback((cat) => { setCategory(cat); }, []);

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setShowSuggest(false);
  }, [searchInput]);

  // ── Apply all filters ─────────────────────────────────────────────────────
  const filtered = applyFilters(items, filters, search, category);

  // ── Active filter count (for badge) ──────────────────────────────────────
  const activeFilterCount = [
    filters.priceMin || filters.priceMax,
    filters.conditions?.length,
    filters.city,
    filters.postedWithin,
    filters.sort !== 'newest',
    filters.negotiableOnly,
    filters.withPhotoOnly,
    filters.verifiedSeller,
  ].filter(Boolean).length;

  return (
    <div className="marketplace">
      <MarketplaceNav />

      {/* ── Hero ── */}
      <div className="marketplace-hero">
        <div className="marketplace-hero-content">
          <h1 className="marketplace-hero-title">
            Kharido, Becho,&nbsp;<span className="hero-accent">Save Karo</span>
          </h1>
          <p className="marketplace-hero-sub">
            Lakhs of pre-loved items — mobiles, vehicles, property & more
          </p>

          {/* Search bar */}
          <div className="marketplace-search-wrap">
            <div className="marketplace-search-bar">
              <Search size={20} className="search-icon"/>
              <input ref={searchRef}
                className="marketplace-search-input"
                placeholder="Search phones, bikes, furniture…"
                value={searchInput}
                onChange={e => { setSearchInput(e.target.value); setShowSuggest(e.target.value.length > 0); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                onFocus={() => setShowSuggest(searchInput.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              />
              {searchInput && (
                <button className="search-clear-btn"
                  onClick={() => { setSearchInput(''); setSearch(''); setShowSuggest(false); }}>
                  <X size={14}/>
                </button>
              )}
              <button className="search-submit-btn" onClick={handleSearch}>Search</button>
            </div>

            {/* Search suggestions */}
            {showSuggest && (
              <div className="search-suggestions">
                {CATEGORIES.filter(c =>
                  c.id !== 'all' && c.label.toLowerCase().includes(searchInput.toLowerCase())
                ).slice(0,3).map(c => (
                  <div key={c.id} className="suggestion-item"
                    onClick={() => { setSearchInput(c.label); handleCategory(c.id); setShowSuggest(false); }}>
                    <span>{c.icon}</span> in <strong>{c.label}</strong>
                  </div>
                ))}
                <div className="suggestion-item suggestion-search" onClick={handleSearch}>
                  <Search size={13}/> Search for "<strong>{searchInput}</strong>"
                </div>
              </div>
            )}
          </div>

          {/* Trending */}
          <div className="hero-trending">
            <span className="trending-label"><TrendingUp size={12}/> Trending:</span>
            {TRENDING.map(t => (
              <button key={t} className="trending-chip"
                onClick={() => { setSearchInput(t); setSearch(t); }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories Strip ── */}
      <div className="category-bar">
        <div className="category-scroll">
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              className={`category-chip ${category === cat.id ? 'active' : ''}`}
              onClick={() => handleCategory(cat.id)}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body: Sidebar + Main ── */}
      <div className="marketplace-body">
        <div className={`marketplace-layout ${showFilter ? 'with-sidebar' : ''}`}>

          {/* ═══ FILTER SIDEBAR (desktop) ═══ */}
          {showFilter && (
            <aside className="filter-sidebar">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClose={() => setShowFilter(false)}
              />
            </aside>
          )}

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="marketplace-main">

            {/* Toolbar */}
            <div className="results-toolbar">
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>

                {/* Desktop filter toggle button */}
                <button
                  className={`toolbar-btn hide-mobile ${showFilter ? 'active' : ''}`}
                  onClick={() => setShowFilter(f => !f)}>
                  <SlidersHorizontal size={15}/>
                  {showFilter ? 'Hide Filters' : 'Show Filters'}
                  {activeFilterCount > 0 && (
                    <span className="filter-count-badge">{activeFilterCount}</span>
                  )}
                </button>

                {/* Mobile filter trigger */}
                <button className="toolbar-btn show-mobile-only"
                  onClick={() => setShowMFilter(true)}>
                  <SlidersHorizontal size={15}/> Filters
                  {activeFilterCount > 0 && (
                    <span className="filter-count-badge">{activeFilterCount}</span>
                  )}
                </button>

                <span className="results-count">
                  <strong>{loading ? '…' : filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
                  {category !== 'all' && (
                    <span style={{ color:'var(--primary-600)', marginLeft:6, fontWeight:600 }}>
                      in {CATEGORIES.find(c => c.id === category)?.label}
                      <button onClick={() => setCategory('all')}
                        style={{ marginLeft:5, background:'none', border:'none',
                                 cursor:'pointer', color:'var(--text-muted)', fontSize:12 }}>✕</button>
                    </span>
                  )}
                </span>

                {activeFilterCount > 0 && (
                  <button className="filter-clear-all"
                    onClick={() => setFilters(DEFAULT_FILTERS)}>
                    <X size={11}/> Clear filters
                  </button>
                )}
              </div>

              {/* Sort */}
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="sort-label hide-mobile">Sort:</span>
                <select className="sort-select"
                  value={filters.sort}
                  onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                  <option value="views">Popular</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="applied-filters">
                {filters.city && (
                  <span className="applied-tag">📍 {filters.city}
                    <button onClick={() => setFilters(f => ({ ...f, city:'' }))}><X size={10}/></button>
                  </span>
                )}
                {(filters.priceMin !== '' || filters.priceMax !== '') && (
                  <span className="applied-tag">
                    ₹{filters.priceMin || '0'} – {filters.priceMax || '∞'}
                    <button onClick={() => setFilters(f => ({ ...f, priceMin:'', priceMax:'', pricePreset:'' }))}><X size={10}/></button>
                  </span>
                )}
                {(filters.conditions || []).map(c => (
                  <span key={c} className="applied-tag">{c}
                    <button onClick={() => setFilters(f => ({ ...f, conditions: f.conditions.filter(x => x !== c) }))}><X size={10}/></button>
                  </span>
                ))}
                {filters.negotiableOnly && (
                  <span className="applied-tag">💬 Negotiable
                    <button onClick={() => setFilters(f => ({ ...f, negotiableOnly:false }))}><X size={10}/></button>
                  </span>
                )}
                {filters.verifiedSeller && (
                  <span className="applied-tag">✅ Verified
                    <button onClick={() => setFilters(f => ({ ...f, verifiedSeller:false }))}><X size={10}/></button>
                  </span>
                )}
                {filters.postedWithin && (
                  <span className="applied-tag">
                    🕒 Last {filters.postedWithin} day{filters.postedWithin !== '1' ? 's' : ''}
                    <button onClick={() => setFilters(f => ({ ...f, postedWithin:'' }))}><X size={10}/></button>
                  </span>
                )}
              </div>
            )}

            {/* ── Grid ── */}
            {loading ? (
              <div className="loading-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-img"/>
                    <div className="skeleton-line w70"/>
                    <div className="skeleton-line w50"/>
                    <div className="skeleton-line w40"/>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize:52 }}>🔍</div>
                <h3>Koi item nahi mila</h3>
                <p>Try different keywords or reset filters</p>
                <button className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSearch(''); setSearchInput('');
                    setFilters(DEFAULT_FILTERS); setCategory('all');
                  }}>
                  Reset All
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {filtered.map(item => (
                  <ItemCard key={item.id} item={item} user={user}/>
                ))}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="load-more-wrap">
                <button className="btn btn-secondary">
                  Load More <ChevronDown size={15}/>
                </button>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                  {filtered.length} items found
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {showMFilter && (
        <div className="mobile-filter-overlay" onClick={() => setShowMFilter(false)}>
          <div className="mobile-filter-drawer" onClick={e => e.stopPropagation()}>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onClose={() => setShowMFilter(false)}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}

