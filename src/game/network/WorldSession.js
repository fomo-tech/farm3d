import { allocateFarmAddress } from '../world/WorldPartition.js';

const STORAGE_KEY = 'farm-online-3d-profile-v2';
const PLAYER_ID_KEY = 'farm-online-3d-player-id-v2';
const SESSION_KEY = 'farm-online-3d-session-v2';
const locationKey = farmId => `farm-online-3d-location-v2:${farmId}`;

export function loadWorldSession() {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    playerId = `player_${crypto.randomUUID().slice(0, 12)}`;
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  const fallback = {
    playerId, farmId: null,
    neighborhoodId: null, channelId: null, name: 'Nông dân mới', registrationIndex: 0,
  };
  try {
    const sessionSaved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (sessionSaved) {
      return { ...fallback, ...sessionSaved, playerId };
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const profile = { ...fallback, ...saved, playerId };
    return { ...profile, farmAddress: profile.farmId ? allocateFarmAddress(profile.registrationIndex) : null };
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return { ...fallback, farmAddress: null };
  }
}

export function saveWorldSession(profileUpdates) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profileUpdates));
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const updated = { ...saved, ...profileUpdates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save profile', error);
    return profileUpdates;
  }
}

export function loadPlayerLocation(farmId) {
  try {
    const location = JSON.parse(localStorage.getItem(locationKey(farmId)));
    if (!location || ![location.x, location.y, location.z, location.rotation].every(Number.isFinite)) return null;
    if (Math.abs(location.x) > 10_000_000 || Math.abs(location.z) > 10_000_000 || location.y < 0 || location.y > 40) return null;
    const venues = new Set(['casino', 'fashion', 'vehicles', 'supplies']);
    const venue = venues.has(location.venue) ? location.venue : null;
    return { ...location, venue, y: venue ? location.y : 0 };
  } catch { return null; }
}

export function savePlayerLocation(farmId, location) {
  if (!location || ![location.x, location.y, location.z, location.rotation].every(Number.isFinite)) return;
  localStorage.setItem(locationKey(farmId), JSON.stringify({
    x: Number(location.x.toFixed(3)), y: Number(location.y.toFixed(3)), z: Number(location.z.toFixed(3)),
    rotation: Number(location.rotation.toFixed(3)), venue: location.venue || null, savedAt: Date.now(),
  }));
}
