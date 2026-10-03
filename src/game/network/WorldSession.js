import { allocateFarmAddress } from '../world/WorldPartition.js';
import { createRuntimeId, getBrowserStorage, safeStorageGet, safeStorageSet } from '../runtime/BrowserRuntime.js';

const STORAGE_KEY = 'farm-online-3d-profile-v2';
const PLAYER_ID_KEY = 'farm-online-3d-player-id-v2';
const SESSION_KEY = 'farm-online-3d-session-v2';

export function loadWorldSession() {
  const localStore = getBrowserStorage('localStorage');
  const sessionStore = getBrowserStorage('sessionStorage');
  let playerId = safeStorageGet(localStore, PLAYER_ID_KEY);
  if (!playerId) {
    playerId = createRuntimeId('player');
    safeStorageSet(localStore, PLAYER_ID_KEY, playerId);
  }
  const fallback = {
    playerId, farmId: null,
    neighborhoodId: null, channelId: null, name: 'Nông dân mới', registrationIndex: 0,
  };
  try {
    const sessionSaved = JSON.parse(safeStorageGet(sessionStore, SESSION_KEY));
    if (sessionSaved) {
      return { ...fallback, ...sessionSaved, playerId };
    }
    const saved = JSON.parse(safeStorageGet(localStore, STORAGE_KEY));
    const profile = { ...fallback, ...saved, playerId };
    return { ...profile, farmAddress: profile.farmId ? allocateFarmAddress(profile.registrationIndex) : null };
  } catch {
    safeStorageSet(localStore, STORAGE_KEY, JSON.stringify(fallback));
    return { ...fallback, farmAddress: null };
  }
}

export function saveWorldSession(profileUpdates) {
  const localStore = getBrowserStorage('localStorage');
  const sessionStore = getBrowserStorage('sessionStorage');
  try {
    safeStorageSet(sessionStore, SESSION_KEY, JSON.stringify(profileUpdates));
    const saved = JSON.parse(safeStorageGet(localStore, STORAGE_KEY)) || {};
    const updated = { ...saved, ...profileUpdates };
    safeStorageSet(localStore, STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save profile', error);
    return profileUpdates;
  }
}
