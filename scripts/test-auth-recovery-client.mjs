import assert from 'node:assert/strict';
import { GameClient } from '../src/game/network/GameClient.js';
globalThis.window = { location: { protocol: 'http:', hostname: 'localhost' }, addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout, setInterval, clearInterval };
globalThis.document = { addEventListener() {}, removeEventListener() {}, visibilityState: 'visible' };
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });
class Socket {
  static OPEN = 1; static CONNECTING = 0;
  constructor() { this.readyState = 0; this.events = {}; }
  addEventListener(name, callback) { this.events[name] = callback; }
  send() {}
  close() { this.events.close?.({ code: 1008, reason: 'Invalid session' }); }
}
globalThis.WebSocket = Socket;
let authError = null;
const client = new GameClient({ onAuthError: message => { authError = message; } });
client.connect({ playerId: 'player_test_identity', sessionToken: 'expired' });
const socket = client.socket;
socket.events.message({ data: JSON.stringify({ type: 'auth_error', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' }) });
socket.close();
assert.ok(authError);
assert.equal(client.closed, true);
assert.equal(client.retry, null, 'Rejected credentials must not be retried forever');
client.disconnect();
console.log('PASS invalid-session callback and no reconnect loop');
