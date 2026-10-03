import React from 'react';
import { Icon3dChicken, Icon3dGiftBoxRibbon, Icon3dSparkleStar } from './icons3d/GameIcons3D.jsx';

export function MascotDiorama3D({ isReady = false, statusMsg = '' }) {
  return (
    <div className="pt-mascot-diorama" aria-hidden="true">
      {/* 1. In-game Dialogue Bubble (Play Together NPC Style) */}
      <div className="pt-diorama-speech-bubble">
        <Icon3dGiftBoxRibbon size={20} className="bubble-gift-icon" />
        <span className="bubble-text">
          {isReady
            ? 'Thị trấn đã mở! Chạm để vào chơi nào! ✨'
            : statusMsg || 'Chào mừng bạn đến với Vibe City! 🎈'}
        </span>
        <div className="bubble-anchor" />
      </div>

      {/* 2. Mascot Character with Celebration / Idle Animation */}
      <div className={`pt-diorama-mascot-wrap${isReady ? ' is-ready-celebrating' : ''}`}>
        <Icon3dChicken size={isReady ? 98 : 88} />
        {isReady && (
          <div className="pt-mascot-sparkle-burst">
            <span className="burst-sparkle s1"><Icon3dSparkleStar size={18} /></span>
            <span className="burst-sparkle s2"><Icon3dSparkleStar size={16} /></span>
          </div>
        )}
      </div>

      {/* 3. 3D Floating Cloud Pedestal (Grounding the character) */}
      <div className="pt-cloud-pedestal-wrap">
        <svg
          viewBox="0 0 160 50"
          className="pt-pedestal-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="pedestal_cloud_grad" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#f0f9ff" />
              <stop offset="90%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </radialGradient>
            <radialGradient id="pedestal_contact_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Cloud Platform Body */}
          <path
            d="M 28 35 C 16 35, 10 26, 18 18 C 22 10, 36 10, 42 16 C 50 6, 75 4, 88 12 C 98 4, 122 6, 128 16 C 140 12, 152 20, 148 30 C 146 38, 134 42, 120 40 C 104 44, 52 45, 28 35 Z"
            fill="url(#pedestal_cloud_grad)"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Contact Shadow for Mascot */}
          <ellipse cx="80" cy="22" rx="32" ry="7" fill="url(#pedestal_contact_shadow)" />
        </svg>

        {/* Ambient Ground Shadow Below the Platform */}
        <div className="pt-pedestal-ambient-shadow" />
      </div>
    </div>
  );
}
