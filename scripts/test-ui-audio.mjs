import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { farmAudio } from '../src/game/audio/FarmAudioSystem.js';

globalThis.window = {};
assert.doesNotThrow(() => farmAudio.playPop(), 'Unsupported Web Audio must be safe');
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
const source = await readFile(new URL('../src/components/HudContextAction.jsx', import.meta.url), 'utf8');
assert.match(source, /try \{ farmAudio.playPop\(\); \}/);
assert.match(source, /action.onClick\?\.\(e\)/);
console.log('PASS: UI pop exists, audio-unavailable/mute safe, nodes released, gameplay action protected');
