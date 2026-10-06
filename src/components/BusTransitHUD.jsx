import React from 'react';

/**
 * BusTransitHUD - Responsive Native In-Game Style Transit Interface
 * - Desktop: Ultra-slim single-line capsule HUD
 * - Mobile: Fully responsive adaptive capsule with thumb-friendly touch targets (min-height 40px)
 * - Harmonized with game UI tokens: cream eggshell surface (#fffdf7), slate ink (#18384a), muted bevels
 * - Safe area aware, never overlaps topbar (profile/currency) or bottom controls (joystick/jump)
 * - ZERO dev text, ZERO saturated gradients
 */
export default function BusTransitHUD({
  busTransit,
  onBoard,
  onAlight,
  onToggleCinematicTour,
  cinematicTourActive = false,
}) {
  if (!busTransit) return null;

  const { activeRide, nearbyBoardable } = busTransit;

  // 1. Boarding Prompt at Bus Stops
  if (!activeRide && nearbyBoardable) {
    return (
      <>
        <style>{busHudStyles}</style>
        <div className="pt-transit-prompt-root">
          <div className="pt-prompt-capsule">
            <div className="pt-prompt-header-row">
              <span
                className="pt-route-badge"
                style={{
                  backgroundColor: nearbyBoardable.bodyColor || '#1c84b5',
                }}
              >
                T{nearbyBoardable.routeCode}
              </span>

              <div className="pt-prompt-info">
                <span className="pt-prompt-name">{nearbyBoardable.routeName}</span>
                <span className="pt-prompt-dot">·</span>
                <span className="pt-prompt-station">
                  {nearbyBoardable.stationName} <strong>({nearbyBoardable.dwellRemaining}s)</strong>
                </span>
              </div>
            </div>

            <button
              id="btn-board-bus"
              type="button"
              onClick={() => onBoard?.(nearbyBoardable.busId)}
              className="pt-board-btn"
            >
              <span className="pt-key-cap">F</span>
              <span>Lên Xe</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // 2. In-Transit HUD when Riding Bus
  if (activeRide) {
    const kmh = Math.round(activeRide.speed * 3.6);

    return (
      <>
        <style>{busHudStyles}</style>
        <div className="pt-transit-dashboard-root">
          <div className="pt-transit-capsule">
            {/* Main Info Row (Route, Station, Speed) */}
            <div className="pt-capsule-row pt-capsule-header">
              {/* Route */}
              <div className="pt-capsule-section pt-section-route">
                <span
                  className="pt-route-badge"
                  style={{
                    backgroundColor: activeRide.bodyColor || '#1c84b5',
                  }}
                >
                  T{activeRide.routeCode}
                </span>
                <span className="pt-route-name">{activeRide.routeName}</span>
              </div>

              <div className="pt-capsule-divider" />

              {/* Station Status */}
              <div className="pt-capsule-section pt-section-station">
                {activeRide.isDwelling ? (
                  <span className="pt-station-status pt-status-dwelling">
                    <span className="pt-dwell-pulse" />
                    <span>Dừng: <strong>{activeRide.currentStation || 'Trạm'}</strong> ({activeRide.dwellRemaining}s)</span>
                  </span>
                ) : (
                  <span className="pt-station-status">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#1c84b5" stroke="#1c84b5" strokeWidth="1">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" strokeWidth="2.5" />
                    </svg>
                    <span>Tới: <strong>{activeRide.nextStation || 'Trạm kế'}</strong></span>
                  </span>
                )}

                {activeRide.scenicPoi && (
                  <span className="pt-scenic-tag" title={activeRide.scenicPoi.name}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: '4px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {activeRide.scenicPoi.name}
                  </span>
                )}
              </div>

              <div className="pt-capsule-divider" />

              {/* Speed */}
              <div className="pt-capsule-section pt-section-speed">
                <span className="pt-speed-val">{kmh}</span>
                <span className="pt-speed-unit">km/h</span>
              </div>
            </div>

            {/* Actions (Desktop: inline; Mobile: touch action row) */}
            <div className="pt-capsule-actions">
              <button
                id="btn-cinematic-tour"
                type="button"
                onClick={onToggleCinematicTour}
                className={`pt-key-btn ${cinematicTourActive ? 'active' : ''}`}
                title="Bật/Tắt chế độ quay ngắm cảnh 360°"
              >
                <span className="pt-key-cap">V</span>
                <span>{cinematicTourActive ? '360°' : 'Ngắm cảnh'}</span>
              </button>

              <button
                id="btn-alight-bus"
                type="button"
                onClick={onAlight}
                disabled={!activeRide.isDwelling}
                title={activeRide.isDwelling ? 'Xuống xe tại trạm này' : 'Chờ xe dừng hẳn tại trạm để xuống'}
                className={`pt-key-btn ${activeRide.isDwelling ? 'ready' : ''}`}
              >
                <span className="pt-key-cap">E</span>
                <span>{activeRide.isDwelling ? 'Xuống xe' : 'Chờ trạm'}</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}

const busHudStyles = `
/* =========================================================================
   RESPONSIVE IN-GAME BUS TRANSIT HUD
   Harmonized with CompactGameHud tokens
   ========================================================================= */

@keyframes popIn {
  0% { transform: translate(-50%, -6px) scale(0.96); opacity: 0; }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

@keyframes dwellPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}

/* =========================================================================
   1. Boarding Prompt at Station
   ========================================================================= */
.pt-transit-prompt-root {
  position: fixed;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1400;
  pointer-events: auto;
  animation: popIn 0.2s ease-out forwards;
}

.pt-prompt-capsule {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fffdf7f2;
  border: 2px solid #ffffff;
  border-radius: 999px;
  padding: 4px 5px 4px 10px;
  box-shadow: 0 4px 0 #aab8bc, 0 10px 24px rgba(20, 44, 60, 0.18);
  color: #18384a;
  font-family: inherit;
  font-size: 13px;
  white-space: nowrap;
}

.pt-prompt-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pt-prompt-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pt-prompt-name {
  font-weight: 800;
  color: #18384a;
}

.pt-prompt-dot {
  color: #94a3b8;
}

.pt-prompt-station {
  color: #475569;
  font-size: 12px;
}

.pt-prompt-station strong {
  color: #18384a;
  font-weight: 800;
}

.pt-board-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #1c84b5;
  color: #ffffff;
  border: 1.5px solid #ffffff;
  border-radius: 999px;
  padding: 4px 12px 4px 5px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 3px 0 #155778;
  transition: transform 0.08s ease;
}

.pt-board-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0 #155778;
}

.pt-board-btn .pt-key-cap {
  background: #ffffff;
  color: #1c84b5;
  box-shadow: none;
}

/* =========================================================================
   2. In-Transit HUD when Riding Bus (Desktop Default)
   ========================================================================= */
.pt-transit-dashboard-root {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1400;
  pointer-events: auto;
  animation: popIn 0.2s ease-out forwards;
}

.pt-transit-capsule {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fffdf7f2;
  border: 2px solid #ffffff;
  border-radius: 999px;
  padding: 4px 8px 4px 10px;
  box-shadow: 0 4px 0 #aab8bc, 0 10px 24px rgba(20, 44, 60, 0.16);
  color: #18384a;
  font-family: inherit;
  font-size: 12.5px;
  white-space: nowrap;
}

.pt-capsule-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pt-capsule-section {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pt-capsule-divider {
  width: 1px;
  height: 16px;
  background: #cbd5e1;
  flex-shrink: 0;
}

/* Route Badge */
.pt-route-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 999px;
  background: #1c84b5;
  color: #ffffff;
  letter-spacing: -0.2px;
  box-shadow: 0 1.5px 0 rgba(0, 0, 0, 0.18);
}

.pt-route-name {
  font-weight: 800;
  color: #18384a;
  letter-spacing: -0.2px;
}

/* Station Status */
.pt-station-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #334e68;
}

.pt-station-status strong {
  color: #18384a;
  font-weight: 800;
}

.pt-dwell-pulse {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #d97706;
  animation: dwellPulse 1.2s infinite ease-in-out;
}

.pt-status-dwelling strong {
  color: #b45309;
}

.pt-scenic-tag {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 10.5px;
  font-weight: 700;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Speed */
.pt-section-speed {
  font-variant-numeric: tabular-nums;
  color: #18384a;
  font-weight: 800;
  gap: 2px;
}

.pt-speed-val {
  font-size: 14px;
}

.pt-speed-unit {
  font-size: 10px;
  color: #64748b;
}

/* Actions */
.pt-capsule-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pt-key-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 3px 9px 3px 4px;
  color: #334e68;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
}

.pt-key-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.pt-key-btn:active {
  transform: translateY(1px);
}

.pt-key-cap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  background: #243b53;
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  border-radius: 999px;
  box-shadow: 0 1px 0 #102a43;
}

/* Active 360 Camera */
.pt-key-btn.active {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.pt-key-btn.active .pt-key-cap {
  background: #0284c7;
  box-shadow: 0 1px 0 #0369a1;
}

/* Ready to Alight at Stop */
.pt-key-btn.ready {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

.pt-key-btn.ready .pt-key-cap {
  background: #dc2626;
  box-shadow: 0 1px 0 #991b1b;
}

/* Disabled */
.pt-key-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #f8fafc;
  border-color: #f1f5f9;
}

.pt-key-btn:disabled .pt-key-cap {
  background: #64748b;
  box-shadow: none;
}

/* =========================================================================
   3. MOBILE & TOUCH SCREEN OPTIMIZATIONS (<= 768px)
   ========================================================================= */
@media (max-width: 768px) {
  /* Transit Dashboard on Mobile: position safely below topbar without collision */
  .pt-transit-dashboard-root {
    top: calc(max(10px, env(safe-area-inset-top, 0px)) + 54px);
    width: min(390px, calc(100vw - 20px));
    max-width: calc(100vw - 20px);
  }

  .pt-transit-capsule {
    flex-direction: column;
    border-radius: 16px;
    padding: 7px 10px;
    gap: 7px;
    width: 100%;
    box-sizing: border-box;
    white-space: normal;
  }

  .pt-capsule-header {
    width: 100%;
    justify-content: space-between;
    gap: 6px;
  }

  .pt-capsule-divider {
    display: none;
  }

  .pt-section-route {
    flex-shrink: 0;
  }

  .pt-route-name {
    font-size: 12px;
    max-width: 95px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pt-section-station {
    font-size: 11.5px;
    flex: 1;
    justify-content: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pt-scenic-tag {
    display: none;
  }

  .pt-section-speed {
    flex-shrink: 0;
  }

  /* Thumb-friendly mobile action buttons */
  .pt-capsule-actions {
    width: 100%;
    gap: 8px;
    justify-content: stretch;
  }

  .pt-key-btn {
    flex: 1;
    min-height: 38px;
    padding: 4px 10px;
    justify-content: center;
    font-size: 12px;
    border-radius: 12px;
  }

  .pt-key-cap {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }

  /* Mobile Boarding Prompt: place above joystick/bottom bar */
  .pt-transit-prompt-root {
    bottom: calc(max(12px, env(safe-area-inset-bottom, 0px)) + 74px);
    width: min(340px, calc(100vw - 24px));
    max-width: calc(100vw - 24px);
  }

  .pt-prompt-capsule {
    flex-direction: column;
    border-radius: 16px;
    padding: 9px 12px;
    gap: 8px;
    white-space: normal;
  }

  .pt-prompt-header-row {
    width: 100%;
    justify-content: space-between;
  }

  .pt-prompt-info {
    font-size: 12px;
  }

  .pt-board-btn {
    width: 100%;
    min-height: 40px;
    justify-content: center;
    font-size: 13px;
    border-radius: 12px;
  }

  .pt-board-btn .pt-key-cap {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }
}

/* Touch-only device enhancements */
@media (hover: none) and (pointer: coarse) {
  .pt-key-btn {
    -webkit-tap-highlight-color: transparent;
  }
  .pt-board-btn {
    -webkit-tap-highlight-color: transparent;
  }
}
`;
