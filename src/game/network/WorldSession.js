import { allocateFarmAddress } from '../world/WorldPartition.js';
import { createRuntimeId, getBrowserStorage, safeStorageGet, safeStorageSet } from '../runtime/BrowserRuntime.js';

const STORAGE_KEY = 'farm-online-3d-profile-v2';
const PLAYER_ID_KEY = 'farm-online-3d-player-id-v2';
const SESSION_KEY = 'farm-online-3d-session-v2';
const GUEST_ID_KEY = 'farm-online-3d-guest-id-v1';
const profileKey = playerId => `farm-online-3d-profile:${playerId}`;

export function loadWorldSession() {
  const localStore = getBrowserStorage('localStorage');
  const sessionStore = getBrowserStorage('sessionStorage');
  let playerId = safeStorageGet(localStore, PLAYER_ID_KEY);
  if (!playerId) {
    playerId = createRuntimeId('player');
    safeStorageSet(localStore, PLAYER_ID_KEY, playerId);
  }
  if (!safeStorageGet(localStore, GUEST_ID_KEY)) safeStorageSet(localStore, GUEST_ID_KEY, playerId);
  const fallback = {
    playerId, farmId: null,
    neighborhoodId: null, channelId: null, name: 'Nông dân mới', registrationIndex: 0,
  };
  try {
    const sessionSaved = JSON.parse(safeStorageGet(sessionStore, SESSION_KEY));
    if (sessionSaved?.playerId === playerId) {
      return { ...fallback, ...sessionSaved, playerId };
    }
    const saved = JSON.parse(safeStorageGet(localStore, profileKey(playerId)))
      || JSON.parse(safeStorageGet(localStore, STORAGE_KEY));
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
    const updated = { ...profileUpdates };
    safeStorageSet(localStore, STORAGE_KEY, JSON.stringify(updated));
    safeStorageSet(localStore, profileKey(updated.playerId), JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save profile', error);
    return profileUpdates;
  }
}

export function switchWorldIdentity(identity) {
  const localStore = getBrowserStorage('localStorage');
  const sessionStore = getBrowserStorage('sessionStorage');
  if (!/^player_[a-z0-9_-]{8,64}$/i.test(identity?.playerId) || !identity.sessionToken) throw new Error('Tài khoản không hợp lệ.');
  const profile = { playerId: identity.playerId, sessionToken: identity.sessionToken,
    name: identity.name || 'Nông dân mới', googleLinked: Boolean(identity.googleLinked), farmId: null,
    neighborhoodId: null, channelId: null, registrationIndex: 0 };
  safeStorageSet(localStore, PLAYER_ID_KEY, profile.playerId);
  safeStorageSet(localStore, STORAGE_KEY, JSON.stringify(profile));
  safeStorageSet(localStore, profileKey(profile.playerId), JSON.stringify(profile));
  safeStorageSet(sessionStore, SESSION_KEY, JSON.stringify(profile));
  return profile;
}

export function restoreGuestIdentity() {
  const localStore = getBrowserStorage('localStorage');
  const sessionStore = getBrowserStorage('sessionStorage');
  let guestId = safeStorageGet(localStore, GUEST_ID_KEY);
  if (!guestId) return false;
  let guest = JSON.parse(safeStorageGet(localStore, profileKey(guestId)) || 'null');
  if (guest?.googleLinked) {
    guestId = createRuntimeId('player');
    guest = null;
    safeStorageSet(localStore, GUEST_ID_KEY, guestId);
  }
  const profile = guest?.playerId === guestId ? guest : { playerId: guestId, name: 'Nông dân mới', farmId: null, registrationIndex: 0 };
  safeStorageSet(localStore, PLAYER_ID_KEY, guestId);
  safeStorageSet(localStore, STORAGE_KEY, JSON.stringify(profile));
  safeStorageSet(sessionStore, SESSION_KEY, JSON.stringify(profile));
  return true;
}

export function leaveWorldSession({ deleted = false } = {}) {
  const localStore = getBrowserStorage('localStorage');
  const sessionStore = getBrowserStorage('sessionStorage');
  const current = loadWorldSession();
  if (!deleted) {
    if (current.googleLinked) restoreGuestIdentity();
    const guest = loadWorldSession();
    return saveWorldSession({ ...guest, signedOut: true });
  }
  for (const key of [profileKey(current.playerId), STORAGE_KEY, PLAYER_ID_KEY]) {
    try { localStore?.removeItem(key); } catch {}
  }
  if (safeStorageGet(localStore, GUEST_ID_KEY) === current.playerId) {
    try { localStore?.removeItem(GUEST_ID_KEY); } catch {}
  }
  try { sessionStore?.removeItem(SESSION_KEY); } catch {}
  return loadWorldSession();
}
