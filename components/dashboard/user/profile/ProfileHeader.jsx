"use client";
// src/components/dashboard/user/profile/ProfileHeader.jsx
import React from 'react';
import { Camera, Star } from 'lucide-react';

const BADGE_META = {
  bronze: { label: '🥉 Bronze', cls: 'badge badge-bronze' },
  silver: { label: '🥈 Silver', cls: 'badge badge-silver' },
  gold:   { label: '🥇 Gold',   cls: 'badge badge-gold'   },
};

export default function ProfileHeader({ user, profileData, onAvatarChange, onCoverChange }) {
  const badge = profileData.currentPackage;
  const trustScore = profileData.trustScore || 72;

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = e => onAvatarChange && onAvatarChange(e.target.files[0]);
    input.click();
  };

  const handleCoverClick = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = e => onCoverChange && onCoverChange(e.target.files[0]);
    input.click();
  };

  return (
    <div className="profile-header-card">
      {/* Cover */}
      <div className="profile-cover">
        {profileData.coverPhoto
          ? <img src={profileData.coverPhoto} alt="cover" className="profile-cover-img" />
          : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#0f3d5c,#1a5a85,#2181c4,#3b9edd)' }} />
        }
        <div className="profile-cover-overlay" />
        <button className="profile-cover-edit" onClick={handleCoverClick}>
          <Camera size={13}/> Change Cover
        </button>
      </div>

      {/* Identity */}
      <div className="profile-identity">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {profileData.avatarPhoto
              ? <img src={profileData.avatarPhoto} alt="avatar" />
              : <span>{user.avatar}</span>
            }
          </div>
          <button className="profile-avatar-edit" onClick={handleAvatarClick} title="Change photo">
            <Camera size={12} />
          </button>
        </div>

        <div className="profile-identity-info">
          <div className="profile-name">
            {user.name}
            {badge && badge !== 'none' && (
              <span style={{ marginLeft:8, fontSize:14 }}>
                {badge === 'gold' ? '🥇' : badge === 'silver' ? '🥈' : '🥉'}
              </span>
            )}
          </div>
          <div className="profile-username">@{profileData.username || user.email.split('@')[0]}</div>
          <div className="profile-badges">
            {user.canBuy  && <span className="badge badge-blue">🛒 Buyer</span>}
            {user.canSell && <span className="badge badge-orange">🏪 Seller</span>}
            {badge && badge !== 'none' && (
              <span className={BADGE_META[badge]?.cls}>{BADGE_META[badge]?.label} Verified</span>
            )}
            <span className={`badge ${user.status === 'active' ? 'badge-green' : 'badge-red'}`}>{user.status}</span>
            <span className="badge badge-blue" style={{ background:'#e0f2fe', color:'#0369a1' }}>
              🛡 Trust {trustScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="profile-stats-row">
        {[
          { val: profileData.totalListings || 0,  lbl: 'Listings' },
          { val: profileData.totalSold    || 0,  lbl: 'Sold'     },
          { val: profileData.totalViews   || 0,  lbl: 'Views'    },
          { val: `${profileData.rating    || 0}/5`, lbl: 'Rating' },
          { val: user.createdAt,                  lbl: 'Joined'   },
        ].map(({ val, lbl }) => (
          <div className="profile-stat-item" key={lbl}>
            <div className="profile-stat-val">{val}</div>
            <div className="profile-stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

