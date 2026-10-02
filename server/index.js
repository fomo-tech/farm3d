import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { claimFarm, getAssignment, initVillageRegistry, listVillageAssignments, listVillages, positionForLot, villageChannel } from './VillageRegistry.js';
import { authenticate, farmAction, initGameStore, likeFarm, loadFarms, loadPublicFarmProfiles, loadSocialState, performAction, savePosition, updateFriend } from './GameStore.js';

const PORT = Number(process.env.MULTIPLAYER_PORT || 8787);
const TICK_MS = 100;
const PLAYER_VIEW_RADIUS = 240;
const FARM_VIEW_RADIUS = 115;
const MAP_LAYOUT_VERSION = 2;
const clients = new Map();

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
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

function channelPlayers(channelId) {
  return [...clients.values()].filter(client => client.channelId === channelId);
}

function broadcastPresence(channelId) {
  const channel = channelPlayers(channelId);
  channel.forEach(client => {
    const players = channel
      .filter(other => other.venue === client.venue && (other === client || Math.hypot(other.x - client.x, other.z - client.z) <= PLAYER_VIEW_RADIUS))
      .map(({ socket, lastSeen, lastPersisted, messages, visibleFarmIds, lastFarmScopeAt, ...player }) => player);
    safeSend(client.socket, { type: 'world_state', serverTime: Date.now(), players });
  });
}

async function publicFarmScope(client, force = false) {
  if (!client.villageId || (!force && Date.now() - client.lastFarmScopeAt < 1000)) return;
  client.lastFarmScopeAt = Date.now();
  const assignments = await listVillageAssignments(client.villageId);
  const visible = assignments.filter(item => {
    const position = positionForLot(item.lot);
    return item.playerId === client.playerId || Math.hypot(position.x - client.x, position.z - client.z) <= FARM_VIEW_RADIUS;
  });
  const farmIds = visible.map(item => `farm_${String(item.lot).padStart(6, '0')}`);
  const scopeKey = farmIds.slice().sort().join(',');
  if (!force && scopeKey === client.farmScopeKey) return;
  client.farmScopeKey = scopeKey;
  client.visibleFarmIds = new Set(farmIds);
  const profiles = await loadPublicFarmProfiles(visible.map(item => item.playerId));
  const profileById = new Map(profiles.map(profile => [profile.playerId, profile]));
  const farms = visible.map(item => ({
    farmId: `farm_${String(item.lot).padStart(6, '0')}`,
    lot: item.lot,
    ...positionForLot(item.lot),
    ...profileById.get(item.playerId),
    online: [...clients.values()].some(other => other.playerId === item.playerId),
  }));
  safeSend(client.socket, { type: 'farm_scope', farms, crops: await loadFarms(client.villageId, farmIds) });
}

function broadcastFarmUpdate(actor, payload) {
  channelPlayers(actor.channelId).forEach(client => {
    if (client.socket !== actor.socket && client.visibleFarmIds?.has(payload.farmId)) safeSend(client.socket, payload);
  });
}

async function refreshPublicFarms(channelId) {
  await Promise.all(channelPlayers(channelId).map(client => publicFarmScope(client, true)));
}

function broadcastToChannel(channelId, payload, excludeSocket = null) {
  channelPlayers(channelId).forEach(client => {
    if (client.socket !== excludeSocket) {
      safeSend(client.socket, payload);
    }
  });
}

wss.on('connection', socket => {
  const client = { socket, playerId: null, name: 'Nông dân', channelId: null, farmId: null, villageId: null, x: -45, y: 0, z: 102, rotation: 0, venue: null, lastSeen: Date.now(), lastPersisted: 0, lastFarmScopeAt: 0, farmScopeKey: '', visibleFarmIds: new Set(), messages: [] };
  socket.on('message', async raw => {
    try {
    if (String(raw).length > 16_384) return socket.close(1009, 'Message too large');
    const now = Date.now();
    client.messages = client.messages.filter(time => now - time < 1000);
    if (client.messages.length >= 40) return;
    client.messages.push(now);
    let message;
    try { message = JSON.parse(String(raw)); } catch { return; }
    if (message.type === 'join') {
      client.playerId = String(message.playerId || '').slice(0, 64);
      if (!client.playerId) return socket.close(1008, 'Missing player id');
      const account = await authenticate(client.playerId, String(message.sessionToken || ''), message.name);
      if (account.error) { safeSend(socket, { type: 'auth_error', message: account.error }); return socket.close(1008, 'Invalid session'); }
      client.name = account.name;
      safeSend(socket, { type: 'account_state', sessionToken: account.token, progress: account.progress, livestock: account.livestock, position: account.position?.layoutVersion === MAP_LAYOUT_VERSION ? account.position : null });
      safeSend(socket, { type: 'village_list', villages: await listVillages() });
      const existing = await getAssignment(client.playerId);
      if (!existing && !message.villageId) {
        safeSend(socket, { type: 'village_required', villages: await listVillages() });
        return;
      }
      const assignedLot = await claimFarm(client.playerId, existing?.villageId || String(message.villageId || ''));
      if (assignedLot.error) {
        safeSend(socket, { type: 'village_error', message: assignedLot.error, villages: await listVillages() });
        return;
      }

      client.farmId = assignedLot.farmId;
      client.villageId = assignedLot.villageId;
      client.channelId = villageChannel(assignedLot.villageId);
      client.x = assignedLot.spawn.x;
      client.y = assignedLot.spawn.y;
      client.z = assignedLot.spawn.z;
      clients.set(socket, client);

      if (account.position && account.position.villageId === assignedLot.villageId && account.position.layoutVersion === MAP_LAYOUT_VERSION) {
        client.x = Number(account.position.x) || client.x;
        client.y = Number(account.position.y) || 0;
        client.z = Number(account.position.z) || client.z;
        client.rotation = Number(account.position.rotation) || 0;
        client.venue = account.position.venue || null;
      }

      safeSend(socket, {
        type: 'welcome',
        playerId: client.playerId,
        channelId: client.channelId,
        villageId: assignedLot.villageId,
        villageName: assignedLot.villageName,
        lot: assignedLot.lot,
        farmId: client.farmId,
        spawn: assignedLot.spawn,
        tickMs: TICK_MS,
        layoutVersion: MAP_LAYOUT_VERSION
      });
      safeSend(socket, { type: 'village_list', villages: await listVillages() });
      
      await refreshPublicFarms(client.channelId);
      safeSend(socket, { type: 'social_state', ...(await loadSocialState(client.playerId)) });
      
      broadcastPresence(client.channelId);
      return;
    }
    if (!client.playerId) return;
    if (message.type === 'move') {
      const x = Number(message.x); const y = Number(message.y || 0); const z = Number(message.z); const rotation = Number(message.rotation);
      if (![x, y, z, rotation].every(Number.isFinite) || Math.abs(x) > 10_000_000 || Math.abs(z) > 10_000_000 || y < 0 || y > 40) return;
      const elapsed = Math.max(.1, (Date.now() - client.lastSeen) / 1000);
      const distance = Math.hypot(x - client.x, z - client.z);
      if (distance > 20 + elapsed * 12) return;
      client.x = x; client.y = y; client.z = z; client.rotation = rotation; client.venue = message.venue || null; client.lastSeen = Date.now();
      if (Date.now() - client.lastPersisted > 2000) {
        client.lastPersisted = Date.now();
        savePosition(client.playerId, { x, y, z, rotation, venue: client.venue, villageId: client.villageId, layoutVersion: MAP_LAYOUT_VERSION });
      }
      await publicFarmScope(client);
    }
    if (message.type === 'travel') {
      const x = Number(message.x); const z = Number(message.z);
      if (Number.isFinite(x) && Number.isFinite(z) && Math.abs(x) <= 10_000_000 && Math.abs(z) <= 10_000_000) {
        const ownFarm = positionForLot(Number(client.farmId?.slice(-6)) || 1);
        const allowed = [{ x: ownFarm.x + 6, z: ownFarm.z - 4 }, { x: 0, z: 18 }, { x: 126, z: 2 }, { x: 0, z: 320 }].some(point => Math.hypot(x - point.x, z - point.z) < 12);
        if (!allowed) return;
        client.x = x; client.y = Number(message.y || 0); client.z = z; client.venue = message.venue || null; client.lastSeen = Date.now();
        savePosition(client.playerId, { x: client.x, y: client.y, z: client.z, rotation: client.rotation, venue: client.venue, villageId: client.villageId, layoutVersion: MAP_LAYOUT_VERSION });
      }
    }
    if (message.type === 'farm_action') {
      const { farmId, tileKey, action, crop, wateredAt, plantedAt } = message;
      if (!farmId || !tileKey || !action) return;
      const result = await farmAction(client.playerId, client.villageId, client.farmId, { farmId, tileKey, action, crop, wateredAt, plantedAt });
      if (result.error) { safeSend(socket, { type: 'action_error', message: result.error }); safeSend(socket, { type: 'farm_sync', farms: await loadFarms(client.villageId) }); return; }
      safeSend(socket, { type: 'account_state', progress: result.player.progress, livestock: result.player.livestock });

      broadcastFarmUpdate(client, {
        type: 'farm_update',
        farmId,
        tileKey,
        action,
        crop,
        tileData: result.tileData,
        byPlayer: client.name,
        byPlayerId: client.playerId
      });
    }
    if (message.type === 'game_action') {
      const result = await performAction(client.playerId, String(message.action || ''), message.payload || {});
      if (result.error) { safeSend(socket, { type: 'action_error', requestId: message.requestId, message: result.error }); return; }
      client.name = result.player.name;
      client.outfit = result.player.progress.outfit;
      client.vehicle = result.player.progress.vehicle;
      client.homeTier = result.player.progress.homeTier;
      safeSend(socket, { type: 'account_state', requestId: message.requestId, progress: result.player.progress, livestock: result.player.livestock, result: result.result });
      if (['character_create', 'feed_animals', 'collect_animals', 'upgrade_barn', 'upgrade_home', 'buy_outfit'].includes(message.action)) {
        await refreshPublicFarms(client.channelId);
      }
    }
    if (message.type === 'social_action') {
      const result = await updateFriend(client.playerId, message.friendId, message.action !== 'remove_friend');
      if (result.error) safeSend(socket, { type: 'action_error', message: result.error });
      else safeSend(socket, { type: 'social_state', ...result });
    }
    if (message.type === 'mailbox_heart') {
      const { farmId } = message;
      if (!farmId) return;
      const liked = await likeFarm(client.playerId, client.villageId, farmId);
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
      broadcastToChannel(client.channelId, {
        type: 'player_emote',
        playerId: client.playerId,
        fromName: client.name,
        emote: String(emote).slice(0, 16),
      });
    }
    } catch (error) {
      console.error('WebSocket action failed:', error);
      safeSend(socket, { type: 'action_error', message: 'Server không thể xử lý yêu cầu.' });
    }
  });
  socket.on('close', () => {
    const channelId = client.channelId;
    clients.delete(socket);
    broadcastPresence(channelId);
  });
});

setInterval(() => {
  const channels = new Set([...clients.values()].map(client => client.channelId));
  channels.forEach(broadcastPresence);
}, TICK_MS);

await initGameStore();
await initVillageRegistry();
httpServer.listen(PORT, '0.0.0.0', () => console.log(`Farm multiplayer listening on http://localhost:${PORT} · MongoDB connected`));
