import WebSocket from 'ws';

const url = process.env.MULTIPLAYER_URL || 'ws://127.0.0.1:8787';
const runId = Date.now().toString(36);

function join(playerId, profile = {}) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const messages = {};
    const timer = setTimeout(() => reject(new Error(`Timeout: ${playerId}`)), 5000);
    socket.on('open', () => socket.send(JSON.stringify({ type: 'join', playerId, name: playerId, ...profile })));
    socket.on('message', raw => {
      const message = JSON.parse(String(raw));
      messages[message.type] = message;
      if (messages.account_state && (messages.village_required || (messages.welcome && messages.farm_scope))) {
        clearTimeout(timer); resolve({ socket, messages });
      }
    });
    socket.on('error', reject);
  });
}

async function register(playerId) {
  const first = await join(playerId);
  const token = first.messages.account_state.sessionToken;
  const villageId = first.messages.village_required.villages[0].id;
  first.socket.close();
  return join(playerId, { sessionToken: token, villageId });
}

const first = await register(`smoke-a-${runId}`);
const second = await register(`smoke-b-${runId}`);
let latestScope = first.messages.farm_scope;
const state = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Không nhận được world state hai người chơi')), 5000);
  first.socket.on('message', raw => {
    const message = JSON.parse(String(raw));
    if (message.type === 'farm_scope') latestScope = message;
    if (message.type === 'world_state' && message.players.length >= 2) { clearTimeout(timer); resolve(message); }
  });
  setTimeout(() => first.socket.send(JSON.stringify({ type: 'move', x: -130, z: 42, rotation: 0 })), 1100);
  second.socket.send(JSON.stringify({ type: 'move', x: -120, z: 40, rotation: 1 }));
});

await new Promise(resolve => setTimeout(resolve, 1200));
const publicFarm = latestScope.farms.find(farm => farm.playerId === second.messages.welcome.playerId);
if (!publicFarm || 'coins' in publicFarm || 'inventory' in publicFarm || 'progress' in publicFarm || 'livestock' in publicFarm) {
  throw new Error(`Farm scope thiếu dữ liệu công khai hoặc làm lộ dữ liệu riêng: ${JSON.stringify(latestScope)}`);
}
console.log(JSON.stringify({ ok: true, database: 'mongodb', players: state.players.map(player => player.playerId), publicFarmFields: Object.keys(publicFarm).sort() }));
first.socket.close(); second.socket.close();
