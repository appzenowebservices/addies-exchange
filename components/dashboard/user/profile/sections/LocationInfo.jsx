"use client";
// src/components/dashboard/user/profile/sections/LocationInfo.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const COUNTRIES = ['India', 'USA', 'UK', 'UAE', 'Canada', 'Australia'];

const STATES_IN = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Kerala',
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Goa', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Madhya Pradesh', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Sikkim', 'Tripura', 'Uttarakhand', 'Assam',
  'Jammu and Kashmir', 'Ladakh',
  'Chandigarh', 'Puducherry', 'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep',
];

// ─── State name matcher ────────────────────────────────────────────────────────
function matchState(regionFromAPI) {
  if (!regionFromAPI) return '';
  const api = regionFromAPI.toLowerCase().trim();

  const direct = STATES_IN.find(s => s.toLowerCase() === api);
  if (direct) return direct;

  const ALIAS = {
    'up':   'Uttar Pradesh',
    'mp':   'Madhya Pradesh',
    'ap':   'Andhra Pradesh',
    'wb':   'West Bengal',
    'tn':   'Tamil Nadu',
    'hp':   'Himachal Pradesh',
    'jk':   'Jammu and Kashmir',
    'j&k':  'Jammu and Kashmir',
    'uk':   'Uttarakhand',
    'ua':   'Uttarakhand',
    'nct':  'Delhi',
    'nct of delhi':                       'Delhi',
    'national capital territory of delhi':'Delhi',
    'national capital territory':         'Delhi',
    'new delhi':                          'Delhi',
    'chattisgarh':                        'Chhattisgarh',
    'orissa':                             'Odisha',
    'pondicherry':                        'Puducherry',
    'uttaranchal':                        'Uttarakhand',
  };
  if (ALIAS[api]) return ALIAS[api];

  const partial = STATES_IN.find(
    s => api.includes(s.toLowerCase()) || s.toLowerCase().includes(api)
  );
  if (partial) return partial;

  return '';
}

// ─── Reverse geocode using OpenStreetMap Nominatim ────────────────────────────
// FREE, no API key, uses EXACT GPS coordinates → accurate city/state/pincode
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const res  = await fetch(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'AddiesExchange/1.0 (contact@addiesexchange.com)',
    },
  });
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  const json = await res.json();

  const addr = json.address || {};

  // Pick best available city name (Nominatim has many possible fields)
  const city =
    addr.city         ||
    addr.town         ||
    addr.village      ||
    addr.suburb       ||
    addr.municipality ||
    addr.county       ||
    '';

  const state   = matchState(addr.state || addr.state_district || '');
  const country = addr.country || 'India';
  const pincode = addr.postcode || '';

  return { city, state, country, pincode };
}

// ─── Build full address string ─────────────────────────────────────────────────
function buildFullAddress(city, area, state, country, pincode) {
  return [area, city, state, pincode, country].filter(Boolean).join(', ');
}

export default function LocationInfo({ data, onChange }) {
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const markerRef = useRef(null);

  const onChangeRef = useRef(onChange);
  const dataRef     = useRef(data);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { dataRef.current = data; },         [data]);

  const [mapLoaded,  setMapLoaded]  = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [gpsMsg,     setGpsMsg]     = useState({ type: '', text: '' });

  const showMsg = useCallback((type, text, ms = 5000) => {
    setGpsMsg({ type, text });
    if (ms) setTimeout(() => setGpsMsg({ type: '', text: '' }), ms);
  }, []);

  // ── Leaflet loader ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.L) { setMapLoaded(true); return; }
    const link  = document.createElement('link');
    link.rel    = 'stylesheet';
    link.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script   = document.createElement('script');
    script.src     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload  = () => setMapLoaded(true);
    script.onerror = () => showMsg('error', 'Map load nahi hua. Page refresh karo.');
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Init Leaflet map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInst.current) return;
    const L   = window.L;
    const lat = parseFloat(data.latitude)  || 28.6139;
    const lng = parseFloat(data.longitude) || 77.2090;

    const map = L.map(mapRef.current).setView([lat, lng], 13);
    mapInst.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Drag pin → reverse geocode from those exact coords
    marker.on('dragend', async () => {
      const p   = marker.getLatLng();
      const lat = p.lat.toFixed(6);
      const lng = p.lng.toFixed(6);
      // Set coords immediately
      onChangeRef.current({ ...dataRef.current, latitude: lat, longitude: lng });
      try {
        const geo     = await reverseGeocode(p.lat, p.lng);
        const area    = dataRef.current.area || '';
        const country = COUNTRIES.includes(geo.country) ? geo.country : 'India';
        onChangeRef.current({
          ...dataRef.current,
          latitude: lat, longitude: lng,
          city: geo.city, state: geo.state, country,
          pincode: geo.pincode, area,
          fullAddress: buildFullAddress(geo.city, area, geo.state, country, geo.pincode),
        });
      } catch (_) { /* coords set, city/state stays as-is */ }
    });

    // Click map → move pin + reverse geocode
    map.on('click', async (e) => {
      marker.setLatLng(e.latlng);
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      onChangeRef.current({ ...dataRef.current, latitude: lat, longitude: lng });
      try {
        const geo     = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        const area    = dataRef.current.area || '';
        const country = COUNTRIES.includes(geo.country) ? geo.country : 'India';
        onChangeRef.current({
          ...dataRef.current,
          latitude: lat, longitude: lng,
          city: geo.city, state: geo.state, country,
          pincode: geo.pincode, area,
          fullAddress: buildFullAddress(geo.city, area, geo.state, country, geo.pincode),
        });
      } catch (_) { /* coords set */ }
    });
  }, [mapLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Move map + marker ───────────────────────────────────────────────────────
  const moveMapTo = useCallback((lat, lng, zoom = 15) => {
    if (mapInst.current)   mapInst.current.setView([lat, lng], zoom);
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
  }, []);

  // ── Core: fill all form fields from lat/lng using Nominatim ─────────────────
  // This is THE main function — GPS/IP both call this after getting coordinates
  const fillFromCoords = useCallback(async (lat, lng) => {
    try {
      showMsg('info', '🔍 Exact address fetch ho rahi hai…', 0);
      const geo     = await reverseGeocode(lat, lng);
      const area    = dataRef.current.area || '';
      const country = COUNTRIES.includes(geo.country) ? geo.country : 'India';

      onChangeRef.current({
        ...dataRef.current,
        latitude:    parseFloat(lat).toFixed(6),
        longitude:   parseFloat(lng).toFixed(6),
        city:        geo.city,
        state:       geo.state,
        country,
        pincode:     geo.pincode,
        area,
        fullAddress: buildFullAddress(geo.city, area, geo.state, country, geo.pincode),
      });

      showMsg(
        'success',
        `✅ Location: ${geo.city}${geo.state ? ', ' + geo.state : ''}${geo.pincode ? ' - ' + geo.pincode : ''} — saare fields fill ho gaye!`,
      );
    } catch (err) {
      console.error('Reverse geocode failed:', err);
      showMsg('error', '⚠️ Address fetch nahi hua. Coordinates set hain, baaki manually bharo.');
    } finally {
      setLoadingGPS(false);
    }
  }, [showMsg]);

  // ── IP fallback — only when GPS permission denied or unavailable ────────────
  const fetchIPLocation = useCallback(async () => {
    try {
      showMsg('info', '📡 IP se approximate coordinates le rahe hain…', 0);
      const res  = await fetch('https://ipapi.co/json/');
      const json = await res.json();
      if (json.error) throw new Error(json.reason || 'ipapi error');

      if (json.latitude && json.longitude) {
        moveMapTo(json.latitude, json.longitude, 12);
        // Even for IP coords, use Nominatim for accurate city/state (better than ipapi fields)
        await fillFromCoords(json.latitude, json.longitude);
      } else {
        showMsg('error', '⚠️ Location detect nahi hui. Fields manually bharo.');
        setLoadingGPS(false);
      }
    } catch (err) {
      console.error('IP location error:', err);
      showMsg('error', '⚠️ Location detect nahi hui. Fields manually bharo.');
      setLoadingGPS(false);
    }
  }, [moveMapTo, fillFromCoords, showMsg]);

  // ── Main GPS button ─────────────────────────────────────────────────────────
  const handleGPS = useCallback(() => {
    setGpsMsg({ type: '', text: '' });
    setLoadingGPS(true);

    if (!navigator.geolocation) {
      showMsg('info', 'GPS support nahi. IP se try ho raha hai…', 0);
      fetchIPLocation();
      return;
    }

    showMsg('info', '📍 GPS permission do aur wait karo…', 0);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // ✅ GPS ne exact lat/lng diya — Nominatim se accurate city/state fetch karo
        const { latitude: lat, longitude: lng } = pos.coords;
        moveMapTo(lat, lng, 16);
        fillFromCoords(lat, lng); // ← Nominatim call with GPS coords = 100% accurate
      },
      (err) => {
        const msgs = {
          1: 'GPS permission deny kiya.',
          2: 'GPS signal nahi mila.',
          3: 'GPS timeout ho gaya.',
        };
        showMsg('info', `${msgs[err.code] || 'GPS fail.'} IP se try ho raha hai…`, 0);
        fetchIPLocation();
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true },
    );
  }, [fetchIPLocation, moveMapTo, fillFromCoords, showMsg]);

  // ── Field updater ───────────────────────────────────────────────────────────
  const set = useCallback((key, val) => {
    onChange({ ...data, [key]: val });
  }, [data, onChange]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-title">
          <MapPin size={16} /> Location Information
        </span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleGPS}
          disabled={loadingGPS}
        >
          {loadingGPS ? (
            <><div className="spinner spinner-blue" style={{ width: 13, height: 13 }} />Detecting…</>
          ) : (
            <><Navigation size={13} />Use My Location</>
          )}
        </button>
      </div>

      <div className="profile-section-body">

        {gpsMsg.text && (
          <div
            className={`alert ${
              gpsMsg.type === 'success' ? 'alert-success' :
              gpsMsg.type === 'error'   ? 'alert-error'   : 'alert-info'
            }`}
            style={{ fontSize: 13 }}
          >
            {gpsMsg.text}
          </div>
        )}

        <div style={{
          background: 'var(--primary-50)', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', border: '1px solid var(--primary-200)',
          fontSize: 12, color: 'var(--primary-700)', display: 'flex', gap: 8,
        }}>
          <span>ℹ️</span>
          <span>
            <strong>"Use My Location"</strong> — GPS se exact location detect hogi. Map click / pin drag karne par bhi city/state auto-fill hoga!
          </span>
        </div>

        {/* Country + State */}
        <div className="field-grid-2">
          <div className="form-group">
            <label className="form-label">Country</label>
            <select
              className="form-select"
              value={data.country || 'India'}
              onChange={e => set('country', e.target.value)}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <select
              className="form-select"
              value={data.state || ''}
              onChange={e => set('state', e.target.value)}
            >
              <option value="">Select state</option>
              {STATES_IN.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* City + Area + Pincode */}
        <div className="field-grid-3">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className="form-input"
              placeholder="New Delhi"
              value={data.city || ''}
              onChange={e => set('city', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Area / Locality</label>
            <input
              className="form-input"
              placeholder="Connaught Place"
              value={data.area || ''}
              onChange={e => set('area', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input
              className="form-input"
              placeholder="110001"
              maxLength={6}
              value={data.pincode || ''}
              onChange={e => set('pincode', e.target.value)}
            />
          </div>
        </div>

        {/* Full Address */}
        <div className="form-group">
          <label className="form-label">Full Address</label>
          <textarea
            className="form-input"
            rows={2}
            placeholder="House/Flat no., Street, Area, City, State"
            value={data.fullAddress || ''}
            onChange={e => set('fullAddress', e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        {/* Map */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={13} /> Map Picker — click ya pin drag karo (city/state auto fill hoga)
          </label>
          <div ref={mapRef} className="map-container" style={{ height: 280 }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Latitude</label>
              <input
                className="form-input"
                value={data.latitude || ''}
                readOnly
                placeholder="auto"
                style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--primary-50)' }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Longitude</label>
              <input
                className="form-input"
                value={data.longitude || ''}
                readOnly
                placeholder="auto"
                style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--primary-50)' }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

