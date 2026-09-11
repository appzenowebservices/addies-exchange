"use client";
// src/components/dashboard/user/UserProfile.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { mockAPI } from '../../../server/trpcClient';

// Sub-components
import ProfileHeader       from './profile/ProfileHeader';
import ProfileTabs         from './profile/ProfileTabs';
import SaveBar             from './profile/SaveBar';
import BasicInfo           from './profile/sections/BasicInfo';
import LocationInfo        from './profile/sections/LocationInfo';
import VerificationSection from './profile/sections/VerificationSection';
import BadgePackages       from './profile/sections/BadgePackages';
import SellerStats         from './profile/sections/SellerStats';
import BuyerSection        from './profile/sections/BuyerSection';
import WalletSection       from './profile/sections/WalletSection';
import SecuritySection     from './profile/sections/SecuritySection';
import PublicProfileView   from './profile/sections/PublicProfileView';

import './profile/profile.css';

const DEFAULT_PROFILE = (user) => ({
  userId: user.id, fullName: user.name, username: user.email.split('@')[0],
  email: user.email, mobile: user.phone || '', gender: '', dob: '', bio: '',
  accountType: user.canBuy && user.canSell ? 'both' : user.canSell ? 'seller' : 'buyer',
  country: 'India', state: '', city: user.city || '', area: '', pincode: '', fullAddress: '',
  latitude: '', longitude: '',
  emailVerified: false, mobileVerified: false, govIdType: '', govIdNumber: '',
  idProofFile: null, selfieFile: null, addressProofFile: null, verificationStatus: 'pending',
  currentPackage: 'none', packageStart: '', packageExpiry: '', badgeActive: false,
  paymentId: '', paymentStatus: 'pending',
  totalListings: 3, totalSold: 12, totalViews: 1245, rating: 4.3, totalReviews: 18,
  responseTime: '< 1 hr', lastActive: 'Today',
  walletBalance: 32500,
  tfa_sms: false, tfa_email: false, tfa_app: false,
  trustScore: 72, avatarPhoto: null, coverPhoto: null,
});

const VALID_TABS = ['basic','location','verification','badge','seller','buyer','wallet','security','public'];

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const location = useLocation();

  // Read ?tab= from URL, default to 'basic'
  const getTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return VALID_TABS.includes(tab) ? tab : 'basic';
  };

  const [activeTab, setActiveTab] = useState(getTabFromURL);
  const [profile,   setProfile]   = useState(() => DEFAULT_PROFILE(user));
  const [loading,   setLoading]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [dirty,     setDirty]     = useState(false);

  // Sync tab when URL query changes (sidebar click)
  useEffect(() => {
    const tab = getTabFromURL();
    setActiveTab(tab);
    // Scroll profile section into view smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search]);

  const handleChange = useCallback((updates) => {
    setProfile(updates); setDirty(true); setSaved(false);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await mockAPI.updateProfile(user.id, { name: profile.fullName, phone: profile.mobile, city: profile.city });
      updateUser({ name: profile.fullName, phone: profile.mobile, city: profile.city });
      setSaved(true); setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAvatarChange = (file) => {
    if (!file) return;
    setProfile(p => ({ ...p, avatarPhoto: URL.createObjectURL(file) })); setDirty(true);
  };
  const handleCoverChange = (file) => {
    if (!file) return;
    setProfile(p => ({ ...p, coverPhoto: URL.createObjectURL(file) })); setDirty(true);
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'basic':        return <BasicInfo           data={profile} onChange={handleChange} />;
      case 'location':     return <LocationInfo        data={profile} onChange={handleChange} />;
      case 'verification': return <VerificationSection data={profile} onChange={handleChange} />;
      case 'badge':        return <BadgePackages       data={profile} onChange={handleChange} />;
      case 'seller':       return <SellerStats         data={profile} />;
      case 'buyer':        return <BuyerSection        data={profile} />;
      case 'wallet':       return <WalletSection       data={profile} onChange={handleChange} />;
      case 'security':     return <SecuritySection     data={profile} onChange={handleChange} />;
      case 'public':       return <PublicProfileView   user={user}    profileData={profile} />;
      default:             return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-sub">Manage your complete profile and account settings</p>
        </div>
      </div>
      <div className="profile-wrap">
        <ProfileHeader user={user} profileData={profile} onAvatarChange={handleAvatarChange} onCoverChange={handleCoverChange} />
        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
        {renderSection()}
        <SaveBar onSave={handleSave} loading={loading} saved={saved} dirty={dirty} />
      </div>
    </div>
  );
}

