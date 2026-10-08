import { publicWorldPlayer } from './PublicWorldState.js';
import { publicFishAppearance } from '../shared/fishAppearance.js';
import {lotterySnapshot} from './LotteryStore.js';
import {getFishingConditions} from '../shared/fishingConditions.js';
import { createServer } from 'node:http';
import { travelCost } from '../shared/travelConfig.js';
import {resolveTravelDestination} from '../shared/travelDestinations.js';
import { chargeTravel } from './GameStore.js';
import { WebSocketServer, WebSocket } from 'ws';
import { purchaseFarm, listLandMarket, getAssignment, initVillageRegistry, isAssignedFarm, listVillageAssignments, listVillages, positionForLot, villageChannel, villageForFarm } from './VillageRegistry.js';
import { authenticate, deleteGameAccount, googleAccountLogin, linkGoogleAccount, revokeGameSession, casinoRefundStale, farmAction, initGameStore, initFarmSecurity, farmSecurity, fishingTelemetry, loadFarmAssignment, likeFarm, loadFarms, loadPlayer, loadPublicFarmProfiles, loadPublicPlayerProfile, loadSocialState, performAction, savePosition, updateFriend } from './GameStore.js';
import { verifyGoogleCredential } from './GoogleIdentity.js';
import { decodeFarmId } from '../shared/villageLayout.js';
import { farmGateOpen } from '../shared/farmSecurity.js';
import { CasinoActionError } from './casino/CasinoActionError.js';
import { publicFishingProgress } from '../shared/fishingSession.js';
import { getGameStoreDatabase } from './GameStore.js';
import { CasinoRoomManager } from './casino/CasinoRoomManager.js';
import { FARM_ACTIVE_PLOTS, FARM_LOT_SPEC, FARM_TILE_KEY_PATTERN, farmTilePosition as sharedFarmTilePosition } from '../shared/farmLayout.js';
import { WORLD_VILLAGES, villageGeometry } from '../shared/villageLayout.js';
import { VENUE_LAYOUT } from '../shared/venueLayout.js';
import { normalizeVenuePosition } from '../shared/venuePosition.js';
import { TOWN_SPAWN, recoverTownSpawn, insideTownFountain } from '../shared/playerSpawn.js';
import { lakeMovementBlocked, recoverLakePosition } from '../shared/lakeConfig.js';
import { MovementAuthority } from './MovementAuthority.js';
import { CASINO_TABLE_ANCHORS } from '../shared/casinoTableAnchors.js';

const PORT = Number(process.env.MULTIPLAYER_PORT || 8787);
const TICK_MS = 100;
const PLAYER_VIEW_RADIUS = 240;
const FARM_VIEW_RADIUS = 115;
const MAP_LAYOUT_VERSION = FARM_LOT_SPEC.version;
const FARM_LAYOUT = Object.freeze({
  version: MAP_LAYOUT_VERSION,
  activePlots: FARM_ACTIVE_PLOTS,
  columns: FARM_LOT_SPEC.columns,
  rows: FARM_LOT_SPEC.rows,
  tileSize: FARM_LOT_SPEC.tileSize,
  estateWidth: FARM_LOT_SPEC.estateWidth,
  estateDepth: FARM_LOT_SPEC.estateDepth,
});
const FARM_INTERACTION_RADIUS = 6;
const MAX_PLAYER_SPEED = 32;
const VALID_VENUES = new Set(['casino', 'fashion', 'vehicles', 'supplies', 'fishing']);
const ROOM_LAYOUT = VENUE_LAYOUT;
// Keep authentication credentials outside objects used by game/broadcast code.
const clientSessionTokens = new WeakMap();
const clients = new Map();
const movementAuthority = new MovementAuthority();
let casinoManager;
function broadcastCasinoState() {
  if (!casinoManager) return;
  clients.forEach(client => {
    if (client.venue === 'casino' || casinoManager.members.has(client.playerId)) safeSend(client.socket, casinoManager.view(client.playerId));
  });
}
const recentActions = new Map();
const ACTION_CACHE_TTL = 5 * 60_000;
const authAttempts = new Map();
const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX_ATTEMPTS = 12;

const httpServer = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.url === '/health') {
    response.end(JSON.stringify({ ok: true, players: clients.size, uptime: Math.round(process.uptime()) }));
    return;
  }
  response.statusCode = 404;
  response.end(JSON.stringify({ error: 'Not found' }));
});

const wss = new WebSocketServer({ server: httpServer });

function safeSend(socket, payload) {
  const now=Date.now();
  const visible = payload.progress ? { ...payload, progress: publicFishingProgress(payload.progress), serverNow:now,fishingConditions:getFishingConditions(now) } : payload;
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(visible));
}

function clientAddress(socket) {
  return socket._socket?.remoteAddress || 'unknown';
}

function allowAuthAttempt(address) {
  const now = Date.now();
  const recent = (authAttempts.get(address) || []).filter(time => now - time < AUTH_WINDOW_MS);
  if (recent.length >= AUTH_MAX_ATTEMPTS) {
    authAttempts.set(address, recent);
    return false;
  }
  recent.push(now);
  authAttempts.set(address, recent);
  return true;
}

function actionCacheKey(client, requestId) {
  return requestId ? `${client.playerId}:${String(requestId).slice(0, 80)}` : null;
}

function beginAction(client, requestId) {
  const key = actionCacheKey(client, requestId);
  if (!key) return { key: null, duplicate: false };
  const cached = recentActions.get(key);
  if (cached) {
    if (cached.responses) cached.responses.forEach(payload => safeSend(client.socket, payload));
    return { key, duplicate: true };
  }
  recentActions.set(key, { createdAt: Date.now(), responses: null });
  return { key, duplicate: false };
}

function finishAction(key, responses) {
  if (key) recentActions.set(key, { createdAt: Date.now(), responses });
}

function channelPlayers(channelId) {
  return [...clients.values()].filter(client => client.channelId === channelId);
}

function roomKey(villageId, venue) {
  return `world:main:${venue || 'overworld'}`;
}

function isNear(point, x, z, radius) {
  return Math.hypot(x - point.x, z - point.z) <= radius;
}

function isRoomTransition(client, x, y, z, venue) {
  if (venue && ROOM_LAYOUT[venue]) {
    const room = ROOM_LAYOUT[venue];
    return client.roomId === roomKey(client.villageId, null)
      && isNear(room.entrance, client.x, client.z, 18)
      && isNear(room.interior, x, z, 18)
      && y >= 20;
  }
  if (!venue && client.venue && ROOM_LAYOUT[client.venue]) {
    const room = ROOM_LAYOUT[client.venue];
    return isNear(room.interior, client.x, client.z, 22)
      && isNear(room.entrance, x, z, 18)
      && y <= 2;
  }
  return false;
}

function broadcastPresence(channelId) {
  const channel = channelPlayers(channelId);
  const conditions=getFishingConditions();
  const now = Date.now();
  channel.forEach(client => {
    if(client.fishingDay!==conditions.dayKey){client.fishingDay=conditions.dayKey;safeSend(client.socket,{type:'fishing_conditions',fishingConditions:conditions,serverNow:Date.now()});}
    const players = channel
      .filter(other => other.roomId === client.roomId && (other === client || Math.hypot(other.x - client.x, other.z - client.z) <= PLAYER_VIEW_RADIUS))
      .map(player => publicWorldPlayer(player, now));
    safeSend(client.socket, { type: 'world_state', serverTime: Date.now(), players });
  });
}

function fishingPresence(pending) {
  return pending ? { id:pending.id, phase:pending.phase, target:pending.target, castDistance:pending.castDistance, biteAt:pending.biteAt, expiresAt:pending.expiresAt,hookedAt:pending.hookedAt,fightProfile:pending.fightProfile,pull:pending.pull,tension:pending.tension,...publicFishAppearance(pending.fishId,pending.weight) } : null;
}

async function publicFarmScope(client, force = false) {
  if (!client.villageId || (!force && Date.now() - client.lastFarmScopeAt < 1000)) return;
  client.lastFarmScopeAt = Date.now();
  if (client.venue) {
    if (client.farmScopeKey !== 'interior') {
      client.farmScopeKey = 'interior';
      client.visibleFarmIds = new Set();
      safeSend(client.socket, { type: 'farm_scope', farms: [], crops: {} });
    }
    return;
  }
  const assignments = await listVillageAssignments();
  const visible = assignments.filter(item => {
    const position = positionForLot(Number(item.farmId.slice(-6)));
    return item.playerId === client.playerId || Math.hypot(position.x - client.x, position.z - client.z) <= FARM_VIEW_RADIUS;
  });
  const farmIds = visible.map(item => item.farmId);
  const scopeKey = farmIds.slice().sort().join(',');
  if (!force && scopeKey === client.farmScopeKey) return;
  client.farmScopeKey = scopeKey;
  client.visibleFarmIds = new Set(farmIds);
  const profiles = await loadPublicFarmProfiles(visible.map(item => item.playerId));
  const profileById = new Map(profiles.map(profile => [profile.playerId, profile]));
  const farms = visible.map(item => ({
    farmId: item.farmId,
    villageId: item.villageId,
    lot: item.lot,
    ...positionForLot(Number(item.farmId.slice(-6))),
    ...profileById.get(item.playerId),
    online: [...clients.values()].some(other => other.playerId === item.playerId),
  }));
  const crops = {};
  for (const villageId of new Set(visible.map(item => item.villageId))) {
    Object.assign(crops, await loadFarms(villageId, visible.filter(item => item.villageId === villageId).map(item => item.farmId)));
  }
  safeSend(client.socket, { type: 'farm_scope', farms, crops, lots: await listLandMarket() });
}

function broadcastFarmUpdate(actor, payload) {
  channelPlayers(actor.channelId).forEach(client => {
    if (client.socket === actor.socket || client.visibleFarmIds?.has(payload.farmId)) safeSend(client.socket, payload);
  });
}

function farmTilePosition(farmId, tileKey) {
  const lot = Number(String(farmId).slice(-6));
  if (!Number.isInteger(lot) || !FARM_TILE_KEY_PATTERN.test(String(tileKey))) return null;
  return sharedFarmTilePosition(lot, tileKey);
}

async function refreshPublicFarms(channelId) {
  await Promise.all(channelPlayers(channelId).map(client => publicFarmScope(client, true)));
}

function broadcastToChannel(channelId, payload, excludeSocket = null) {
  const target = channelId || 'world:main';
  for (const client of clients.values()) {
    if (client.socket !== excludeSocket && client.playerId && (client.channelId === target || !client.channelId || target === 'world:main')) {
      safeSend(client.socket, payload);
    }
  }
}

wss.on('connection', socket => {
  const client = { socket, playerId: null, name: 'Nông dân', channelId: null, farmId: null, villageId: null, x: TOWN_SPAWN.x, y: TOWN_SPAWN.y, z: TOWN_SPAWN.z, rotation: 0, venue: null, lastSeen: Date.now(), lastPersisted: 0, lastFarmScopeAt: 0, farmScopeKey: '', visibleFarmIds: new Set(), messages: [] };
  socket.on('message', async raw => {
    let message;
    try {
    if (String(raw).length > 16_384) return socket.close(1009, 'Message too large');
    const now = Date.now();
    client.messages = client.messages.filter(time => now - time < 1000);
    if (client.messages.length >= 40) return;
    client.messages.push(now);
    try { message = JSON.parse(String(raw)); } catch { return; }
    if (message.type === 'google_login' || message.type === 'google_link') {
      if (!allowAuthAttempt(clientAddress(socket))) {
        safeSend(socket, { type: 'google_auth_result', status: 'error', message: 'Thử lại sau một phút.' });
        return;
      }
      try {
        const { sub } = await verifyGoogleCredential(message.credential);
        if (message.type === 'google_login') {
          const account = await googleAccountLogin(sub);
          safeSend(socket, { type: 'google_auth_result', status: 'login', playerId: account.playerId,
            sessionToken: account.token, name: account.name, googleLinked: true });
        } else if (client.playerId && clients.has(socket)) {
          safeSend(socket, { type: 'google_auth_result', ...(await linkGoogleAccount(client.playerId, sub)) });
        } else safeSend(socket, { type: 'google_auth_result', status: 'error', message: 'Cần vào game trước khi liên kết.' });
      } catch (error) { safeSend(socket, { type: 'google_auth_result', status: 'error', message: 'Chưa thể đăng nhập Google. Hãy thử lại sau.' }); }
      return;
    }
    if (message.type === 'join') {
      client.playerId = String(message.playerId || '').slice(0, 64);
      if (!/^player_[a-z0-9_-]{8,64}$/i.test(client.playerId)) return socket.close(1008, 'Invalid player id');
      if (!allowAuthAttempt(clientAddress(socket))) {
        safeSend(socket, { type: 'auth_error', message: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau một phút.' });
        return socket.close(1013, 'Auth rate limit');
      }
      const account = await authenticate(client.playerId, String(message.sessionToken || ''), message.name);
      if (account.error) { safeSend(socket, { type: 'auth_error', message: account.error }); return socket.close(1008, 'Invalid session'); }
      clientSessionTokens.set(client, account.token);
      const recovered = await casinoRefundStale(client.playerId, []);
      if (recovered) account.progress = recovered.progress;
      client.name = account.name;
      client.fishing = fishingPresence(account.progress.fishing?.pending);
      const recoveredPosition = recoverLakePosition(recoverTownSpawn(account.position));
      if (recoveredPosition !== account.position) {
        account.position = recoveredPosition;
        await savePosition(client.playerId, recoveredPosition);
      }
      client.vehicle = account.progress?.vehicle || 'walk';
      client.outfit = account.progress?.outfit || 'starter';
      safeSend(socket, { type: 'account_state', name: account.name, googleLinked: account.googleLinked, sessionToken: account.token, progress: account.progress, livestock: account.livestock, position: account.position?.layoutVersion === MAP_LAYOUT_VERSION ? account.position : null });
      safeSend(socket, { type: 'village_list', villages: await listVillages() });
      const existing = await getAssignment(client.playerId);
      const assignedLot = existing || { farmId: null, villageId: 'town', villageName: 'Thị trấn', lot: null, spawn: TOWN_SPAWN, farmConfig: null };

      client.farmId = assignedLot.farmId;
      client.villageId = assignedLot.villageId;
      client.channelId = villageChannel(assignedLot.villageId);
      client.roomId = roomKey(client.villageId, null);
      client.x = assignedLot.spawn.x;
      client.y = assignedLot.spawn.y;
      client.z = assignedLot.spawn.z;
      clients.set(socket, client);
      await casinoManager.reconnect(client.playerId);
      safeSend(socket, casinoManager.view(client.playerId));

      if (existing && account.position?.layoutVersion === 6 && account.position.villageId === assignedLot.villageId) {
        const origin = villageGeometry(assignedLot.village.order);
        const inOldFarmDistrict = Math.abs(account.position.x) <= 70 && account.position.z >= 90 && account.position.z <= 278;
        account.position = {
          ...account.position,
          x: account.position.x + (inOldFarmDistrict ? origin.offsetX : 0),
          z: account.position.z + (inOldFarmDistrict ? origin.offsetZ : 0),
          layoutVersion: MAP_LAYOUT_VERSION,
        };
        await savePosition(client.playerId, account.position);
      }
      if (account.position && account.position.villageId === assignedLot.villageId && account.position.layoutVersion === MAP_LAYOUT_VERSION) {
        account.position = normalizeVenuePosition(account.position);
        client.x = Number.isFinite(Number(account.position.x)) ? Number(account.position.x) : client.x;
        client.y = Number(account.position.y) || 0;
        client.z = Number.isFinite(Number(account.position.z)) ? Number(account.position.z) : client.z;
        client.rotation = Number(account.position.rotation) || 0;
        client.venue = VALID_VENUES.has(account.position.venue) ? account.position.venue : null;
        client.roomId = roomKey(client.villageId, client.venue);
      }
      client.customization = account.progress?.customization || null;
      if (client.telemetrySessionId) fishingTelemetry.endSession(client.telemetrySessionId, client);
      client.telemetrySessionId = fishingTelemetry.startSession(client.playerId, client);

      safeSend(socket, {
        type: 'welcome',
        playerId: client.playerId,
        channelId: client.channelId,
        villageId: assignedLot.villageId,
        villageName: assignedLot.villageName,
        lot: assignedLot.lot,
        farmId: client.farmId,
        spawn: { x: client.x, y: client.y, z: client.z, venue: client.venue, rotation: client.rotation },
        farmConfig: assignedLot.farmConfig,
        farmLayout: FARM_LAYOUT,
        tickMs: TICK_MS,
        layoutVersion: MAP_LAYOUT_VERSION
        ,roomId: client.roomId
      });
      safeSend(socket, { type: 'village_list', villages: await listVillages() });
      
      await refreshPublicFarms(client.channelId);
      safeSend(socket, { type: 'social_state', ...(await loadSocialState(client.playerId)) });
      
      broadcastPresence(client.channelId);
      return;
    }
    if (!client.playerId || !clients.has(socket)) return;
    if (message.type === 'google_logout') {
      const player = await loadPlayer(client.playerId);
      if (player?.googleLinked) await revokeGameSession(client.playerId, clientSessionTokens.get(client));
      safeSend(socket, { type: 'google_auth_result', status: 'logged-out' });
      socket.close(1000, 'Signed out');
      return;
    }
    if (message.type === 'account_delete') {
      if (message.confirm !== 'DELETE_ACCOUNT') return;
      if (casinoManager.members.has(client.playerId)) {
        safeSend(socket, { type: 'google_auth_result', status: 'error', message: 'Hãy rời bàn chơi trước khi xoá tài khoản.' });
        return;
      }
      try {
        const result = await deleteGameAccount(client.playerId, clientSessionTokens.get(client));
        if (result.error) { safeSend(socket, { type: 'google_auth_result', status: 'error', message: result.error }); return; }
        for (const [peer, member] of clients) {
          if (member.playerId === client.playerId) {
            if (member.telemetrySessionId) fishingTelemetry.sessions.delete(member.telemetrySessionId);
            member.telemetrySessionId = null;
            safeSend(peer, { type: 'google_auth_result', status: 'deleted' });
            clients.delete(peer);
            peer.close(1000, 'Account deleted');
          }
        }
        await refreshPublicFarms(client.channelId);
        broadcastPresence(client.channelId);
      } catch (error) {
        console.error('Account deletion failed', error);
        safeSend(socket, { type: 'google_auth_result', status: 'error', message: 'Không thể hoàn tất xoá tài khoản. Vui lòng thử lại.' });
      }
      return;
    }
    if (message.type === 'land_market') {
      safeSend(socket, { type: 'land_market', lots: await listLandMarket() });
      return;
    }
    if (message.type === 'lottery_sync') {
      const player = await loadPlayer(client.playerId);
      if (player) safeSend(socket,{type:'lottery_state',state:await lotterySnapshot(getGameStoreDatabase(),player.progress)});
      return;
    }
    if (message.type === 'missions_sync') {
      const player = await loadPlayer(client.playerId);
      if (player) safeSend(socket, { type: 'account_state', progress: player.progress });
      return;
    }
    if (message.type === 'resync' && client.villageId) {
      await publicFarmScope(client, true);
      broadcastPresence(client.channelId);
      return;
    }
    if (message.type === 'ping') {
      safeSend(socket, { type: 'pong', sentAt: message.sentAt, serverTime: Date.now() });
      return;
    }
    if (message.type === 'move') {
      if (client.travelPending) return;
      const safePosition = recoverTownSpawn(client,{legacyDefault:false,clearance:.45});
      if(safePosition !== client){client.x=safePosition.x;client.y=safePosition.y;client.z=safePosition.z;client.rotation=safePosition.rotation;}
      const x = Number(message.x); const y = Number(message.y || 0); const z = Number(message.z); const rotation = Number(message.rotation);
      if (![x, y, z, rotation].every(Number.isFinite) || Math.abs(x) > 10_000_000 || Math.abs(z) > 10_000_000 || y < 0 || y > 40) return;
      const elapsed = Math.max(.1, (Date.now() - client.lastSeen) / 1000);
      const distance = Math.hypot(x - client.x, z - client.z);
      const requestedVenue = VALID_VENUES.has(message.venue) ? message.venue : null;
      const roomTransition = isRoomTransition(client, x, y, z, requestedVenue);
      const casinoRoom=casinoManager.rooms.get(casinoManager.members.get(client.playerId));
      const anchor=casinoRoom && CASINO_TABLE_ANCHORS[casinoRoom.game];
      const seatTravel=client.venue==='casino' && requestedVenue==='casino' && anchor && Math.hypot(x-ROOM_LAYOUT.casino.interior.x-anchor.seatX,z-ROOM_LAYOUT.casino.interior.z-anchor.seatZ)<.4 && Math.abs(y-ROOM_LAYOUT.casino.interior.y)<.4;
      if (requestedVenue !== client.venue && !roomTransition) return;
      if (!roomTransition && !seatTravel && !movementAuthority.isBoarding(client) && distance > 1.5 + elapsed * movementAuthority.maxSpeed(client)) {
        safeSend(socket, { type: 'move_ack', accepted: false, x: client.x, y: client.y, z: client.z, rotation: client.rotation, venue: client.venue, serverTime: Date.now() });
        return;
      }
      if (!roomTransition && !seatTravel && !movementAuthority.accepts(client,{x,y,z})) {
        safeSend(socket,{type:'move_ack',accepted:false,x:client.x,y:client.y,z:client.z,rotation:client.rotation,venue:client.venue,serverTime:Date.now()});
        return;
      }
      if (roomTransition || seatTravel) movementAuthority.reset(client);
      const previousRoom = client.roomId;
      if (!requestedVenue && (insideTownFountain(x,z) || farmSecurity.blocksMovement(client, { x, z }) || lakeMovementBlocked(client, { x, z }))) {
        safeSend(socket, { type: 'move_ack', accepted: false, x: client.x, y: client.y, z: client.z, rotation: client.rotation, venue: client.venue, serverTime: Date.now() });
        return;
      }
      const previousVenue = client.venue;
      client.x = x; client.y = y; client.z = z; client.rotation = rotation; client.venue = requestedVenue; client.roomId = roomKey(client.villageId, client.venue); client.lastSeen = Date.now();
      fishingTelemetry.observe(client.telemetrySessionId, client, { meaningful: distance > .1 || previousVenue !== client.venue });
      if (previousVenue === 'casino' && requestedVenue !== 'casino' && ![...clients.values()].some(other => other !== client && other.playerId === client.playerId && other.venue === 'casino')) await casinoManager.disconnect(client.playerId);
      if (previousVenue !== 'casino' && requestedVenue === 'casino') { await casinoManager.reconnect(client.playerId); broadcastCasinoState(); }
      farmSecurity.observeMovement(client.playerId, client, farmTilePosition);
      safeSend(socket, { type: 'move_ack', accepted: true, x, y, z, rotation, venue: client.venue, roomId: client.roomId, serverTime: Date.now() });
      if (Date.now() - client.lastPersisted > 2000) {
        client.lastPersisted = Date.now();
        savePosition(client.playerId, { x, y, z, rotation, venue: client.venue, villageId: client.villageId, layoutVersion: MAP_LAYOUT_VERSION });
      }
      await publicFarmScope(client);
      if (previousRoom !== client.roomId) broadcastPresence(client.channelId);
    }
    if (message.type === 'travel') {
      if (client.travelPending) return;
      const x = Number(message.x); const z = Number(message.z);
      if (Number.isFinite(x) && Number.isFinite(z) && Math.abs(x) <= 10_000_000 && Math.abs(z) <= 10_000_000) {
        const previousRoom = client.roomId;
        const target=resolveTravelDestination(x,z,client.farmId);
        if(!target){safeSend(socket,{type:'action_error',message:'Điểm đến chưa sẵn sàng. Hãy chọn lại trên bản đồ.'});return;}
        const cost = travelCost(client, target);
        client.travelPending = true;
        let payment;
        try { payment = await chargeTravel(client.playerId, cost); }
        finally { client.travelPending = false; }
        if (payment.error) {
          safeSend(socket, { type: 'action_error', message: payment.error });
          return;
        }
        safeSend(socket, { type: 'account_state', progress: payment.player.progress, livestock: payment.player.livestock, result: { travelCost: cost } });
        // Fast travel always lands outdoors; a client must cross a validated
        // venue doorway before it may join an interior room or place bets.
        client.x = target.x; client.y = 0; client.z = target.z; client.venue = null; client.lastSeen = Date.now();
        movementAuthority.reset(client);
        fishingTelemetry.observe(client.telemetrySessionId, client, { meaningful: true });
        client.roomId = roomKey(client.villageId, client.venue);
        safeSend(socket, { type: 'move_ack', x: client.x, y: client.y, z: client.z, rotation: client.rotation, venue: client.venue, serverTime: Date.now() });
        savePosition(client.playerId, { x: client.x, y: client.y, z: client.z, rotation: client.rotation, venue: client.venue, villageId: client.villageId, layoutVersion: MAP_LAYOUT_VERSION });
        await publicFarmScope(client, true);
        if (previousRoom !== client.roomId) broadcastPresence(client.channelId);
      }
    }
    if(message.type==='bus_board') {
      if(!movementAuthority.board(client,message.busId))safeSend(socket,{type:'move_ack',accepted:false,busRejected:true,x:client.x,y:client.y,z:client.z,rotation:client.rotation,venue:client.venue});
      return;
    }
    if (message.type === 'farm_action') {
      const tracked = beginAction(client, message.requestId);
      if (tracked.duplicate) return;
      const { farmId, tileKey, action, crop, wateredAt, plantedAt } = message;
      if (!farmId || !tileKey || !action) { recentActions.delete(tracked.key); return; }
      if (client.venue) { const response = { type: 'action_error', requestId: message.requestId, message: 'Bạn phải rời cửa hàng trước khi làm ruộng.' }; safeSend(socket, response); finishAction(tracked.key, [response]); return; }
      const tilePosition = farmTilePosition(farmId, tileKey);
      if (!tilePosition || Math.hypot(tilePosition.x - client.x, tilePosition.z - client.z) > FARM_INTERACTION_RADIUS) {
        const response = { type: 'action_error', requestId: message.requestId, message: 'Bạn đang đứng quá xa ô đất.' };
        safeSend(socket, response); finishAction(tracked.key, [response]);
        return;
      }
      const targetVillage = await villageForFarm(farmId);
      if (!targetVillage || !(await isAssignedFarm(targetVillage.villageId, farmId))) {
        const response = { type: 'action_error', requestId: message.requestId, message: 'Nông trại này chưa có chủ sở hữu.' };
        safeSend(socket, response); finishAction(tracked.key, [response]);
        return;
      }
      if (action === 'steal_start' || action === 'steal_finish') {
        const assignment = await loadFarmAssignment(targetVillage.villageId, farmId);
        const decoded = decodeFarmId(farmId);
        const stolen = await farmSecurity.steal({ assignment, farmId, storageFarmId: `farm_${String(decoded.lot).padStart(6, '0')}`, tileKey, playerId: client.playerId, position: client, tilePosition,
          phase: action === 'steal_start' ? 'start' : 'finish', token: message.token });
        if (stolen.error) { const response = { type: 'action_error', requestId: message.requestId, message: stolen.error }; safeSend(socket, response); finishAction(tracked.key, [response]); return; }
        if (stolen.pending) {
          const response = { type: 'theft_pending', requestId: message.requestId, farmId, tileKey, token: stolen.pending.token, durationMs: stolen.pending.readyAt - Date.now() };
          safeSend(socket, response); finishAction(tracked.key, [response]); return;
        }
        const player = await loadPlayer(client.playerId);
        const response = { type: 'account_state', requestId: message.requestId, progress: player.progress, result: { stolenAmount: stolen.amount } };
        const update = { type: 'farm_update', requestId: message.requestId, farmId, tileKey, action: 'steal', crop: stolen.tileData.crop, tileData: stolen.tileData, byPlayer: client.name, byPlayerId: client.playerId };
        safeSend(socket, response); broadcastFarmUpdate(client, update); finishAction(tracked.key, [response, update]);
        for (const other of clients.values()) if (other.playerId === assignment.playerId) safeSend(other.socket, { type: 'action_error', message: `${client.name} đã lấy ${stolen.amount} nông sản trong vườn khi cổng mở.` });
        return;
      }
      const result = await farmAction(client.playerId, targetVillage.villageId, client.farmId, { farmId, tileKey, action, crop, wateredAt, plantedAt });
      if (result.error) {
        const errorResponse = { type: 'action_error', requestId: message.requestId, message: result.error };
        const syncResponse = { type: 'farm_sync', farms: await loadFarms(targetVillage.villageId, [farmId]) };
        safeSend(socket, errorResponse); safeSend(socket, syncResponse); finishAction(tracked.key, [errorResponse, syncResponse]); return;
      }
      const accountResponse = { type: 'account_state', requestId: message.requestId, progress: result.player.progress, livestock: result.player.livestock };
      const farmResponse = {
        type: 'farm_update',
        requestId: message.requestId,
        farmId,
        tileKey,
        action,
        crop,
        tileData: result.tileData,
        byPlayer: client.name,
        byPlayerId: client.playerId
      };
      safeSend(socket, accountResponse);
      broadcastFarmUpdate(client, farmResponse);
      finishAction(tracked.key, [accountResponse, farmResponse]);
    }
    if (message.type === 'game_action') {
      const tracked = beginAction(client, message.requestId);
      if (tracked.duplicate) return;
      if (message.action === 'farm_gate') {
        const farmId = String(message.payload?.farmId || '');
        const village = await villageForFarm(farmId);
        const assignment = village && await loadFarmAssignment(village.villageId, farmId);
        const result = assignment ? await farmSecurity.toggle(assignment, farmId, client.playerId, message.payload?.open, client, [...clients.values()]) : { error: 'Lô đất chưa có chủ.' };
        const response = result.error ? { type: 'action_error', requestId: message.requestId, message: result.error } : { type: 'farm_gate', requestId: message.requestId, ...result };
        safeSend(socket, response); finishAction(tracked.key, [response]);
        if (!result.error) channelPlayers(client.channelId).filter(other => other !== client).forEach(other => safeSend(other.socket, { type: 'farm_gate', ...result }));
        return;
      }
      if (message.action === 'casino' || message.action === 'casino_bet') {
        if (client.venue !== 'casino') {
          const response = { type: 'action_error', requestId: message.requestId, message: 'Hãy vào hội quán trò chơi để đặt cược.' };
          safeSend(socket, response); finishAction(tracked.key, [response]); return;
        }
        if (message.action === 'casino_bet') throw new Error('Client casino cũ: tải lại game để vào hệ thống bàn mới.');
        const response = { ...(await casinoManager.action(client, message.payload || {}, message.requestId)), requestId: message.requestId };
        safeSend(socket, response); finishAction(tracked.key, [response]);
        broadcastCasinoState(); return;
      }
      if (['steal_livestock_start','steal_livestock_finish'].includes(message.action)) {
        const {farmId,animalId,token}=message.payload||{};
        const village=typeof farmId==='string'?await villageForFarm(farmId):null;
        const assignment=village&&village.villageId===client.villageId?await loadFarmAssignment(village.villageId,farmId):null;
        if(!assignment){const response={type:'action_error',requestId:message.requestId,message:'Hãy đến nông trại có chủ trong làng của bạn.'};safeSend(socket,response);finishAction(tracked.key,[response]);return;}
        const result=await farmSecurity.stealLivestock({assignment,farmId,animalId,playerId:client.playerId,position:client,phase:message.action==='steal_livestock_start'?'start':'finish',token});
        if(result.error){const response={type:'action_error',requestId:message.requestId,message:result.error};safeSend(socket,response);finishAction(tracked.key,[response]);return;}
        if(result.pending){const response={type:'theft_pending',kind:'livestock',requestId:message.requestId,farmId,animalId,token:result.pending.token,durationMs:Math.max(0,result.pending.readyAt-Date.now())};safeSend(socket,response);finishAction(tracked.key,[response]);return;}
        const thief=await loadPlayer(client.playerId),owner=await loadPlayer(result.ownerId);
        const response={type:'account_state',requestId:message.requestId,progress:thief.progress,livestock:thief.livestock,result:{livestockAction:'steal_livestock',stolenAmount:result.amount}};
        safeSend(socket,response);finishAction(tracked.key,[response]);
        for(const other of clients.values())if(other.playerId===result.ownerId)safeSend(other.socket,{type:'account_state',progress:owner.progress,livestock:owner.livestock,result:{livestockTheft:{product:result.product,amount:result.amount}}});
        await refreshPublicFarms(client.channelId);return;
      }
      if (message.action === 'buy_land') {
        const bought = await purchaseFarm(client.playerId, String(message.payload?.farmId || ''));
        if (bought.error) {
          const response = { type: 'action_error', requestId: message.requestId, message: bought.error };
          safeSend(socket, response); finishAction(tracked.key, [response]); return;
        }
        const assignment = bought.assignment;
        client.farmId = assignment.farmId; client.villageId = assignment.villageId;
        farmSecurity.gates.set(`${assignment.villageId}:${assignment.lot}`, farmGateOpen(assignment));
        const player = await loadPlayer(client.playerId);
        const response = { type: 'account_state', requestId: message.requestId, progress: player.progress, livestock: player.livestock, result: { landPurchase: { farmId: assignment.farmId, villageId: assignment.villageId, villageName: assignment.villageName, lot: assignment.lot, farmConfig: assignment.farmConfig } } };
        await savePosition(client.playerId, { x: client.x, y: client.y, z: client.z, rotation: client.rotation, venue: client.venue, villageId: client.villageId, layoutVersion: MAP_LAYOUT_VERSION });
        safeSend(socket, response); finishAction(tracked.key, [response]);
        await refreshPublicFarms(client.channelId); broadcastPresence(client.channelId); return;
      }
      if (!client.farmId && ['claim_seeds', 'unlock_plot', 'upgrade_land', 'upgrade_barn', 'upgrade_home', 'build_pen', 'sell_animal', 'buy_animal', 'retire_animal', 'feed_animals', 'collect_animals'].includes(message.action)) {
        const response = { type: 'action_error', requestId: message.requestId, message: 'Bạn cần mua lô đất trước khi sử dụng tính năng nông trại.' };
        safeSend(socket, response); finishAction(tracked.key, [response]); return;
      }
      const result = await performAction(client.playerId, String(message.action || ''), message.payload || {}, { x: client.x, z: client.z, venue: client.venue, farmId: client.farmId, villageId: client.villageId, telemetrySessionId: client.telemetrySessionId });
      if (result.error) { const response = { type: 'action_error', requestId: message.requestId, message: result.error }; safeSend(socket, response); finishAction(tracked.key, [response]); return; }
      fishingTelemetry.observe(client.telemetrySessionId, client, { meaningful: true });
      client.name = result.player.name;
      client.fishing = fishingPresence(result.player.progress.fishing?.pending);
      client.outfit = result.player.progress.outfit;
      client.vehicle = result.player.progress.vehicle;
      client.homeTier = result.player.progress.homeTier;
      if (result.player.progress.customization) {
        client.customization = result.player.progress.customization;
      }
      const response = { type: 'account_state', requestId: message.requestId, progress: result.player.progress, livestock: result.player.livestock, result: result.result };
      safeSend(socket, response);
      finishAction(tracked.key, [response]);
      if (message.action === 'profile_update') {
        safeSend(socket, { type: 'profile_state', profile: await loadPublicPlayerProfile(client.playerId) });
        broadcastPresence(client.channelId);
      }
      if (['harvest_apples', 'unlock_plot', 'upgrade_land', 'character_create', 'build_pen', 'buy_animal', 'retire_animal', 'sell_animal', 'feed_animals', 'collect_animals', 'upgrade_barn', 'upgrade_home', 'buy_outfit', 'fashion_save_customization'].includes(message.action)) {
        await refreshPublicFarms(client.channelId);
      }
    }
    if (message.type === 'get_social_state') {
      safeSend(socket, { type: 'social_state', ...(await loadSocialState(client.playerId)) });
      return;
    }
    if (message.type === 'get_profile') {
      const targetId = typeof message.playerId === 'string' ? message.playerId : client.playerId;
      safeSend(socket, { type: 'profile_state', profile: await loadPublicPlayerProfile(targetId), requestedId: targetId });
      return;
    }
    if (message.type === 'social_action') {
      const result = await updateFriend(client.playerId, message.friendId, message.action !== 'remove_friend');
      if (result.error) safeSend(socket, { type: 'action_error', message: result.error });
      else safeSend(socket, { type: 'social_state', ...result });
    }
    if (message.type === 'mailbox_heart') {
      const { farmId } = message;
      if (!farmId) return;
      const village = await villageForFarm(farmId);
      if (!village || !(await isAssignedFarm(village.villageId, farmId))) return;
      const liked = await likeFarm(client.playerId, village.villageId, farmId);
      if (liked.error || !liked.added) return;
      broadcastToChannel(client.channelId, {
        type: 'mailbox_notice',
        farmId,
        fromName: client.name,
        fromPlayerId: client.playerId,
        likes: liked.count,
      });
    }
    if (message.type === 'emote') {
      const { emote } = message;
      if (!emote) return;
      console.log(`[EMOTE] ${client.name} (${client.playerId}): ${emote}`);
      broadcastToChannel(client.channelId, {
        type: 'player_emote',
        playerId: client.playerId,
        fromName: client.name,
        emote: String(emote).slice(0, 16),
      });
    }
    if (message.type === 'chat') {
      const text = String(message.text || '').trim().slice(0, 100);
      const emote = message.emote ? String(message.emote).slice(0, 16) : null;
      if (!text && !emote) return;
      console.log(`[CHAT] ${client.name} (${client.playerId}): "${text}" (emote: ${emote})`);
      broadcastToChannel(client.channelId, {
        type: 'player_chat',
        playerId: client.playerId,
        fromName: client.name,
        text,
        emote,
      });
    }
    } catch (error) {
      recentActions.delete(actionCacheKey(client, message?.requestId));
      console.error('WebSocket action failed:', error);
      safeSend(socket, { type: 'action_error', requestId: message?.requestId, message: error instanceof CasinoActionError ? error.message : 'Chưa thể thực hiện. Hãy thử lại sau nhé.' });
    }
  });
  socket.on('close', () => {
    clientSessionTokens.delete(client);
    fishingTelemetry?.endSession(client.telemetrySessionId, client);
    if (![...clients.values()].some(other => other !== client && other.playerId === client.playerId && other.venue === 'casino')) casinoManager?.disconnect(client.playerId).then(broadcastCasinoState).catch(console.error);
    const channelId = client.channelId;
    if (clients.has(socket)) savePosition(client.playerId, { x: client.x, y: client.y, z: client.z, rotation: client.rotation, venue: client.venue, villageId: client.villageId, layoutVersion: MAP_LAYOUT_VERSION }).catch(console.error);
    clients.delete(socket);
    broadcastPresence(channelId);
  });
});

setInterval(() => {
  const channels = new Set([...clients.values()].map(client => client.channelId));
  channels.forEach(broadcastPresence);
}, TICK_MS);

setInterval(() => {
  for (const client of clients.values()) fishingTelemetry?.observe(client.telemetrySessionId, client);
  fishingTelemetry?.flush().catch(error => console.error('Fishing telemetry projection failed:', error.message));
}, 1000);

let casinoTickRunning = false;
setInterval(async () => {
  if (casinoTickRunning) return;
  casinoTickRunning = true;
  try {
    const changed = casinoManager ? await casinoManager.tick() : false;
    if (changed) broadcastCasinoState();
  } catch (error) { console.error('Casino round settlement failed:', error); }
  finally { casinoTickRunning = false; }
}, 500);

setInterval(() => {
  const cutoff = Date.now() - ACTION_CACHE_TTL;
  for (const [id, pending] of farmSecurity?.pending || []) if (pending.expiresAt < Date.now()) farmSecurity.pending.delete(id);
  recentActions.forEach((value, key) => { if (value.createdAt < cutoff) recentActions.delete(key); });
}, 60_000).unref();

setInterval(() => {
  const cutoff = Date.now() - AUTH_WINDOW_MS;
  authAttempts.forEach((times, address) => {
    const active = times.filter(time => time >= cutoff);
    if (active.length) authAttempts.set(address, active);
    else authAttempts.delete(address);
  });
}, 60_000).unref();

await initGameStore();
casinoManager = new CasinoRoomManager(getGameStoreDatabase(), { onWallet: async (playerId, receipt) => {
  const player = await loadPlayer(playerId);
  for (const client of clients.values()) if (client.playerId === playerId && player) safeSend(client.socket, {
    type: 'account_state', progress: player.progress,
    result: receipt.mode === 'settle' ? { casinoSettlement: { reward: receipt.reward, amount: receipt.stake, roundId: receipt.roundId } } : { casinoBet: { amount: receipt.stake } },
  });
} });
await casinoManager.init();
await initVillageRegistry();
await initFarmSecurity();
httpServer.listen(PORT, '0.0.0.0', () => console.log(`Farm multiplayer listening on http://localhost:${PORT} · MongoDB connected`));
