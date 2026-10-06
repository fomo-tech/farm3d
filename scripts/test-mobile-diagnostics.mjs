import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mobileDiagnosticsPlugin } from './mobileDiagnosticsPlugin.mjs';
let handler;
mobileDiagnosticsPlugin().configureServer({ middlewares: { use: (_, callback) => { handler = callback; } } });
function request(method, data = '', origin = 'http://localhost:4177') {
  const req = new EventEmitter(); req.method = method; req.headers = { host: 'localhost:4177', origin };
  const res = { statusCode: 200, setHeader() {}, end(body) { this.body = body; } };
  handler(req, res);
  if (method === 'POST') { req.emit('data', data); req.emit('end'); }
  return res;
}
assert.equal(request('POST', JSON.stringify({ fps: 25, playerId: 'must-not-be-stored', message: 'private', canvasX: 48,
  bootStageCode: 8, activeMeshes: 321, foliagePlacements: 654, ready: true })).statusCode, 200);
const saved = JSON.parse(request('GET').body)[0];
assert.equal(saved.fps, 25); assert.equal(saved.canvasX, 48);
assert.equal(saved.bootStageCode, 8); assert.equal(saved.activeMeshes, 321);
assert.equal(saved.foliagePlacements, 654); assert.equal(saved.ready, true);
assert.equal(saved.playerId, undefined); assert.equal(saved.message, undefined);
assert.equal(request('POST', '{}', 'https://unrelated.example').statusCode, 403);
assert.equal(request('POST', 'x'.repeat(4097)).statusCode, 413);
assert.equal(request('POST', '{').statusCode, 400);
for (let i = 0; i < 150; i++) request('POST', JSON.stringify({ fps: i }));
assert.equal(JSON.parse(request('GET').body).length, 120);
console.log('PASS: local diagnostic whitelist, payload limit, origin check and bounded history');
