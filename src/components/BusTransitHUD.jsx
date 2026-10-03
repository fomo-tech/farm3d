import React from 'react';

/**
 * BusTransitHUD - Play Together Style Floating Transit Interface
 * Provides boarding prompts at bus stops and scenic transit info during 3D rides.
 * Strict: ZERO emojis, all crisp vector SVGs, premium glassmorphism.
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

  // 1. Boarding Prompt when player is near a dwelling bus
  if (!activeRide && nearbyBoardable) {
    return (
      <div style={styles.promptContainer}>
        <div style={styles.promptCard}>
          <div style={styles.promptHeader}>
            <span
              style={{
                ...styles.routeBadge,
                backgroundColor: nearbyBoardable.bodyColor || '#facc15',
                color: '#0f172a',
              }}
            >
              Tuyến {nearbyBoardable.routeCode}
            </span>
            <span style={styles.promptTitle}>{nearbyBoardable.routeName}</span>
          </div>

          <div style={styles.promptDetails}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={styles.stationText}>
              Đang dừng tại: <strong>{nearbyBoardable.stationName}</strong>
            </span>
            <span style={styles.dwellBadge}>
              {nearbyBoardable.dwellRemaining}s
            </span>
          </div>

          <button
            id="btn-board-bus"
            onClick={() => onBoard?.(nearbyBoardable.busId)}
            style={{
              ...styles.boardButton,
              backgroundColor: nearbyBoardable.bodyColor || '#facc15',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="15" rx="3" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <circle cx="7" cy="19" r="2" />
              <circle cx="17" cy="19" r="2" />
            </svg>
            <span style={styles.boardButtonText}>[F] Lên Xe Buýt</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Scenic Transit Card when player is riding the bus
  if (activeRide) {
    return (
      <div style={styles.transitContainer}>
        <div style={styles.transitCard}>
          {/* Top Row: Route & Speed */}
          <div style={styles.transitTopRow}>
            <div style={styles.transitRouteInfo}>
              <span
                style={{
                  ...styles.transitBadge,
                  backgroundColor: activeRide.bodyColor || '#facc15',
                  color: '#0f172a',
                }}
              >
                T{activeRide.routeCode}
              </span>
              <div>
                <div style={styles.transitRouteName}>{activeRide.routeName}</div>
                <div style={styles.transitSubtitle}>Siêu Tốc Express · 100% Vật Lý 3D</div>
              </div>
            </div>

            <div style={styles.speedMeter}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span style={styles.speedNumber}>{activeRide.speed}</span>
              <span style={styles.speedUnit}>m/s ({Math.round(activeRide.speed * 3.6)} km/h)</span>
            </div>
          </div>

          {/* Middle Row: Current / Next Station status */}
          <div style={styles.stationStatusBox}>
            {activeRide.isDwelling ? (
              <div style={styles.dwellingNotice}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="10" y1="15" x2="10" y2="9" />
                  <line x1="14" y1="15" x2="14" y2="9" />
                </svg>
                <span>
                  Đang dừng tại: <strong>{activeRide.currentStation || 'Trạm'}</strong> (còn {activeRide.dwellRemaining}s)
                </span>
              </div>
            ) : (
              <div style={styles.cruisingNotice}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
                <span>
                  Trạm kế tiếp: <strong>{activeRide.nextStation || 'Trạm trung tâm'}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Real-time Scenic POI Sightseeing Announcement */}
          {activeRide.scenicPoi && (
            <div style={styles.scenicPoiBox}>
              <span
                style={{
                  ...styles.scenicBadge,
                  backgroundColor: activeRide.scenicPoi.color || '#38bdf8',
                }}
              >
                {activeRide.scenicPoi.badge || 'DANH THẮNG'}
              </span>
              <div style={styles.scenicPoiName}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{activeRide.scenicPoi.name}</span>
              </div>
            </div>
          )}

          {/* Bottom Action: Alight Button & Cinematic Tour Toggle */}
          <div style={styles.transitBottomRow}>
            <button
              id="btn-cinematic-tour"
              onClick={onToggleCinematicTour}
              style={{
                ...styles.cinematicButton,
                backgroundColor: cinematicTourActive ? '#ec4899' : 'rgba(255, 255, 255, 0.12)',
                border: cinematicTourActive ? '2px solid #f472b6' : '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: cinematicTourActive ? '0 0 16px rgba(236, 72, 153, 0.5)' : 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>{cinematicTourActive ? '[V] Đang Quay 360°' : '[V] Ngắm Cảnh 360°'}</span>
            </button>

            <button
              id="btn-alight-bus"
              onClick={onAlight}
              style={styles.alightButton}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>[E] Xuống Xe</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  // Boarding Prompt Style
  promptContainer: {
    position: 'fixed',
    bottom: '124px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1400,
    pointerEvents: 'auto',
    animation: 'popIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  promptCard: {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '3px solid #fde047',
    borderRadius: '24px',
    padding: '16px 22px',
    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.22), 0 0 0 2px rgba(253, 224, 71, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    minWidth: '320px',
  },
  promptHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    justifyContent: 'center',
  },
  routeBadge: {
    fontWeight: '900',
    fontSize: '13px',
    padding: '4px 10px',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  },
  promptTitle: {
    fontWeight: '800',
    fontSize: '17px',
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  promptDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f8fafc',
    padding: '8px 14px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    width: '100%',
    boxSizing: 'border-box',
    justifyContent: 'center',
  },
  stationText: {
    fontSize: '14px',
    color: '#334155',
  },
  dwellBadge: {
    background: '#f59e0b',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '999px',
    marginLeft: 'auto',
  },
  boardButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '18px',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)',
    transition: 'transform 0.15s ease, filter 0.15s ease',
  },
  boardButtonText: {
    fontWeight: '900',
    fontSize: '16px',
    color: '#0f172a',
  },

  // Active Transit Dashboard Style
  transitContainer: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1400,
    pointerEvents: 'auto',
    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  transitCard: {
    background: 'rgba(15, 23, 42, 0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '26px',
    padding: '16px 24px',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4), 0 0 24px rgba(56, 189, 248, 0.15)',
    minWidth: '380px',
    maxWidth: '92vw',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  transitTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  transitRouteInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  transitBadge: {
    fontWeight: '900',
    fontSize: '15px',
    padding: '6px 12px',
    borderRadius: '14px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
  },
  transitRouteName: {
    fontWeight: '800',
    fontSize: '17px',
    color: '#ffffff',
  },
  transitSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  speedMeter: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    background: 'rgba(30, 41, 59, 0.8)',
    padding: '6px 14px',
    borderRadius: '16px',
    border: '1px solid rgba(56, 189, 248, 0.3)',
  },
  speedNumber: {
    fontWeight: '900',
    fontSize: '20px',
    color: '#38bdf8',
    fontVariantNumeric: 'tabular-nums',
  },
  speedUnit: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '700',
  },
  stationStatusBox: {
    background: 'rgba(30, 41, 59, 0.65)',
    padding: '10px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  dwellingNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#fbbf24',
    fontSize: '14px',
    fontWeight: '600',
  },
  cruisingNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#34d399',
    fontSize: '14px',
    fontWeight: '600',
  },
  transitBottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '4px',
  },
  scenicPoiBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(15, 23, 42, 0.75)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    padding: '8px 14px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  scenicBadge: {
    fontSize: '11px',
    fontWeight: '900',
    color: '#0f172a',
    padding: '3px 8px',
    borderRadius: '8px',
    letterSpacing: '0.4px',
    whiteSpace: 'nowrap',
  },
  scenicPoiName: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.2px',
  },
  cinematicButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ffffff',
    borderRadius: '16px',
    padding: '10px 16px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  alightButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '16px',
    padding: '10px 18px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
    transition: 'transform 0.15s ease',
  },
};
