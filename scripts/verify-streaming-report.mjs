import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = process.argv[2];
if (!path) throw new Error('Usage: npm run test:streaming-report -- <report.json>');
const report = JSON.parse(await readFile(path, 'utf8'));
const samples = report.samples || [];
assert.equal(report.ready, true, 'world must initialize');
assert.equal(report.completed, true, 'do not accept an unfinished test');
assert.ok(samples.at(-1)?.elapsedSeconds >= 899, 'require a full 15-minute run');
assert.ok(report.cycles >= 10, 'require ten repeat route cycles');
assert.equal(report.failures.length, 0, 'no runtime failures');
const fatalTypes = /^(?:BOOT TIMEOUT|JAVASCRIPT ERROR|UNHANDLED PROMISE|WORLD INITIALIZATION|WORLD RENDER|WEBGL|FATAL GAME ERROR|REACT RENDER ERROR|STREAM JOB FAILED)/;
assert.ok(!report.runtime?.entries?.some(item => fatalTypes.test(item.type)), 'no blocking diagnostics, including harness boot warnings');
assert.equal(report.gaps.length, 0, 'no visible frame gaps over one second');
assert.ok(!report.longTasks.some(task => task.duration >= 1000), 'no CPU task over one second');
const warmed = samples.filter(sample => sample.elapsedSeconds >= 120);
assert.ok(warmed.length > 600, 'enough measurements after warmup');
assert.ok(warmed.every(sample => sample.visible === 'visible'), 'background-throttled tests are not valid');
const fps = warmed.map(sample => sample.fps).sort((a, b) => a - b);
const p10 = fps[Math.floor(fps.length * 0.1)];
assert.ok(p10 >= 30, `10th percentile FPS ${p10} is below 30`);
assert.ok(warmed.every(sample => !sample.streamingScheduler?.overruns), 'no scheduled step over 50ms');
const meshCounts = warmed.map(sample => sample.meshes);
const middle = warmed.filter(sample => sample.elapsedSeconds >= 300 && sample.elapsedSeconds < 450);
const late = warmed.filter(sample => sample.elapsedSeconds >= 750);
const peak = rows => Math.max(...rows.map(sample => sample.meshes));
assert.ok(peak(late) <= peak(middle) * 1.2, 'mesh count must not grow unbounded across repeat cycles');
const heap = warmed.map(sample => sample.heapMB).filter(value => value !== null);
console.log(JSON.stringify({ status: 'PASS', mode: report.mode, seconds: samples.at(-1).elapsedSeconds,
  cycles: report.cycles, transitions: report.transitions, fpsP10: p10,
  meshRange: [Math.min(...meshCounts), Math.max(...meshCounts)],
  heapRangeMB: heap.length ? [Math.min(...heap), Math.max(...heap)] : null,
  maxScheduledStepMs: Math.max(...warmed.map(sample => sample.streamingScheduler?.maxStepMs || 0)),
  maxFrameGapMs: Math.max(...warmed.map(sample => sample.maxGapMs)),
  longTasksOver50ms: report.longTasks.length,
  limitation: report.mode === 'isolated-world' ? 'Does not validate React HUD, live networking or multiplayer rendering.' : null,
}, null, 2));
