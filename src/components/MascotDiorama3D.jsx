import React, { useState } from 'react';
import {
  Icon3dChicken,
  Icon3dHeartBubble,
  Icon3dSparkleStar,
  Icon3dGoldenCarrot,
  Icon3dHeartReaction,
} from './icons3d/GameIcons3D.jsx';

export function MascotDiorama3D({ isReady = false, statusMsg = '' }) {
  const [petted, setPetted] = useState(false);
  const [pettedCount, setPettedCount] = useState(0);

  const handlePetMascot = (e) => {
    e.stopPropagation();
    setPetted(true);
    setPettedCount(prev => prev + 1);
    setTimeout(() => setPetted(false), 900);
  };

  return (
    <div className="pt-mascot-diorama" aria-label="Mascot Diorama Stage">
      {/* 1. In-game Dialogue Bubble (Casual Cutecore Chibi Style) */}
      <div className={`pt-diorama-speech-bubble${petted ? ' is-petted-pop' : ''}`}>
        <span className="bubble-gift-icon">
          {petted ? <Icon3dHeartBubble size={20} /> : <Icon3dGoldenCarrot size={20} />}
        </span>
        <span className="bubble-text">
          {petted
            ? 'Chíp chíp! Cảm ơn bạn xoa đầu nha! (˶ᵔ ᵕ ᵔ˶) ♡'
            : isReady
            ? 'Thị trấn đã sẵn sàng! Chạm để vào chơi nào!'
            : statusMsg || 'Chào mừng bạn đến với nông trại Chibi!'}
        </span>
        <div className="bubble-anchor" />
      </div>

      {/* 2. Low-poly Cutecore Mascot Character (Interactive Tap) */}
      <div
        className={`pt-diorama-mascot-wrap${isReady ? ' is-ready-celebrating' : ''}${petted ? ' is-petted-bounce' : ''}`}
        onClick={handlePetMascot}
        title="Chạm vào tớ đi! (Tap me!)"
        role="button"
        tabIndex={0}
      >
        {/* Chibi Chicken with blushing cheeks & cutecore shine */}
        <div className="pt-chibi-mascot-visual">
          <Icon3dChicken size={isReady ? 96 : 86} />

          {/* Cutecore Blushing Cheeks Overlay */}
          <div className="pt-cutecore-blush-left" />
          <div className="pt-cutecore-blush-right" />
        </div>

        {/* Tap Reaction Heart/Star Burst */}
        {petted && (
          <div className="pt-tap-heart-burst" aria-hidden="true">
            <span className="burst-heart h1"><Icon3dHeartReaction size={16} /></span>
            <span className="burst-heart h2"><Icon3dSparkleStar size={16} /></span>
            <span className="burst-heart h3"><Icon3dHeartReaction size={14} /></span>
          </div>
        )}

        {/* Ready Celebration Confetti Stars */}
        {isReady && (
          <div className="pt-mascot-sparkle-burst" aria-hidden="true">
            <span className="burst-sparkle s1"><Icon3dSparkleStar size={20} /></span>
            <span className="burst-sparkle s2"><Icon3dSparkleStar size={18} /></span>
            <span className="burst-sparkle s3"><Icon3dSparkleStar size={16} /></span>
          </div>
        )}
      </div>

      {/* 3. 3D Floating Hexagonal Island (Casual Low-poly Isometric Diorama) */}
      <div className="pt-cloud-pedestal-wrap" aria-hidden="true">
        <svg
          viewBox="0 0 240 100"
          className="pt-pedestal-svg lowpoly-island-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Low-poly Grass Top Gradients */}
            <linearGradient id="poly_grass_top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="45%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>

            {/* Faceted Earth Layers */}
            <linearGradient id="poly_dirt_left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="poly_dirt_center" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="poly_dirt_right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Waterfall Stream */}
            <linearGradient id="poly_waterfall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
            </linearGradient>

            {/* Island Contact Shadow */}
            <radialGradient id="poly_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* --- LAYER 1: Isometric Faceted Soil Block (Bottom) --- */}
          {/* Left Soil Facet */}
          <polygon points="30,42 120,62 120,86 30,66" fill="url(#poly_dirt_left)" stroke="#451a03" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Center Keel Facet */}
          <polygon points="120,62 170,55 170,78 120,86" fill="url(#poly_dirt_center)" stroke="#451a03" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Right Soil Facet */}
          <polygon points="170,55 210,40 210,60 170,78" fill="url(#poly_dirt_right)" stroke="#451a03" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Hanging Earth Roots */}
          <polygon points="85,67 92,76 80,72" fill="#78350f" />
          <polygon points="145,60 152,70 142,66" fill="#78350f" />

          {/* --- LAYER 2: Crystal Waterfall cascading down --- */}
          <polygon points="68,43 78,44 76,75 70,74" fill="url(#poly_waterfall)" stroke="#ffffff" strokeWidth="0.8" />
          <polygon points="76,44 84,45 82,70 77,74" fill="#a5f3fc" opacity="0.85" />
          {/* Water splash mist bubbles */}
          <circle cx="73" cy="76" r="2.5" fill="#ffffff" opacity="0.9" />
          <circle cx="80" cy="72" r="1.8" fill="#ffffff" opacity="0.8" />

          {/* --- LAYER 3: Low-poly Grass Surface (Hexagonal Top) --- */}
          <polygon
            points="120,24 210,40 170,55 120,62 30,42 70,27"
            fill="url(#poly_grass_top)"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Grass faceted contour divisions */}
          <line x1="120" y1="24" x2="120" y2="62" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
          <line x1="70" y1="27" x2="120" y2="62" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
          <line x1="170" y1="55" x2="120" y2="24" stroke="#ffffff" strokeWidth="1" opacity="0.3" />

          {/* --- LAYER 4: Stepping Stones & Contact Shadow --- */}
          {/* Contact shadow for mascot */}
          <ellipse cx="120" cy="45" rx="34" ry="10" fill="url(#poly_shadow)" />

          {/* Stepping stones */}
          <polygon points="85,46 95,43 100,48 90,51" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          <polygon points="102,51 112,49 116,53 106,56" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />

          {/* --- LAYER 5: Cutecore Island Props (Mushroom & Daisy Flowers) --- */}
          {/* Red Polka-dot Mushroom on left edge */}
          <rect x="48" y="38" width="4" height="6" rx="2" fill="#fef3c7" />
          <path d="M 44 38 C 44 32, 56 32, 56 38 Z" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
          <circle cx="48" cy="35" r="1" fill="#ffffff" />
          <circle cx="52" cy="36" r="0.8" fill="#ffffff" />

          {/* Tiny 5-Petal Daisy */}
          <g transform="translate(155, 46) scale(0.6)">
            <circle cx="0" cy="-5" r="3" fill="#ffffff" />
            <circle cx="5" cy="-2" r="3" fill="#ffffff" />
            <circle cx="3" cy="4" r="3" fill="#ffffff" />
            <circle cx="-3" cy="4" r="3" fill="#ffffff" />
            <circle cx="-5" cy="-2" r="3" fill="#ffffff" />
            <circle cx="0" cy="0" r="2.8" fill="#fde047" />
          </g>

          {/* --- LAYER 6: Mini Low-poly Windmill on right edge --- */}
          <g transform="translate(186, 26) scale(0.7)">
            {/* Tower */}
            <polygon points="4,22 16,22 13,4 7,4" fill="#fed7aa" stroke="#78350f" strokeWidth="1.2" />
            <polygon points="6,4 14,4 10,-2" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
            {/* Spinning Blades (CSS animated via class) */}
            <g className="pt-windmill-blades">
              <circle cx="10" cy="5" r="2" fill="#facc15" />
              <polygon points="10,5 9,-10 11,-10" fill="#ffffff" stroke="#78350f" strokeWidth="0.8" />
              <polygon points="10,5 25,4 25,6" fill="#ffffff" stroke="#78350f" strokeWidth="0.8" />
              <polygon points="10,5 11,20 9,20" fill="#ffffff" stroke="#78350f" strokeWidth="0.8" />
              <polygon points="10,5 -5,6 -5,4" fill="#ffffff" stroke="#78350f" strokeWidth="0.8" />
            </g>
          </g>
        </svg>

        {/* Ambient Ground Shadow Below the Floating Hex Island */}
        <div className="pt-pedestal-ambient-shadow" />
      </div>
    </div>
  );
}
