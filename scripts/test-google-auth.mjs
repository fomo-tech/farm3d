import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { verifyGoogleCredential } from '../server/GoogleIdentity.js';
import { loadWorldSession, saveWorldSession, switchWorldIdentity, restoreGuestIdentity, leaveWorldSession } from '../src/game/network/WorldSession.js';

function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
}
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();

const guest = loadWorldSession();
assert.match(guest.playerId, /^player_/);
saveWorldSession({ ...guest, sessionToken: 'guest-secret', hasEnteredWorld: true, farmId: 'farm_000003', name: 'Khách cũ' });
const googleId = 'player_0123456789abcdef01234567';
switchWorldIdentity({ playerId: googleId, sessionToken: 'google-secret', name: 'Nhân vật Google', googleLinked: true });
assert.equal(loadWorldSession().playerId, googleId);
assert.equal(loadWorldSession().sessionToken, 'google-secret');
assert.equal(restoreGuestIdentity(), true);
assert.equal(loadWorldSession().hasEnteredWorld, true, 'Returning guest keeps the play preference after switching accounts');
assert.equal(loadWorldSession().playerId, guest.playerId);
assert.equal(loadWorldSession().farmId, 'farm_000003');
assert.equal(loadWorldSession().sessionToken, 'guest-secret');

// Linking the current guest must not let "play as guest" silently reopen the
// same Google-protected character without signing in again.
saveWorldSession({ ...loadWorldSession(), googleLinked: true });
assert.equal(restoreGuestIdentity(), true);
assert.equal(loadWorldSession().hasEnteredWorld, undefined, 'A new guest does not inherit the previous play preference');
assert.notEqual(loadWorldSession().playerId, guest.playerId);
assert.equal(loadWorldSession().googleLinked, undefined);

const fake = `${Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'fake' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: '123456789', aud: 'other-app' })).toString('base64url')}.signature`;
await assert.rejects(verifyGoogleCredential(fake, ''), /GOOGLE_CLIENT_ID/);
await assert.rejects(verifyGoogleCredential('not-a-jwt', 'client-id'), /không hợp lệ/);
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', use: 'sig' };
globalThis.fetch = async () => ({ ok: true, json: async () => ({ keys: [jwk] }), headers: { get: () => 'max-age=300' } });
const makeCredential = claims => {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = sign('RSA-SHA256', Buffer.from(`${header}.${body}`), privateKey).toString('base64url');
  return `${header}.${body}.${signature}`;
};
const claims = { sub: '123456789012345678901', aud: 'game-client', iss: 'https://accounts.google.com',
  iat: Math.floor(Date.now() / 1000) - 10, exp: Math.floor(Date.now() / 1000) + 600 };
assert.deepEqual(await verifyGoogleCredential(makeCredential(claims), 'game-client'), { sub: claims.sub });
await assert.rejects(verifyGoogleCredential(makeCredential({ ...claims, aud: 'attacker-app' }), 'game-client'), /không dành cho game/);
await assert.rejects(verifyGoogleCredential(makeCredential({ ...claims, exp: 1 }), 'game-client'), /hết hạn/);
const altered = makeCredential(claims).split('.');
altered[1] = Buffer.from(JSON.stringify({ ...claims, sub: '999999999999' })).toString('base64url');
await assert.rejects(verifyGoogleCredential(altered.join('.'), 'game-client'), /chữ ký/);
console.log('Google auth identity flow OK');

const beforeLeave = loadWorldSession();
leaveWorldSession();
assert.equal(loadWorldSession().playerId, beforeLeave.playerId);
assert.equal(loadWorldSession().signedOut, true);
leaveWorldSession({ deleted: true });
assert.notEqual(loadWorldSession().playerId, beforeLeave.playerId);
assert.equal(loadWorldSession().signedOut, undefined);
