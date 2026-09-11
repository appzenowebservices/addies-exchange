// src/components/marketplace/AdEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// ADDIES EXCHANGE — AD ENGINE
//
// HOW MONEY IS MADE:
//  1. User browses → cookies track categories/searches/city/price range
//  2. AdEngine reads cookies → picks most relevant ads from approved inventory
//  3. Ads injected into grid at fixed slots (every 5th card = slot)
//  4. CPM  → ₹ earned per 1000 impressions (banner ads)
//  5. CPC  → ₹ earned per click (promoted listings, finance ads)
//  6. CPA  → ₹ earned per action (signup/purchase on advertiser site)
//  7. Promoted Listings → sellers pay to appear at top / in ad slots
//  8. Admin approves all ads before they go live
// ─────────────────────────────────────────────────────────────────────────────

// ── Cookie Helpers ─────────────────────────────────────────────────────────────
export const Cookie = {
  set(key, val, days = 60) {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${key}=${encodeURIComponent(JSON.stringify(val))};expires=${exp};path=/;SameSite=Lax`;
  },
  get(key) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    if (!match) return null;
    try { return JSON.parse(decodeURIComponent(match[1])); } catch { return null; }
  },
  append(key, val, maxLen = 15) {
    const existing = Cookie.get(key) || [];
    const updated  = [val, ...existing.filter(v => v !== val)].slice(0, maxLen);
    Cookie.set(key, updated);
    return updated;
  },
  delete(key) {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },
};

// ── Interest Tracker ───────────────────────────────────────────────────────────
export const InterestTracker = {
  trackView(item) {
    Cookie.append('ae_cats',   item.category);
    Cookie.append('ae_viewed', item.id);
    if (item.city)  Cookie.set('ae_city', item.city);
    if (item.price) {
      // Track price range interest bucket
      const bucket = item.price < 5000 ? 'budget'
                   : item.price < 30000 ? 'mid'
                   : item.price < 100000 ? 'premium' : 'luxury';
      Cookie.set('ae_price_tier', bucket);
    }
  },
  trackSearch(query) {
    if (query?.trim().length > 2)
      Cookie.append('ae_searches', query.trim().toLowerCase());
  },
  trackCategory(cat) {
    if (cat && cat !== 'all') Cookie.append('ae_cats', cat);
  },
  trackCity(city) {
    if (city?.trim()) Cookie.set('ae_city', city.trim());
  },
  getProfile() {
    return {
      categories: Cookie.get('ae_cats')       || [],
      searches:   Cookie.get('ae_searches')   || [],
      city:       Cookie.get('ae_city')       || '',
      priceTier:  Cookie.get('ae_price_tier') || 'mid',
      viewed:     Cookie.get('ae_viewed')     || [],
    };
  },
  clearAll() {
    ['ae_cats','ae_searches','ae_city','ae_price_tier','ae_viewed'].forEach(k => Cookie.delete(k));
  },
};

// ── Ad Types ───────────────────────────────────────────────────────────────────
// 'promoted'  → Seller's own listing boosted to ad slot  (CPC)
// 'banner'    → External advertiser's brand ad           (CPM or CPC)
// 'native'    → Looks like a listing but is paid         (CPC)
// 'finance'   → Loan/insurance partner ads               (CPA)

// ── Ad Inventory (in production: fetch from /api/ads?status=approved) ─────────
// status: 'approved' | 'pending' | 'rejected' | 'paused'
// Admin sets status via Admin Panel → Ads Manager
export const AD_INVENTORY = [

  // ── PROMOTED LISTINGS (Sellers pay to appear in ad slots) ──────────────────
  {
    id: 'promo-1', type: 'promoted', status: 'approved',
    advertiser: 'Rahul Sharma',       // seller name
    advertiserId: 'seller-001',
    label: 'Sponsored',
    badge: '🔥 Hot Deal',
    title: 'iPhone 15 Pro Max 256GB — Sealed Box',
    desc: 'Official Apple India warranty. Free delivery Delhi NCR.',
    price: '₹1,34,900', originalPrice: '₹1,49,900',
    emoji: '📱', city: 'Delhi',
    cta: 'View Deal',
    targetCategories: ['Electronics','Mobiles','mobiles','phones'],
    targetKeywords: ['phone','mobile','iphone','samsung','smartphone'],
    targetPriceTiers: ['premium','luxury'],
    revenue: { model: 'CPC', rate: 18, currency: '₹' },
    gradient: 'linear-gradient(135deg,#0a1628 0%,#1a3a5c 100%)',
    accentColor: '#38bdf8',
    impressions: 0, clicks: 0,
    budget: 5000, spent: 0,   // daily budget in ₹
    startDate: '2024-12-01', endDate: '2025-03-31',
  },
  {
    id: 'promo-2', type: 'promoted', status: 'approved',
    advertiser: 'AutoDeals Mumbai',
    advertiserId: 'seller-002',
    label: 'Sponsored',
    badge: '✅ Verified Seller',
    title: 'Honda City 2022 — Single Owner, 18,000 km',
    desc: 'Full service history. Accident free. PUC valid.',
    price: '₹9,50,000', originalPrice: null,
    emoji: '🚗', city: 'Mumbai',
    cta: 'Contact Seller',
    targetCategories: ['Vehicles','vehicles','cars'],
    targetKeywords: ['car','vehicle','honda','bike','sedan'],
    targetPriceTiers: ['premium','luxury'],
    revenue: { model: 'CPC', rate: 35, currency: '₹' },
    gradient: 'linear-gradient(135deg,#0d1f12 0%,#1a3d24 100%)',
    accentColor: '#4ade80',
    impressions: 0, clicks: 0,
    budget: 8000, spent: 0,
    startDate: '2024-12-01', endDate: '2025-06-30',
  },
  {
    id: 'promo-3', type: 'promoted', status: 'approved',
    advertiser: 'Gomti Realty',
    advertiserId: 'seller-003',
    label: 'Sponsored',
    badge: '🏆 Premium Property',
    title: '3BHK Flat — Gomti Nagar, Ready to Move',
    desc: 'Fully furnished, 24/7 security, covered parking. RERA approved.',
    price: '₹65 Lakh', originalPrice: null,
    emoji: '🏠', city: 'Lucknow',
    cta: 'Book Free Visit',
    targetCategories: ['Properties','properties','for_sale','for_rent'],
    targetKeywords: ['flat','house','property','bhk','apartment'],
    targetPriceTiers: ['luxury','premium'],
    revenue: { model: 'CPC', rate: 55, currency: '₹' },
    gradient: 'linear-gradient(135deg,#1a1208 0%,#3d2a0a 100%)',
    accentColor: '#fbbf24',
    impressions: 0, clicks: 0,
    budget: 12000, spent: 0,
    startDate: '2024-12-01', endDate: '2025-09-30',
  },

  // ── BANNER ADS (External brand advertisers) ─────────────────────────────────
  {
    id: 'banner-1', type: 'banner', status: 'approved',
    advertiser: 'HDFC Bank',
    advertiserId: 'hdfc-001',
    label: 'Ad',
    badge: '💳 Finance Partner',
    title: 'Car Loan @ 8.5% p.a. — ₹5,000 Cashback',
    desc: 'HDFC Bank — Instant approval in 10 minutes. No hidden charges.',
    emoji: '🏦', city: null,
    cta: 'Apply Now →',
    targetCategories: ['Vehicles','vehicles','cars','motorcycles'],
    targetKeywords: ['car','bike','vehicle','emi','loan'],
    targetPriceTiers: ['premium','luxury','mid'],
    revenue: { model: 'CPC', rate: 28, currency: '₹' },
    gradient: 'linear-gradient(135deg,#00008b 0%,#0000cd 100%)',
    accentColor: '#93c5fd',
    isExternal: true, url: '#hdfc-car-loan',
    impressions: 0, clicks: 0,
    budget: 20000, spent: 0,
    startDate: '2024-12-01', endDate: '2025-12-31',
  },
  {
    id: 'banner-2', type: 'banner', status: 'approved',
    advertiser: 'Bajaj Allianz',
    advertiserId: 'bajaj-001',
    label: 'Ad',
    badge: '🔒 Insurance',
    title: 'Home Insurance Starting ₹299/year',
    desc: 'Bajaj Allianz — Protect your property from fire, theft & natural calamities.',
    emoji: '🛡️', city: null,
    cta: 'Get Free Quote',
    targetCategories: ['Properties','Furniture','properties','furniture'],
    targetKeywords: ['house','flat','home','property','furniture'],
    targetPriceTiers: ['premium','luxury'],
    revenue: { model: 'CPM', rate: 90, currency: '₹' },
    gradient: 'linear-gradient(135deg,#1a0a2e 0%,#2d1052 100%)',
    accentColor: '#c084fc',
    isExternal: true, url: '#bajaj-insurance',
    impressions: 0, clicks: 0,
    budget: 15000, spent: 0,
    startDate: '2024-12-01', endDate: '2025-06-30',
  },
  {
    id: 'banner-3', type: 'banner', status: 'approved',
    advertiser: 'Cashify India',
    advertiserId: 'cashify-001',
    label: 'Ad',
    badge: '♻️ Best Resale Value',
    title: 'Sell Your Old Phone — Best Price in 60 Seconds',
    desc: 'Cashify — Compare prices, get instant cash. Free pickup from home.',
    emoji: '📲', city: null,
    cta: 'Check Price Free',
    targetCategories: ['Electronics','Mobiles','mobiles','phones'],
    targetKeywords: ['phone','mobile','sell','old','exchange','laptop'],
    targetPriceTiers: ['budget','mid','premium'],
    revenue: { model: 'CPC', rate: 22, currency: '₹' },
    gradient: 'linear-gradient(135deg,#003322 0%,#005533 100%)',
    accentColor: '#34d399',
    isExternal: true, url: '#cashify',
    impressions: 0, clicks: 0,
    budget: 10000, spent: 0,
    startDate: '2024-12-01', endDate: '2025-12-31',
  },

  // ── NATIVE ADS (Addies own upsells — zero cost, 100% profit) ───────────────
  {
    id: 'native-1', type: 'native', status: 'approved',
    advertiser: 'Addies Exchange',
    advertiserId: 'addies',
    label: 'Promoted',
    badge: '⚡ Sell 5x Faster',
    title: 'Boost Your Listing with Gold Badge',
    desc: 'Get top placement, verified badge & 3x more buyer contacts.',
    price: '₹999/year', emoji: '🥇', city: null,
    cta: 'Upgrade Now',
    targetCategories: [],  // show to everyone
    targetKeywords: [],
    targetPriceTiers: [],
    revenue: { model: 'CPC', rate: 0, currency: '₹' }, // internal — direct revenue
    gradient: 'linear-gradient(135deg,#1a1200 0%,#3d2d00 100%)',
    accentColor: '#fbbf24',
    isExternal: false, url: '/dashboard/profile',
    impressions: 0, clicks: 0,
    budget: 999999, spent: 0,
    startDate: '2024-01-01', endDate: '2099-12-31',
  },
  {
    id: 'native-2', type: 'native', status: 'approved',
    advertiser: 'Addies Exchange',
    advertiserId: 'addies',
    label: 'Promoted',
    badge: '🛡️ Trust Matters',
    title: 'Get Verified — Build Buyer Trust',
    desc: 'Verified sellers get 4x more inquiries. Complete KYC free.',
    price: 'Free', emoji: '✅', city: null,
    cta: 'Verify Profile',
    targetCategories: [],
    targetKeywords: [],
    targetPriceTiers: [],
    revenue: { model: 'CPC', rate: 0, currency: '₹' },
    gradient: 'linear-gradient(135deg,#001a2e 0%,#003358 100%)',
    accentColor: '#38bdf8',
    isExternal: false, url: '/dashboard/profile',
    impressions: 0, clicks: 0,
    budget: 999999, spent: 0,
    startDate: '2024-01-01', endDate: '2099-12-31',
  },
];

// ── Smart Ad Picker ─────────────────────────────────────────────────────────────
// Returns `count` best-matching ads based on user interest profile
export function pickAds(profile, currentCategory = 'all', count = 3) {
  const { categories, searches, priceTier } = profile;
  const interests = [...categories, currentCategory]
    .map(s => s?.toLowerCase?.()).filter(Boolean);
  const searchTerms = searches.map(s => s.toLowerCase());

  const now = new Date().toISOString().slice(0, 10);

  const scored = AD_INVENTORY
    .filter(ad =>
      ad.status === 'approved' &&
      ad.startDate <= now && ad.endDate >= now &&
      ad.spent < ad.budget
    )
    .map(ad => {
      let score = 0;

      // Category relevance (highest weight)
      ad.targetCategories.forEach(tc => {
        if (interests.includes(tc.toLowerCase())) score += 12;
      });

      // Keyword match
      ad.targetKeywords.forEach(kw => {
        if (searchTerms.some(s => s.includes(kw))) score += 9;
        if (interests.some(i => i.includes(kw)))   score += 6;
      });

      // Price tier match
      if (ad.targetPriceTiers.includes(priceTier)) score += 5;

      // Universal ads (empty target) always show
      if (ad.targetCategories.length === 0) score += 3;

      // Slight randomness so same ads don't always appear
      score += Math.random() * 4;

      // Penalize overexposed ads (shown too much)
      if (ad.impressions > 1000) score -= 2;

      return { ...ad, _score: score };
    });

  return scored
    .sort((a, b) => b._score - a._score)
    .slice(0, count);
}

// ── Ad Positions in Grid ────────────────────────────────────────────────────────
// positions: array of 0-based indices where an ad should appear in the item grid
// e.g. [4, 9, 14] → ad after every 5 items
export function getAdPositions(itemCount, adsCount) {
  const positions = [];
  const interval  = 5; // 1 ad every 5 items
  for (let i = 0; i < adsCount; i++) {
    const pos = (i + 1) * interval - 1;
    if (pos < itemCount + adsCount) positions.push(pos);
  }
  return positions;
}

// ── Revenue Tracker ─────────────────────────────────────────────────────────────
// In production: POST to /api/ad-events for real billing
const _log = [];

export const RevenueTracker = {
  impression(adId) {
    const ad = AD_INVENTORY.find(a => a.id === adId);
    if (!ad || ad.status !== 'approved') return;
    ad.impressions++;
    if (ad.revenue.model === 'CPM') {
      const earned = ad.revenue.rate / 1000;
      ad.spent += earned;
      _log.push({ adId, type: 'impression', earned, ts: Date.now() });
    }
  },
  click(adId) {
    const ad = AD_INVENTORY.find(a => a.id === adId);
    if (!ad || ad.status !== 'approved') return;
    ad.clicks++;
    if (ad.revenue.model === 'CPC') {
      ad.spent += ad.revenue.rate;
      _log.push({ adId, type: 'click', earned: ad.revenue.rate, ts: Date.now() });
      console.info(`[AdRevenue] ₹${ad.revenue.rate} earned — click on "${ad.title}"`);
    }
  },
  getTodayRevenue() {
    const today = new Date().setHours(0,0,0,0);
    return _log
      .filter(l => l.ts >= today)
      .reduce((s, l) => s + l.earned, 0)
      .toFixed(2);
  },
  getTotal() {
    return _log.reduce((s, l) => s + l.earned, 0).toFixed(2);
  },
  getLog() { return [..._log]; },
};
