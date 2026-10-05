/**
 * HudContextAction.jsx
 * Play Together Smart 3D Context Action Bubble.
 * 
 * Dynamically presents a tactile candy trigger button in the right thumb zone:
 * - Fishing: [Icon3dFishingRodBamboo] "Câu cá · Hồ Pha Lê"
 * - Talk to NPC: [Icon3dHeartReaction] "Trò chuyện"
 * - Farm Gate: [Icon3dVillageGate] "Mở cổng"
 * - Land purchase: [Icon3dHouseCabin] "Xem lô đất"
 */

import { farmAudio } from '../game/audio/FarmAudioSystem.js';
import {
  Icon3dHand,
  Icon3dFishingRodBamboo,
  Icon3dHouseCabin,
  Icon3dVillageGate,
  Icon3dHeartReaction,
  Icon3dBasket,
  Icon3dSeeds,
  Icon3dBike,
} from './icons3d/GameIcons3D.jsx';

export function HudContextAction({ action }) {
  if (!action) return null;

  const handleClick = (e) => {
    // Optional sound must never prevent the actual gameplay interaction.
    try { farmAudio.playPop(); }
    catch (error) { window.__farmDebug?.report(error, 'AUDIO ERROR'); }
    action.onClick?.(e);
  };

  // Determine smart icon from action label
  let ActionIcon = Icon3dHand;
  if (action.label.includes('Câu cá') || action.label.includes('cá')) ActionIcon = Icon3dFishingRodBamboo;
  else if (action.label.includes('lô đất') || action.label.includes('đất')) ActionIcon = Icon3dHouseCabin;
  else if (action.label.includes('cổng')) ActionIcon = Icon3dVillageGate;
  else if (action.label.includes('Trò chuyện') || action.label.includes('Nói chuyện')) ActionIcon = Icon3dHeartReaction;
  else if (action.label.includes('Thu hoạch')) ActionIcon = Icon3dBasket;
  else if (action.label.includes('Gieo hạt')) ActionIcon = Icon3dSeeds;
  else if (action.label.includes('xe')) ActionIcon = Icon3dBike;

  return (
    <div className="pt-context-action-wrap">
      <button
        type="button"
        className="hud-context-action pt-context-action-btn"
        onClick={handleClick}
        aria-label={action.label}
        title={`${action.label} (Phím [E])`}
      >
        <div className="pt-context-icon-bubble">
          <span className="pt-context-emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ActionIcon size={24} />
          </span>
          <span className="pt-context-desktop-key" aria-hidden="true">E</span>
        </div>
        <div className="pt-context-text-stack">
          <strong className="pt-context-title">{action.label}</strong>
          {action.hint && <small className="pt-context-hint">{action.hint}</small>}
        </div>
        <i className="pt-context-glow-ring" />
      </button>
    </div>
  );
}

export default HudContextAction;
