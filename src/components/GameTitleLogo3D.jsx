import React from 'react';
import { Icon3dSparkleStar } from './icons3d/GameIcons3D.jsx';

export function GameTitleLogo3D({ className = '' }) {
  return (
    <div className={`pt-game-brand-mark ${className}`}>
      {/* Cutecore 4-point Twinkle Sparkles */}
      <div className="pt-brand-sparkle-star left" aria-hidden="true">
        <Icon3dSparkleStar size={34} />
      </div>
      <div className="pt-brand-sparkle-star right" aria-hidden="true">
        <Icon3dSparkleStar size={28} />
      </div>

      {/* SVG Low-poly Faceted Extruded Game Logo */}
      <svg
        viewBox="0 0 520 152"
        className="pt-brand-svg lowpoly-brand-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Low-poly Pastel Face Gradient (Strawberry Buttercream) */}
          <linearGradient id="logo_poly_face" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fffbeb" />
            <stop offset="65%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          {/* Faceted Bevel Gradient (Warm Sunset Coral) */}
          <linearGradient id="logo_poly_bevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="60%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>

          {/* Faceted 3D Shadow Gradient (Deep Plum Cherry) */}
          <linearGradient id="logo_poly_shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          {/* Origami Ribbon Gradients */}
          <linearGradient id="ribbon_poly_front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fbcfe8" />
            <stop offset="80%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          <linearGradient id="ribbon_poly_fold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Soft Glow Drop Shadow */}
          <filter id="logo_poly_dropshadow" x="-15%" y="-15%" width="130%" height="150%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#881337" floodOpacity="0.38" />
          </filter>
        </defs>

        <g filter="url(#logo_poly_dropshadow)">
          {/* Layer 1: Deep Low-poly Extrusion Base */}
          <text
            x="260"
            y="85"
            textAnchor="middle"
            className="pt-svg-text-base"
            fill="url(#logo_poly_shadow)"
            stroke="url(#logo_poly_shadow)"
            strokeWidth="20"
            strokeLinejoin="round"
          >
            VIBE CITY
          </text>

          {/* Layer 2: Faceted Coral Bevel */}
          <text
            x="260"
            y="77"
            textAnchor="middle"
            className="pt-svg-text-base"
            fill="url(#logo_poly_bevel)"
            stroke="url(#logo_poly_bevel)"
            strokeWidth="14"
            strokeLinejoin="round"
          >
            VIBE CITY
          </text>

          {/* Layer 3: Crisp Milk Outline */}
          <text
            x="260"
            y="73"
            textAnchor="middle"
            className="pt-svg-text-base"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinejoin="round"
          >
            VIBE CITY
          </text>

          {/* Layer 4: Front Glowing Buttercream Face */}
          <text
            x="260"
            y="72"
            textAnchor="middle"
            className="pt-svg-text-front"
            fill="url(#logo_poly_face)"
          >
            VIBE CITY
          </text>
        </g>

        {/* Low-poly Origami Ribbon Banner below */}
        <g transform="translate(0, 16)">
          {/* Left Origami Fold */}
          <polygon points="135,100 102,88 114,106 102,124 135,112" fill="url(#ribbon_poly_fold)" stroke="#881337" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="135,100 152,112 135,112" fill="#4c0519" />

          {/* Right Origami Fold */}
          <polygon points="385,100 418,88 406,106 418,124 385,112" fill="url(#ribbon_poly_fold)" stroke="#881337" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="385,100 368,112 385,112" fill="#4c0519" />

          {/* Center Faceted Ribbon Plaque */}
          <rect
            x="140"
            y="92"
            width="240"
            height="29"
            rx="14"
            fill="url(#ribbon_poly_front)"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Cutecore Heart Studs on Ribbon Ends */}
          <path d="M 156 103 C 154 101, 151 102, 156 107 C 161 102, 158 101, 156 103 Z" fill="#ffffff" />
          <path d="M 364 103 C 362 101, 359 102, 364 107 C 369 102, 366 101, 364 103 Z" fill="#ffffff" />

          {/* Ribbon Text */}
          <text
            x="260"
            y="112"
            textAnchor="middle"
            className="pt-ribbon-text"
            fill="#ffffff"
            letterSpacing="2px"
            fontWeight="900"
          >
            ✧ 3D LOW-POLY WORLD ✧
          </text>
        </g>
      </svg>
    </div>
  );
}
