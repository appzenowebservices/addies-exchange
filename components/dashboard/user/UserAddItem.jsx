"use client";
// src/components/dashboard/user/UserAddItem.jsx
// Location: C:\xampp\htdocs\addies-exchange\src\components\dashboard\user\UserAddItem.jsx

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, CheckCircle, Upload, X,
  MapPin, Tag, FileText, Settings, Eye,
  Car, Home, Smartphone, Sofa, Shirt, Zap,
  PawPrint, BookOpen, Baby, Briefcase, Wrench, Factory, Package
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { mockAPI } from '../../../server/trpcClient';

// ─── CATEGORY DATA ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'vehicles', label: 'Vehicles', emoji: '🏷', icon: Car, color: '#f97316', bg: '#fff7ed',
    border: '#fed7aa',
    subs: [
      { id: 'cars', label: '🚗 Cars', items: ['Hatchback','Sedan','SUV','Luxury Cars','Electric Cars','Commercial Cars'] },
      { id: 'motorcycles', label: '🏍 Motorcycles', items: ['Standard Bikes','Sports Bikes','Cruiser','Scooters','Electric Two Wheelers'] },
      { id: 'commercial', label: '🚛 Commercial Vehicles', items: ['Trucks','Pickups','Vans','Tempo','Auto Rickshaw'] },
      { id: 'other_vehicles', label: '🚜 Other Vehicles', items: ['Tractor','Construction Equipment','Boats'] },
    ],
  },
  {
    id: 'properties', label: 'Properties', emoji: '🏠', icon: Home, color: '#22c55e', bg: '#f0fdf4',
    border: '#bbf7d0',
    subs: [
      { id: 'for_sale', label: '🏢 For Sale', items: ['Flats / Apartments','Independent House','Villa','Plot / Land','Commercial Property','Farm House'] },
      { id: 'for_rent', label: '🏘 For Rent', items: ['Flats / Apartments','Independent House','PG / Hostel','Office Space','Shops / Showrooms'] },
    ],
  },
  {
    id: 'mobiles', label: 'Mobiles & Gadgets', emoji: '📱', icon: Smartphone, color: '#3b82f6', bg: '#eff6ff',
    border: '#bfdbfe',
    subs: [
      { id: 'phones', label: '📱 Mobile Phones', items: ['Smartphones','Feature Phones'] },
      { id: 'electronics_gadgets', label: '💻 Electronics', items: ['Laptops','Tablets','Desktop','Monitors','Printers'] },
      { id: 'accessories', label: '🎮 Accessories', items: ['Headphones','Smartwatch','Power Bank','Chargers','Gaming Consoles'] },
    ],
  },
  {
    id: 'furniture', label: 'Furniture & Home', emoji: '🛋', icon: Sofa, color: '#a855f7', bg: '#faf5ff',
    border: '#e9d5ff',
    subs: [
      { id: 'furniture_items', label: '🛋 Furniture', items: ['Sofa','Beds','Wardrobe','Dining Table','Chairs','TV Unit','Office Furniture'] },
      { id: 'home_decor', label: '🪴 Home Decor', items: ['Curtains','Carpets','Home Decor Items'] },
    ],
  },
  {
    id: 'fashion', label: 'Fashion', emoji: '👕', icon: Shirt, color: '#ec4899', bg: '#fdf2f8',
    border: '#fbcfe8',
    subs: [
      { id: 'men', label: '👗 Men', items: ['Shirts','T-Shirts','Jeans','Jackets','Shoes'] },
      { id: 'women', label: '👠 Women', items: ['Saree','Kurti','Dresses','Handbags','Footwear'] },
      { id: 'kids_fashion', label: '🧒 Kids', items: ['Kids Clothing','School Uniform','Kids Footwear'] },
    ],
  },
  {
    id: 'appliances', label: 'Electronics & Appliances', emoji: '🏗', icon: Zap, color: '#eab308', bg: '#fefce8',
    border: '#fde68a',
    subs: [
      { id: 'appliances_items', label: '⚡ Appliances', items: ['Refrigerator','Washing Machine','AC','TV','Microwave','Geyser','Air Cooler','Inverter','Water Purifier'] },
    ],
  },
  {
    id: 'pets', label: 'Pets', emoji: '🐶', icon: PawPrint, color: '#14b8a6', bg: '#f0fdfa',
    border: '#99f6e4',
    subs: [
      { id: 'pets_items', label: '🐾 Pets', items: ['Dogs','Cats','Birds','Fish','Pet Accessories'] },
    ],
  },
  {
    id: 'books_sports', label: 'Books, Sports & Hobbies', emoji: '🎮', icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff',
    border: '#ddd6fe',
    subs: [
      { id: 'books', label: '📚 Books', items: ['School Books','Competitive Exam Books','Fiction'] },
      { id: 'sports_hobbies', label: '⚽ Sports & Hobbies', items: ['Sports Equipment','Gym Equipment','Musical Instruments','Art Supplies'] },
    ],
  },
  {
    id: 'baby_kids', label: 'Baby & Kids', emoji: '👶', icon: Baby, color: '#06b6d4', bg: '#ecfeff',
    border: '#a5f3fc',
    subs: [
      { id: 'baby_items', label: '🍼 Baby & Kids', items: ['Baby Clothes','Toys','Baby Stroller','Feeding Products','Baby Furniture'] },
    ],
  },
  {
    id: 'jobs', label: 'Jobs', emoji: '💼', icon: Briefcase, color: '#64748b', bg: '#f8fafc',
    border: '#cbd5e1',
    subs: [
      { id: 'job_types', label: '💼 Job Types', items: ['IT Jobs','Sales Jobs','Marketing Jobs','Part Time Jobs','Work From Home','Driver Jobs'] },
    ],
  },
  {
    id: 'services', label: 'Services', emoji: '🛠', icon: Wrench, color: '#f43f5e', bg: '#fff1f2',
    border: '#fecdd3',
    subs: [
      { id: 'service_types', label: '🔧 Services', items: ['Home Cleaning','Electrician','Plumber','Carpenter','Tuition','Event Management','Photography','Digital Marketing'] },
    ],
  },
  {
    id: 'business', label: 'Business & Industrial', emoji: '🏭', icon: Factory, color: '#78716c', bg: '#fafaf9',
    border: '#d6d3d1',
    subs: [
      { id: 'business_items', label: '🏭 Industrial', items: ['Industrial Machinery','Raw Materials','Shop Equipment','Restaurant Equipment','Packaging Materials'] },
    ],
  },
  {
    id: 'others', label: 'Others', emoji: '🧾', icon: Package, color: '#6b7280', bg: '#f9fafb',
    border: '#e5e7eb',
    subs: [
      { id: 'others_items', label: '📦 Others', items: ['Scrap','Tickets','Coupons','Miscellaneous'] },
    ],
  },
];

// ─── DYNAMIC ATTRIBUTE GROUPS ─────────────────────────────────────────────────
const ATTRIBUTES = {
  cars: [
    { key: 'fuel_type',   label: 'Fuel Type',   type: 'select', opts: ['Petrol','Diesel','CNG','Electric','Hybrid'] },
    { key: 'km_driven',   label: 'KM Driven',   type: 'number', placeholder: 'e.g. 45000' },
    { key: 'owner_type',  label: 'Owner Type',  type: 'select', opts: ['1st Owner','2nd Owner','3rd Owner','4th+ Owner'] },
    { key: 'year',        label: 'Year',         type: 'select', opts: Array.from({length:25},(_,i)=>`${2024-i}`) },
    { key: 'transmission',label: 'Transmission', type: 'select', opts: ['Manual','Automatic','AMT','CVT'] },
    { key: 'color',       label: 'Color',        type: 'text',   placeholder: 'e.g. White' },
  ],
  motorcycles: [
    { key: 'km_driven',   label: 'KM Driven',   type: 'number', placeholder: 'e.g. 12000' },
    { key: 'owner_type',  label: 'Owner Type',  type: 'select', opts: ['1st Owner','2nd Owner','3rd Owner'] },
    { key: 'year',        label: 'Year',         type: 'select', opts: Array.from({length:20},(_,i)=>`${2024-i}`) },
    { key: 'fuel_type',   label: 'Fuel Type',   type: 'select', opts: ['Petrol','Electric'] },
  ],
  commercial: [
    { key: 'km_driven',  label: 'KM Driven',  type: 'number', placeholder: 'e.g. 80000' },
    { key: 'year',       label: 'Year',        type: 'select', opts: Array.from({length:20},(_,i)=>`${2024-i}`) },
    { key: 'load_cap',   label: 'Load Capacity (Ton)', type: 'text', placeholder: 'e.g. 2.5' },
  ],
  for_sale: [
    { key: 'area_sqft',   label: 'Area (sq ft)',   type: 'number', placeholder: 'e.g. 1200' },
    { key: 'bedrooms',    label: 'Bedrooms',        type: 'select', opts: ['1 BHK','2 BHK','3 BHK','4 BHK','4+ BHK','Studio'] },
    { key: 'furnished',   label: 'Furnished Type',  type: 'select', opts: ['Fully Furnished','Semi Furnished','Unfurnished'] },
    { key: 'floor',       label: 'Floor',           type: 'text',   placeholder: 'e.g. 3rd of 10' },
    { key: 'facing',      label: 'Facing',          type: 'select', opts: ['East','West','North','South','North-East','North-West','South-East','South-West'] },
    { key: 'parking',     label: 'Parking',         type: 'select', opts: ['Available','Not Available'] },
  ],
  for_rent: [
    { key: 'area_sqft',   label: 'Area (sq ft)',   type: 'number', placeholder: 'e.g. 900' },
    { key: 'bedrooms',    label: 'Bedrooms',        type: 'select', opts: ['1 BHK','2 BHK','3 BHK','4 BHK','Studio','PG Room'] },
    { key: 'furnished',   label: 'Furnished Type',  type: 'select', opts: ['Fully Furnished','Semi Furnished','Unfurnished'] },
    { key: 'available_from', label: 'Available From', type: 'date' },
    { key: 'deposit',     label: 'Security Deposit (₹)', type: 'number', placeholder: 'e.g. 50000' },
    { key: 'preferred_tenant', label: 'Preferred Tenant', type: 'select', opts: ['Family','Bachelor','Any'] },
  ],
  phones: [
    { key: 'brand',   label: 'Brand',   type: 'select', opts: ['Apple','Samsung','OnePlus','Xiaomi','Realme','Vivo','Oppo','Motorola','Nokia','Others'] },
    { key: 'ram',     label: 'RAM',     type: 'select', opts: ['2 GB','3 GB','4 GB','6 GB','8 GB','12 GB','16 GB'] },
    { key: 'storage', label: 'Storage', type: 'select', opts: ['16 GB','32 GB','64 GB','128 GB','256 GB','512 GB','1 TB'] },
    { key: 'warranty',label: 'Warranty',type: 'select', opts: ['Under Warranty','Out of Warranty','No Warranty'] },
  ],
  electronics_gadgets: [
    { key: 'brand',   label: 'Brand',   type: 'text',   placeholder: 'e.g. Dell, Apple, HP' },
    { key: 'ram',     label: 'RAM',     type: 'select', opts: ['4 GB','8 GB','16 GB','32 GB','64 GB'] },
    { key: 'storage', label: 'Storage', type: 'select', opts: ['128 GB','256 GB','512 GB','1 TB','2 TB'] },
    { key: 'warranty',label: 'Warranty',type: 'select', opts: ['Under Warranty','Out of Warranty','No Warranty'] },
  ],
  job_types: [
    { key: 'salary_from',  label: 'Salary From (₹/month)', type: 'number', placeholder: 'e.g. 15000' },
    { key: 'salary_to',    label: 'Salary To (₹/month)',   type: 'number', placeholder: 'e.g. 30000' },
    { key: 'experience',   label: 'Experience Required',   type: 'select', opts: ['Fresher','0-1 Year','1-3 Years','3-5 Years','5-10 Years','10+ Years'] },
    { key: 'job_type',     label: 'Job Type',             type: 'select', opts: ['Full Time','Part Time','Contract','Internship','Work From Home'] },
    { key: 'qualification',label: 'Qualification',        type: 'select', opts: ['10th Pass','12th Pass','Graduate','Post Graduate','Any'] },
  ],
};

// ─── CONDITIONS ───────────────────────────────────────────────────────────────
const CONDITIONS = [
  { id: 'new',       label: 'Brand New',  desc: 'Never used',        emoji: '✨' },
  { id: 'like_new',  label: 'Like New',   desc: 'Barely used',       emoji: '💎' },
  { id: 'good',      label: 'Good',       desc: 'Minor wear',        emoji: '👍' },
  { id: 'fair',      label: 'Fair',       desc: 'Visible wear',      emoji: '🔧' },
  { id: 'for_parts', label: 'For Parts',  desc: 'Not fully working', emoji: '⚙️' },
];

// ─── STEPS ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Category',    icon: Tag },
  { id: 2, label: 'Details',     icon: FileText },
  { id: 3, label: 'Attributes',  icon: Settings },
  { id: 4, label: 'Photos',      icon: Upload },
  { id: 5, label: 'Location',    icon: MapPin },
  { id: 6, label: 'Preview',     icon: Eye },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function UserAddItem() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors,  setErrors]  = useState({});

  const [form, setForm] = useState({
    category: '', sub: '', subItem: '',
    title: '', price: '', condition: 'good', description: '',
    city: user.city || '', state: '', area: '',
    attributes: {},
    photos: [],
    negotiable: false,
  });

  const set = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  }, []);

  const setAttr = (key, val) => setForm(f => ({ ...f, attributes: { ...f.attributes, [key]: val } }));

  const selCat    = CATEGORIES.find(c => c.id === form.category);
  const selSub    = selCat?.subs.find(s => s.id === form.sub);
  const attrDefs  = ATTRIBUTES[form.sub] || [];

  // ── Validation per step ──────────────────────────────────────────────────
  const validate = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.category) errs.category = 'Category select karo';
      if (!form.sub)      errs.sub      = 'Sub-category select karo';
      if (!form.subItem)  errs.subItem  = 'Type select karo';
    }
    if (s === 2) {
      if (!form.title.trim())                                       errs.title       = 'Title zaroori hai';
      if (!form.price || isNaN(+form.price) || +form.price <= 0)   errs.price       = 'Valid price dalo';
      if (!form.description.trim() || form.description.length < 20) errs.description = 'Description kam se kam 20 characters honi chahiye';
    }
    if (s === 5) {
      if (!form.city.trim()) errs.city = 'City zaroori hai';
    }
    return errs;
  };

  const next = () => {
    // Skip attributes step if no attributes for this sub
    const targetStep = step === 2 && attrDefs.length === 0 ? 4 : step + 1;
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(targetStep);
  };

  const prev = () => {
    const targetStep = step === 4 && attrDefs.length === 0 ? 2 : step - 1;
    setStep(targetStep);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    setForm(f => ({ ...f, photos: [...f.photos, ...previews].slice(0, 8) }));
  };

  const removePhoto = (i) => setForm(f => ({ ...f, photos: f.photos.filter((_,idx) => idx !== i) }));

  const handleSubmit = async () => {
    const errs = validate(5);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await mockAPI.addItem({
        title:       form.title,
        category:    form.category,
        sub:         form.sub,
        subItem:     form.subItem,
        price:       +form.price,
        condition:   form.condition,
        description: form.description,
        city:        form.city,
        state:       form.state,
        area:        form.area,
        attributes:  form.attributes,
        negotiable:  form.negotiable,
        sellerId:    user.id,
        sellerName:  user.name,
        image:       selCat?.emoji || '📦',
      });
      setSuccess(true);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Success Screen ──────────────────────────────────────────────────────
  if (success) return (
    <div style={styles.successWrap}>
      <div style={styles.successCard}>
        <div style={styles.successAnim}>🎉</div>
        <h3 style={styles.successTitle}>Listing Live Ho Gayi!</h3>
        <p style={styles.successSub}>Tumhari item ab marketplace pe visible hai. Buyers contact karenge.</p>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard/listings')}>My Listings</button>
          <button className="btn btn-primary" onClick={() => { setSuccess(false); setStep(1); setForm({ category:'',sub:'',subItem:'',title:'',price:'',condition:'good',description:'',city:user.city||'',state:'',area:'',attributes:{},photos:[],negotiable:false }); }}>
            + Add More
          </button>
        </div>
      </div>
    </div>
  );

  // ── Progress bar ─────────────────────────────────────────────────────────
  const activeSteps = attrDefs.length === 0
    ? STEPS.filter(s => s.id !== 3)
    : STEPS;
  const currentIndex  = activeSteps.findIndex(s => s.id === step);
  const progressPct   = ((currentIndex) / (activeSteps.length - 1)) * 100;

  return (
    <div style={styles.wrap}>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 className="page-title">Naya Item List Karo</h2>
          <p className="page-sub">Apna item 6 simple steps mein marketplace pe list karo</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* ── Stepper Sidebar ── */}
        <aside style={styles.sidebar}>
          <div style={styles.sideCard}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
            </div>
            <p style={styles.progressLabel}>{Math.round(progressPct)}% complete</p>

            {activeSteps.map((s, i) => {
              const Icon     = s.icon;
              const isDone   = currentIndex > i;
              const isActive = s.id === step;
              return (
                <div key={s.id} style={{
                  ...styles.stepItem,
                  ...(isActive ? styles.stepActive : {}),
                  ...(isDone   ? styles.stepDone   : {}),
                }}>
                  <div style={{
                    ...styles.stepBall,
                    background: isDone ? '#22c55e' : isActive ? 'var(--primary-600)' : 'var(--primary-100)',
                    color:      isDone || isActive ? 'white' : 'var(--text-muted)',
                  }}>
                    {isDone ? <CheckCircle size={14}/> : <Icon size={14}/>}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary-700)' : isDone ? '#16a34a' : 'var(--text-muted)',
                  }}>{s.label}</span>
                </div>
              );
            })}

            {/* Quick tips */}
            <div style={styles.tipBox}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary-700)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 Tips</div>
              {step === 1 && <p style={styles.tipText}>Sahi category se buyers jaldi milte hain!</p>}
              {step === 2 && <p style={styles.tipText}>Detailed title aur description se zyada response milta hai.</p>}
              {step === 3 && <p style={styles.tipText}>Attributes fill karne se listing search mein aur upar aati hai.</p>}
              {step === 4 && <p style={styles.tipText}>4-8 photos wali listings 3x zyada views leti hain!</p>}
              {step === 5 && <p style={styles.tipText}>Sahi city/area se nearby buyers aasani se contact kar sakte hain.</p>}
              {step === 6 && <p style={styles.tipText}>Preview check karo, phir publish karo!</p>}
            </div>
          </div>
        </aside>

        {/* ── Main Form Area ── */}
        <main style={styles.main}>
          <div style={styles.card}>

            {/* ══ STEP 1: CATEGORY ════════════════════════════════════════ */}
            {step === 1 && (
              <div>
                <StepHeader title="Category Chunno" sub="Apne item ki sahi category select karo" />

                {/* Main categories grid */}
                <div style={styles.catGrid}>
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const sel  = form.category === cat.id;
                    return (
                      <button key={cat.id} type="button"
                        onClick={() => { set('category', cat.id); set('sub', ''); set('subItem', ''); }}
                        style={{
                          ...styles.catBtn,
                          background:   sel ? cat.bg    : 'white',
                          borderColor:  sel ? cat.color : '#e5e7eb',
                          boxShadow:    sel ? `0 0 0 2px ${cat.color}` : 'none',
                          transform:    sel ? 'scale(1.03)' : 'scale(1)',
                        }}>
                        <span style={{ fontSize: 26 }}>{cat.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: sel ? cat.color : 'var(--text-primary)', textAlign:'center', lineHeight: 1.3 }}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.category && <ErrMsg msg={errors.category} />}

                {/* Sub categories */}
                {selCat && (
                  <div style={{ marginTop: 24 }}>
                    <Label text="Sub-Category" />
                    <div style={styles.subGrid}>
                      {selCat.subs.map(sub => (
                        <button key={sub.id} type="button"
                          onClick={() => { set('sub', sub.id); set('subItem', ''); }}
                          style={{
                            ...styles.subBtn,
                            background:  form.sub === sub.id ? selCat.bg : '#f9fafb',
                            borderColor: form.sub === sub.id ? selCat.color : '#e5e7eb',
                            color:       form.sub === sub.id ? selCat.color : 'var(--text-primary)',
                            fontWeight:  form.sub === sub.id ? 700 : 500,
                          }}>
                          {sub.label}
                        </button>
                      ))}
                    </div>
                    {errors.sub && <ErrMsg msg={errors.sub} />}
                  </div>
                )}

                {/* Sub-items (type) */}
                {selSub && (
                  <div style={{ marginTop: 20 }}>
                    <Label text="Type" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selSub.items.map(item => (
                        <button key={item} type="button"
                          onClick={() => set('subItem', item)}
                          style={{
                            ...styles.chipBtn,
                            background:  form.subItem === item ? selCat.color : '#f1f5f9',
                            color:       form.subItem === item ? 'white' : 'var(--text-primary)',
                            borderColor: form.subItem === item ? selCat.color : '#e2e8f0',
                          }}>
                          {item}
                        </button>
                      ))}
                    </div>
                    {errors.subItem && <ErrMsg msg={errors.subItem} />}
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 2: DETAILS ══════════════════════════════════════════ */}
            {step === 2 && (
              <div>
                <StepHeader title="Item Details" sub="Title, price aur condition batao" />

                <div style={styles.formStack}>
                  {/* Selected path breadcrumb */}
                  <div style={styles.breadcrumb}>
                    <span>{selCat?.emoji} {selCat?.label}</span>
                    <ChevronRight size={12}/>
                    <span>{selSub?.label}</span>
                    <ChevronRight size={12}/>
                    <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{form.subItem}</span>
                  </div>

                  <div className="form-group">
                    <Label text="Item Title *" />
                    <input className={`form-input ${errors.title?'error':''}`}
                      placeholder={`e.g. ${form.subItem || 'Item'} - Brand, Year, Model`}
                      value={form.title} onChange={e => set('title', e.target.value)} />
                    {errors.title && <ErrMsg msg={errors.title} />}
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{form.title.length}/100 — specific title se zyada clicks milte hain</span>
                  </div>

                  <div style={{ display:'flex', gap:16 }}>
                    <div className="form-group" style={{ flex:1 }}>
                      <Label text="Price (₹) *" />
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontWeight:800, color:'var(--primary-600)', fontSize:16 }}>₹</span>
                        <input className={`form-input ${errors.price?'error':''}`}
                          style={{ paddingLeft:32 }}
                          type="number" placeholder="0"
                          value={form.price} onChange={e => set('price', e.target.value)} />
                      </div>
                      {errors.price && <ErrMsg msg={errors.price} />}
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13 }}>
                        <input type="checkbox" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)} style={{ width:16, height:16 }} />
                        <span>Negotiable</span>
                      </label>
                    </div>
                  </div>

                  {/* Condition selector */}
                  <div className="form-group">
                    <Label text="Condition *" />
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {CONDITIONS.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => set('condition', c.id)}
                          style={{
                            padding: '10px 14px', borderRadius: 10, border: '2px solid',
                            borderColor: form.condition === c.id ? 'var(--primary-500)' : '#e5e7eb',
                            background:  form.condition === c.id ? 'var(--primary-50)' : 'white',
                            cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                            minWidth: 80, transition:'all 0.15s',
                          }}>
                          <span style={{ fontSize:20 }}>{c.emoji}</span>
                          <span style={{ fontSize:11, fontWeight:700, color: form.condition===c.id?'var(--primary-700)':'var(--text-primary)' }}>{c.label}</span>
                          <span style={{ fontSize:10, color:'var(--text-muted)' }}>{c.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <Label text="Description *" />
                    <textarea className={`form-input ${errors.description?'error':''}`}
                      rows={5} style={{ resize:'vertical', minHeight:100 }}
                      placeholder={`${form.subItem || 'Item'} ke baare mein detail se batao — age, brand, koi defect hai to wo bhi batao, reason for selling, kya included hai…`}
                      value={form.description} onChange={e => set('description', e.target.value)}
                      maxLength={2000}
                    />
                    {errors.description && <ErrMsg msg={errors.description} />}
                    <span style={{ fontSize:11, color:'var(--text-muted)', textAlign:'right', alignSelf:'flex-end' }}>{form.description.length}/2000</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 3: ATTRIBUTES ══════════════════════════════════════ */}
            {step === 3 && attrDefs.length > 0 && (
              <div>
                <StepHeader
                  title={`${selSub?.label || ''} Details`}
                  sub="Yeh fields listing ko search mein boost karti hain"
                />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16 }}>
                  {attrDefs.map(attr => (
                    <div className="form-group" key={attr.key}>
                      <Label text={attr.label} />
                      {attr.type === 'select' ? (
                        <select className="form-select"
                          value={form.attributes[attr.key] || ''}
                          onChange={e => setAttr(attr.key, e.target.value)}>
                          <option value="">Select…</option>
                          {attr.opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : attr.type === 'date' ? (
                        <input className="form-input" type="date"
                          value={form.attributes[attr.key] || ''}
                          onChange={e => setAttr(attr.key, e.target.value)} />
                      ) : (
                        <input className="form-input"
                          type={attr.type === 'number' ? 'number' : 'text'}
                          placeholder={attr.placeholder || ''}
                          value={form.attributes[attr.key] || ''}
                          onChange={e => setAttr(attr.key, e.target.value)} />
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:16 }}>
                  ℹ️ Yeh fields optional hain but bharni chahiye — buyers filter karke dhoondh sakte hain.
                </p>
              </div>
            )}

            {/* ══ STEP 4: PHOTOS ══════════════════════════════════════════ */}
            {step === 4 && (
              <div>
                <StepHeader title="Photos Upload Karo" sub="Zyada photos = zyada buyers. Max 8 photos." />

                {/* Upload zone */}
                <label style={styles.uploadZone}>
                  <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handlePhotoUpload} />
                  <div style={{ fontSize:40, marginBottom:8 }}>📸</div>
                  <div style={{ fontWeight:700, fontSize:15 }}>Photos chunne ke liye click karo</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>JPG, PNG · Max 8 photos · {form.photos.length}/8 uploaded</div>
                </label>

                {form.photos.length > 0 && (
                  <div style={styles.photoGrid}>
                    {form.photos.map((p, i) => (
                      <div key={i} style={styles.photoThumb}>
                        <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:10 }} />
                        {i === 0 && <span style={styles.mainBadge}>Main</span>}
                        <button type="button" onClick={() => removePhoto(i)} style={styles.removeBtn}>
                          <X size={12}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {form.photos.length === 0 && (
                  <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)', fontSize:13 }}>
                    📷 Abhi koi photo nahi — listing phir bhi publish ho sakti hai
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 5: LOCATION ════════════════════════════════════════ */}
            {step === 5 && (
              <div>
                <StepHeader title="Location" sub="Buyers ko pata chalega item kahan hai" />
                <div style={styles.formStack}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div className="form-group">
                      <Label text="City *" />
                      <input className={`form-input ${errors.city?'error':''}`}
                        placeholder="e.g. Lucknow"
                        value={form.city} onChange={e => set('city', e.target.value)} />
                      {errors.city && <ErrMsg msg={errors.city} />}
                    </div>
                    <div className="form-group">
                      <Label text="State" />
                      <input className="form-input" placeholder="e.g. Uttar Pradesh"
                        value={form.state} onChange={e => set('state', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <Label text="Area / Locality" />
                    <input className="form-input" placeholder="e.g. Gomti Nagar, Hazratganj"
                      value={form.area} onChange={e => set('area', e.target.value)} />
                  </div>
                  <div style={styles.locationTip}>
                    <MapPin size={14} style={{ color:'var(--primary-600)', flexShrink:0 }}/>
                    <span>Exact address publish nahi hoga — sirf city/area buyers ko dikhega.</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 6: PREVIEW ════════════════════════════════════════ */}
            {step === 6 && (
              <div>
                <StepHeader title="Preview & Publish" sub="Sab sahi hai? Phir publish karo!" />

                <div style={styles.previewCard}>
                  <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                    {form.photos[0]
                      ? <img src={form.photos[0].url} alt="" style={{ width:90, height:90, objectFit:'cover', borderRadius:12, flexShrink:0 }}/>
                      : <div style={{ width:90, height:90, background:'var(--primary-100)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, flexShrink:0 }}>{selCat?.emoji}</div>
                    }
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>{form.title || '(No title)'}</div>
                      <div style={{ fontSize:22, fontWeight:900, color:'var(--primary-700)', marginBottom:6 }}>
                        ₹{form.price ? (+form.price).toLocaleString('en-IN') : '0'}
                        {form.negotiable && <span style={{ fontSize:11, fontWeight:600, color:'#16a34a', marginLeft:8, background:'#dcfce7', padding:'2px 8px', borderRadius:99 }}>Negotiable</span>}
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span className="badge badge-blue" style={{fontSize:10}}>{selCat?.label}</span>
                        <span className="badge badge-gray" style={{fontSize:10}}>{selSub?.label}</span>
                        <span className="badge badge-green" style={{fontSize:10}}>{form.subItem}</span>
                        <span className="badge badge-orange" style={{fontSize:10}}>{CONDITIONS.find(c=>c.id===form.condition)?.label}</span>
                      </div>
                    </div>
                  </div>

                  {form.description && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
                      {form.description.slice(0,200)}{form.description.length>200?'…':''}
                    </div>
                  )}

                  <div style={{ display:'flex', gap:16, marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)' }}>
                    <span>📍 {[form.area, form.city, form.state].filter(Boolean).join(', ') || 'Location not set'}</span>
                    <span>📸 {form.photos.length} photos</span>
                  </div>

                  {/* Attributes preview */}
                  {Object.keys(form.attributes).length > 0 && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', gap:8, flexWrap:'wrap' }}>
                      {Object.entries(form.attributes).filter(([,v])=>v).map(([k,v]) => (
                        <span key={k} style={{ background:'var(--primary-50)', color:'var(--primary-700)', border:'1px solid var(--primary-100)', borderRadius:99, padding:'3px 10px', fontSize:11, fontWeight:600 }}>
                          {attrDefs.find(a=>a.key===k)?.label || k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop:16, padding:14, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, fontSize:13, color:'#166534', display:'flex', gap:8, alignItems:'center' }}>
                  <CheckCircle size={16} color="#16a34a"/>
                  Publish karte hi listing live ho jayegi. Baad mein My Listings se edit kar sakte ho.
                </div>
              </div>
            )}

            {/* ── Navigation Buttons ── */}
            <div style={styles.navRow}>
              {step > 1 && (
                <button type="button" className="btn btn-secondary" onClick={prev}>
                  <ChevronLeft size={16}/> Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < 6 ? (
                <button type="button" className="btn btn-primary" onClick={next}>
                  Next <ChevronRight size={16}/>
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}
                  style={{ minWidth: 160, fontWeight: 800 }}>
                  {loading
                    ? <><div className="spinner" style={{ width:15, height:15 }}/>Publishing…</>
                    : <>🚀 Publish Listing</>
                  }
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── SMALL HELPERS ─────────────────────────────────────────────────────────────
function StepHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:20, fontWeight:800, margin:0, marginBottom:4 }}>{title}</h3>
      <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0 }}>{sub}</p>
    </div>
  );
}
function Label({ text }) {
  return <label className="form-label" style={{ display:'block', marginBottom:6 }}>{text}</label>;
}
function ErrMsg({ msg }) {
  return <span style={{ fontSize:12, color:'#dc2626', display:'block', marginTop:4 }}>⚠️ {msg}</span>;
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const styles = {
  wrap:        { paddingBottom: 40 },
  layout:      { display:'grid', gridTemplateColumns:'220px 1fr', gap:20, alignItems:'start', marginTop:20 },
  sidebar:     { position:'sticky', top:20 },
  sideCard:    { background:'white', borderRadius:16, border:'1px solid var(--border)', padding:20, boxShadow:'var(--shadow-sm)' },
  progressBar: { height:6, background:'var(--primary-100)', borderRadius:99, marginBottom:6, overflow:'hidden' },
  progressFill:{ height:'100%', background:'linear-gradient(90deg, var(--primary-500), var(--primary-700))', borderRadius:99, transition:'width 0.4s ease' },
  progressLabel:{ fontSize:11, color:'var(--text-muted)', marginBottom:16, fontWeight:600 },
  stepItem:    { display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, marginBottom:4, cursor:'default', transition:'all 0.2s' },
  stepActive:  { background:'var(--primary-50)', border:'1px solid var(--primary-200)' },
  stepDone:    { background:'#f0fdf4' },
  stepBall:    { width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' },
  tipBox:      { marginTop:20, padding:'12px 14px', background:'var(--primary-50)', borderRadius:10, border:'1px solid var(--primary-100)' },
  tipText:     { fontSize:12, color:'var(--primary-700)', lineHeight:1.5, margin:0 },
  main:        { minWidth:0 },
  card:        { background:'white', borderRadius:16, border:'1px solid var(--border)', padding:28, boxShadow:'var(--shadow-sm)' },
  catGrid:     { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px,1fr))', gap:10 },
  catBtn:      { display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'14px 8px', borderRadius:12, border:'2px solid', cursor:'pointer', transition:'all 0.2s', background:'white' },
  subGrid:     { display:'flex', flexWrap:'wrap', gap:8 },
  subBtn:      { padding:'8px 14px', borderRadius:99, border:'2px solid', cursor:'pointer', fontSize:13, transition:'all 0.15s', background:'#f9fafb' },
  chipBtn:     { padding:'6px 12px', borderRadius:99, border:'1.5px solid', cursor:'pointer', fontSize:12, fontWeight:500, transition:'all 0.15s' },
  formStack:   { display:'flex', flexDirection:'column', gap:18 },
  breadcrumb:  { display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)', background:'var(--primary-50)', borderRadius:8, padding:'8px 12px', border:'1px solid var(--primary-100)', flexWrap:'wrap' },
  uploadZone:  { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'2.5px dashed var(--primary-300)', borderRadius:14, padding:'36px 20px', cursor:'pointer', background:'var(--primary-50)', transition:'all 0.2s', marginBottom:20 },
  photoGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(90px,1fr))', gap:10 },
  photoThumb:  { position:'relative', aspectRatio:'1', borderRadius:10, overflow:'hidden', border:'2px solid var(--border)' },
  mainBadge:   { position:'absolute', top:4, left:4, background:'var(--primary-600)', color:'white', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:99 },
  removeBtn:   { position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.6)', color:'white', border:'none', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  locationTip: { display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-secondary)', background:'var(--primary-50)', padding:'10px 14px', borderRadius:8, border:'1px solid var(--primary-100)' },
  previewCard: { background:'var(--primary-50)', border:'2px solid var(--primary-200)', borderRadius:14, padding:20 },
  navRow:      { display:'flex', alignItems:'center', gap:12, marginTop:28, paddingTop:20, borderTop:'1px solid var(--border)' },
  successWrap: { display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 },
  successCard: { background:'white', borderRadius:20, border:'1px solid var(--border)', padding:48, textAlign:'center', maxWidth:440, boxShadow:'var(--shadow-lg)' },
  successAnim: { fontSize:64, marginBottom:16, animation:'none' },
  successTitle:{ fontFamily:'Roboto,sans-serif', fontSize:24, fontWeight:800, margin:0, marginBottom:8 },
  successSub:  { color:'var(--text-secondary)', fontSize:14, marginBottom:28 },
};

// ─── Responsive: sidebar collapse on small screens ─────────────────────────────
const mediaStyle = document.createElement('style');
mediaStyle.textContent = `
  @media (max-width: 700px) {
    .additem-layout { grid-template-columns: 1fr !important; }
    .additem-sidebar { position: static !important; }
  }
`;
if (!document.getElementById('additem-media')) {
  mediaStyle.id = 'additem-media';
  document.head.appendChild(mediaStyle);
}

