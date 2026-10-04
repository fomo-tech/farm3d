/**
 * HudContextAction.jsx
 * Play Together Smart 3D Context Action Bubble.
 * 
 * Dynamically presents a tactile candy trigger button in the right thumb zone:
 * - Fishing: 🎣 "Câu cá · Hồ Pha Lê"
 * - Talk to NPC: 💬 "Trò chuyện"
 * - Farm Gate: 🚪 "Mở cổng"
 * - Land purchase: 🏡 "Xem lô đất"
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

  // Determine smart icon from action label
  let actionEmoji = '✨';
  if (action.label.includes('Câu cá') || action.label.includes('cá')) actionEmoji = '🎣';
  else if (action.label.includes('lô đất') || action.label.includes('đất')) actionEmoji = '🏡';
  else if (action.label.includes('cổng')) actionEmoji = '🚪';
  else if (action.label.includes('Trò chuyện') || action.label.includes('Nói chuyện')) actionEmoji = '💬';
  else if (action.label.includes('Thu hoạch')) actionEmoji = '🧺';
  else if (action.label.includes('Gieo hạt')) actionEmoji = '🌱';
  else if (action.label.includes('xe')) actionEmoji = '🚲';

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
          <span className="pt-context-emoji">{actionEmoji}</span>
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
