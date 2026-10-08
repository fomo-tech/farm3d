import { HudIcon } from './icons3d/HudIcon.jsx';
import { contextHudIcon } from './icons3d/contextHudIcon.js';
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


export function HudContextAction({ action }) {
  if (!action) return null;

  const handleClick = (e) => {
    // Optional sound must never prevent the actual gameplay interaction.
    try { farmAudio.playPop(); }
    catch (error) { window.__farmDebug?.report(error, 'AUDIO ERROR'); }
    action.onClick?.(e);
  };

  const { asset, mobileAsset } = contextHudIcon(action);

  return (
    <div className="pt-context-action-wrap">
      <button
        type="button"
        className={`hud-context-action pt-context-action-btn ${action.iconAsset==='fishing'?'context-fishing-icon':''}`}
        onClick={handleClick}
        aria-label={action.label}
        title={`${action.label} (Phím [E])`}
      >
        <div className="pt-context-icon-bubble">
          <span className="pt-context-emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HudIcon mobile mobileAsset={mobileAsset} asset={asset} size={36} />
          </span>
          <span className="pt-context-desktop-key" aria-hidden="true">E</span>
        </div>
        <div className="pt-context-text-stack">
          <strong className="pt-context-title">{action.label}</strong>
          {action.hint && <small className="pt-context-hint">{action.hint}</small>}
        </div>

      </button>
    </div>
  );
}

export default HudContextAction;
