import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicWorldPlayer } from '../server/PublicWorldState.js';

const now = 1000;
const secret = 'test-only-private-credential';
const client = {
  playerId: 'player_test0001', name: 'Nông dân', channelId: 'world:main',
  villageId: 'town', farmId: 'farm_000001', roomId: 'town:outside',
  x: 5, y: 0, z: 7, rotation: .4, venue: null, vehicle: 'walk', outfit: 'starter', homeTier: 1,
  sessionToken: secret, token: secret, sessionTokenHash: secret, googleSub: secret,
  sessions: [{ hash: secret }], socket: { private: secret }, telemetrySessionId: secret,
  lastSeen: now, messages: [now], futurePrivateField: { nested: secret },
  customization: { gender: 'female', hairStyle: 'hair_classic', hairColor: '#76503b', token: secret, futurePrivateField: secret },
  fishing: { id: 'cast-1', phase: 'fighting', expiresAt: 5000, biteAt: 2000, hookedAt: 900,
    target: { x: 10, y: 0, z: 20, token: secret }, castDistance: 4, pull: 10, tension: 35,
    shadowSize: 'small', shadowShape: 'oval', fishId: secret, weight: 2.5, token: secret,
    fightProfile: { pullRate: 30, rushRate: 32, restMs: 2200, rushMs: 650, direction: 1, token: secret } },
};
const publicPlayer = publicWorldPlayer(client, now);
const wire = JSON.stringify({ type: 'world_state', serverTime: now, players: [publicPlayer] });
assert.ok(!wire.includes(secret), 'no private value may reach another player');
assert.ok(!wire.includes('sessionToken'), 'session credentials stay out of the public schema');
assert.deepEqual(Object.keys(publicPlayer).sort(), [
  'playerId','name','channelId','villageId','farmId','roomId','x','y','z','rotation','venue','vehicle','outfit','homeTier','customization','fishing',
].sort());
assert.equal(publicPlayer.playerId, client.playerId);
assert.equal(publicPlayer.rotation, .4);
assert.equal(publicPlayer.customization.hairStyle, 'hair_classic');
assert.deepEqual(publicPlayer.fishing.target, { x: 10, y: 0, z: 20 });
assert.equal(publicPlayer.fishing.fightProfile.pullRate, 30);
assert.equal(publicWorldPlayer(client, 5000).fishing, null, 'expired fishing presence disappears');
assert.equal(publicWorldPlayer({ playerId: client.playerId }, now).fishing, null);
// Even allowed fields cannot transport arbitrary objects/private nested data.
assert.ok(!JSON.stringify(publicWorldPlayer({ ...client, name: { token: secret }, customization: { hairStyle: { token: secret } } }, now)).includes(secret));
publicPlayer.fishing.target.x = 99;
publicPlayer.customization.hairStyle = 'changed';
assert.equal(client.fishing.target.x, 10, 'projection does not share mutable nested state');
assert.equal(client.customization.hairStyle, 'hair_classic');
const server = readFileSync(new URL('../server/index.js', import.meta.url), 'utf8');
assert.match(server, /\.map\(player => publicWorldPlayer\(player, now\)\)/, 'live broadcast uses the safe serializer');
assert.ok(!server.includes('client.sessionToken'), 'client objects never store or access authentication credentials');
assert.match(server, /sessionToken: account\.token/, 'owner still receives their login token');
assert.match(server, /revokeGameSession\(client\.playerId, clientSessionTokens\.get\(client\)\)/, 'logout uses private credentials');
assert.match(server, /deleteGameAccount\(client\.playerId, clientSessionTokens\.get\(client\)\)/, 'account deletion retains authentication');
console.log('PASS: world_state excludes credentials and internal fields, preserves gameplay, and isolates nested objects.');
