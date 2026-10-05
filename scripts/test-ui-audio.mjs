import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { farmAudio } from '../src/game/audio/FarmAudioSystem.js';

globalThis.window = {};
assert.doesNotThrow(() => farmAudio.playPop(), 'Unsupported Web Audio must be safe');
assert.doesNotThrow(() => farmAudio.playCoins(), 'Coin sound must tolerate unavailable Web Audio');
const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
for (const [, method] of appSource.matchAll(/farmAudio\.(\w+)\(/g)) {
  assert.equal(typeof farmAudio[method], 'function', `Missing audio API: ${method}`);
}
let starts = 0, stops = 0, disconnects = 0, ended;
const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
farmAudio.isInitialized = true;
farmAudio.ctx = {
  state: 'running', currentTime: 1,
  createOscillator: () => ({ frequency: param, connect() {}, disconnect() { disconnects++; },
    start() { starts++; }, stop(time) { stops++; assert.equal(time, 1.08); },
    set onended(fn) { ended = fn; } }),
  createGain: () => ({ gain: param, connect() {}, disconnect() { disconnects++; } }),
};
farmAudio.sfxGain = {};
farmAudio.playPop();
assert.equal(starts, 1); assert.equal(stops, 1);
ended(); assert.equal(disconnects, 2);
farmAudio.isMuted = true;
farmAudio.playPop(); assert.equal(starts, 1);
farmAudio.playCoins(); assert.equal(starts, 1);
farmAudio.isMuted = false;
const releases = [];
farmAudio.ctx.createOscillator = () => ({ frequency:param,connect(){},disconnect(){disconnects++;},
  start(){starts++;},stop(){stops++;},set onended(fn){releases.push(fn);} });
farmAudio.playCoins();
assert.equal(starts,4);assert.equal(stops,4);
releases.forEach(fn=>fn());assert.equal(disconnects,8);
farmAudio.ctx.createOscillator = () => { throw new Error('Audio device unavailable'); };
assert.doesNotThrow(()=>farmAudio.playCoins(), 'Audio failure must not block selling');
const source = await readFile(new URL('../src/components/HudContextAction.jsx', import.meta.url), 'utf8');
assert.match(source, /try \{ farmAudio.playPop\(\); \}/);
assert.match(source, /action.onClick\?\.\(e\)/);
console.log('PASS: UI pop exists, audio-unavailable/mute safe, nodes released, gameplay action protected');
