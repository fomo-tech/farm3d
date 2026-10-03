import React from 'react';
import { Icon3dSparkleStar } from './icons3d/GameIcons3D.jsx';

export function GameTitleLogo3D({ className = '' }) {
  return (
    <div className={`pt-game-brand-mark ${className}`}>
      {/* Dynamic Flanking Sparkle Stars */}
      <div className="pt-brand-sparkle-star left" aria-hidden="true">
        <Icon3dSparkleStar size={32} />
      </div>
      <div className="pt-brand-sparkle-star right" aria-hidden="true">
        <Icon3dSparkleStar size={26} />
      </div>

      {/* SVG 3D Extruded Master Game Logo */}
      <svg
        viewBox="0 0 520 148"
        className="pt-brand-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main 3D Text Gradients */}
          <linearGradient id="logo_face_grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#f0f9ff" />
            <stop offset="70%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>

          <linearGradient id="logo_bevel_grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="logo_shadow_grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          {/* Ribbon Gradients */}
          <linearGradient id="ribbon_front" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="20%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="ribbon_fold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Filter for Deep Dimensional Shadow */}
          <filter id="logo_drop_shadow" x="-10%" y="-10%" width="120%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#0c4a6e" floodOpacity="0.45" />
          </filter>
        </defs>

        <g filter="url(#logo_drop_shadow)">
          {/* Layer 1: Deep 3D Bottom Extrusion Shadow */}
          <text
            x="260"
            y="84"
            textAnchor="middle"
            className="pt-svg-text-base"
            fill="url(#logo_shadow_grad)"
            stroke="url(#logo_shadow_grad)"
            strokeWidth="20"
            strokeLinejoin="round"
          >
            VIBE CITY
          </text>

          {/* Layer 2: 3D Bevel Rim Stroke */}
          <text
            x="260"
            y="76"
            textAnchor="middle"
            className="pt-svg-text-base"
            fill="url(#logo_bevel_grad)"
            stroke="#0284c7"
            strokeWidth="14"
            strokeLinejoin="round"
          >
            VIBE CITY
          </text>

          {/* Layer 3: Crisp Thick White Outline */}
          <text
            x="260"
            y="72"
            textAnchor="middle"
            className="pt-svg-text-base"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="8"
            strokeLinejoin="round"
          >
            VIBE CITY
          </text>

          {/* Layer 4: Front Vibrant Face */}
          <text
            x="260"
            y="71"
            textAnchor="middle"
            className="pt-svg-text-front"
            fill="url(#logo_face_grad)"
          >
            VIBE CITY
          </text>
        </g>

        {/* 3D Ribbon Banner below */}
        <g transform="translate(0, 14)">
          {/* Left Ribbon Fold Tail */}
          <path d="M 135 100 L 105 88 L 115 106 L 105 124 L 135 112 Z" fill="url(#ribbon_fold)" stroke="#78350f" strokeWidth="1.5" />
          <path d="M 135 100 L 150 112 L 135 112 Z" fill="#451a03" />

          {/* Right Ribbon Fold Tail */}
          <path d="M 385 100 L 415 88 L 405 106 L 415 124 L 385 112 Z" fill="url(#ribbon_fold)" stroke="#78350f" strokeWidth="1.5" />
          <path d="M 385 100 L 370 112 L 385 112 Z" fill="#451a03" />

          {/* Main Ribbon Center Plaque */}
          <rect
            x="142"
            y="92"
            width="236"
            height="28"
            rx="14"
            fill="url(#ribbon_front)"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Gold Studs on Ribbon Ends */}
          <circle cx="156" cy="106" r="3.2" fill="#ffffff" />
          <circle cx="364" cy="106" r="3.2" fill="#ffffff" />

          {/* Ribbon Text */}
          <text
            x="260"
            y="111"
            textAnchor="middle"
            className="pt-ribbon-text"
            fill="#78350f"
          >
            ★ 3D OPEN WORLD ★
          </text>
        </g>
      </svg>
    </div>
  );
}
