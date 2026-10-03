// Project only displayed fields. Never retain/walk Babylon scene graphs in HUD state.
export function transitHudSnapshot(status) {
  if (!status?.activeRide && !status?.nearbyBoardable) return null;
  const ride = status.activeRide;
  const nearby = status.nearbyBoardable;
  return {
    cinematicTourActive: Boolean(status.cinematicTourActive),
    activeRide: ride ? {
      busId: ride.busId, routeCode: ride.routeCode, routeName: ride.routeName,
      bodyColor: ride.bodyColor, speed: ride.speed, isDwelling: ride.isDwelling,
      dwellRemaining: ride.dwellRemaining, currentStation: ride.currentStation,
      nextStation: ride.nextStation, scenicPoi: ride.scenicPoi ? {
        name: ride.scenicPoi.name, color: ride.scenicPoi.color, badge: ride.scenicPoi.badge,
      } : null,
    } : null,
    nearbyBoardable: nearby ? { busId: nearby.busId, routeCode: nearby.routeCode,
      routeName: nearby.routeName, bodyColor: nearby.bodyColor,
      stationName: nearby.stationName, dwellRemaining: nearby.dwellRemaining } : null,
  };
}

export function sameTransitHud(a, b) {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

export function recordAppRender() {
  if (typeof window === 'undefined') return;
  const metrics = window.__farmReactMetrics ||= { commits: 0, appRenders: 0, maxMs: 0, slow: [] };
  metrics.appRenders = (metrics.appRenders || 0) + 1;
}

export function recordReactCommit(id, phase, actualDuration, baseDuration) {
  if (typeof window === 'undefined') return;
  const metrics = window.__farmReactMetrics ||= { commits: 0, maxMs: 0, slow: [] };
  metrics.commits++;
  metrics.maxMs = Math.max(metrics.maxMs, actualDuration);
  if (actualDuration > 30) {
    metrics.slow.push({ id, phase, actualMs: Math.round(actualDuration), baseMs: Math.round(baseDuration) });
    if (metrics.slow.length > 40) metrics.slow.shift();
    if (actualDuration > 100) window.__farmDebug?.report(metrics.slow.at(-1), 'SLOW REACT COMMIT');
  }
}
