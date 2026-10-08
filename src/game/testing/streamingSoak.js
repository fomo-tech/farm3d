import { FarmWorld } from '../world/FarmWorld.js';
import { WORLD_LAYOUT } from '../world/worldLayout.js';
import { auditCoastalMeshes } from './auditCoastalMeshes.js';

const status = document.querySelector('#status');
const metrics = document.querySelector('#metrics');
const start = document.querySelector('#start');
const canvas = document.querySelector('#game');
const params = new URLSearchParams(location.search);
// Clean scene captures for art review, using the same world and mobile profile.
if (params.get('view') === 'scene') document.querySelector('aside').hidden = true;
const report = { revision: 'streaming-audit-v2', mode: 'isolated-world', startedAt: null, durationSeconds: 900,
  samples: [], failures: [], transitions: 0, cycles: 0, ready: false, completed: false, gaps: [], longTasks: [] };
let running = false;
report.durationSeconds = Math.max(60, Math.min(1800, Number(params.get('seconds')) || 900));
start.textContent = `Start ${report.durationSeconds / 60}-minute test`;
let startedAt = 0;
let segment = -1;
let lastFrame = 0;
let lastSample = 0;
let maxGap = 0;
// Real farm locations, including neighbouring and distant grid cells. Revisit
// the same route to expose unbounded cache growth and stale streaming jobs.
const farms = WORLD_LAYOUT.farms;
const focusX = Number(params.get('x'));
const focusZ = Number(params.get('z'));
const focus = params.has('x') && params.has('z') && Number.isFinite(focusX) && Number.isFinite(focusZ)
  ? { x: focusX, z: focusZ } : WORLD_LAYOUT.spawn;
report.focus = focus;
report.orbitCamera = params.get('orbit') === '1';
let initialAlpha = null;
const route = [focus,
  ...[0, 8, 16, 32, 64, 96, 128, 160, 200, 240].map(index => {
    const farm = farms[Math.min(index, farms.length - 1)];
    return { x: farm.x, z: farm.z - 14 };
  }), focus];

const observer = new PerformanceObserver(list => {
  if (!running) return;
  for (const entry of list.getEntries()) if (entry.duration > 50) {
    report.longTasks.push({ start: Math.round(entry.startTime - startedAt), duration: Math.round(entry.duration),
      attribution: entry.attribution?.map(item => ({ name: item.name, src: item.containerSrc })) });
  }
});
observer.observe({ type: 'longtask', buffered: false });

const bootStarted=performance.now();
let world;
let auditBootChannel=null;
world = new FarmWorld(canvas, text => { status.textContent = text; }, {
  initialLocation: { ...focus, y: 0 },
  graphicsQuality: params.get('quality'),
  getPlayerName: () => 'Streaming Test', getPlayerFarmId: () => farms[0].id,
  getUnlockedPlots: () => 12, getCrop: () => 'carrot',
  onBootProgress: progress => { metrics.textContent=JSON.stringify({phase:progress.phase,percentage:progress.percentage,elapsedMs:Math.round(performance.now()-bootStarted)},null,2); },
  onReady: () => {
    metrics.textContent=JSON.stringify({playableMs:Math.round(performance.now()-bootStarted),mobile:world.isMobile,construction:world.scheduler.getStats()},null,2);
    world.applyPublicFarmScope([0, 8, 16, 32, 64, 96, 128, 160, 200, 240].map(index => ({
      farmId: farms[index].id, userName: `Local Test ${index}`,
      homeTier: params.get('tier2') === '1' && [8, 32].includes(index) ? 2 : 1, barnLevel: 1,
    })), {});
    report.ready = true; start.disabled = false;
    window.__farmDebug?.ready();
    status.textContent = 'World ready. Full farms, houses, animals and collision; no account writes.';
  },
  onFatalError: message => { report.failures.push(message); status.textContent = message; },
});
// Compare the former 3ms boot budget in this isolated harness only.
if(params.get('bootBudget')==='3'){const update=world.scheduler.update.bind(world.scheduler);world.scheduler.update=budget=>update(!world.bootReady?3:budget);}

// Geometry audit setup only: build the identical world with short cooperative
// tasks even when the browser throttles RAF. Never use this mode for FPS claims.
if(params.get('audit')==='1') {
  report.mode='coastal-geometry-audit';
  report.auditBootPump=true;
  auditBootChannel=new MessageChannel();
  auditBootChannel.port1.onmessage=()=>{
    if(report.ready || world.renderFailure || world.scene.isDisposed) {
      auditBootChannel.port1.close();auditBootChannel.port2.close();return;
    }
    world.scheduler.update(4);
    auditBootChannel.port2.postMessage(0);
  };
  auditBootChannel.port2.postMessage(0);
}

start.onclick = () => {
  running = true; startedAt = performance.now(); lastFrame = 0; segment = -1;
  report.startedAt = new Date().toISOString(); start.disabled = true;
  requestAnimationFrame(tick);
};

function tick(now) {
  if (!running) return;
  const elapsed = now - startedAt;
  if (report.orbitCamera) {
    initialAlpha ??= world.scene.activeCamera.alpha;
    world.scene.activeCamera.alpha = initialAlpha + elapsed / 2000;
  }
  if (lastFrame && document.visibilityState === 'visible') {
    const gap = now - lastFrame;
    maxGap = Math.max(maxGap, gap);
    if (gap > 1000) report.gaps.push({ elapsed: Math.round(elapsed), duration: Math.round(gap) });
  }
  lastFrame = now;
  // Deterministic teleports exercise cancellation and cache, followed by normal
  // movement via Player.moveTo with the production collision system.
  const nextSegment = Math.floor(elapsed / 6000);
  if (nextSegment !== segment) {
    segment = nextSegment;
    const point = route[segment % route.length];
    world.player.stop(); world.player.root.position.set(point.x, 0, point.z);
    world.player.moveTo({ x: point.x + 4, y: 0, z: point.z });
    report.transitions++;
    report.cycles = Math.floor(report.transitions / route.length);
  }
  if (now - lastSample >= 1000) {
    lastSample = now;
    // Match App's world-clock updates too: without this, a soak silently misses
    // the day/night image-processing invalidation that froze the real game.
    window.__farmDebug?.measure('soak: atmosphere.setTime', () => world.setClock(Math.floor(Date.now() / 1000)));
    const debug = world.getDebugState();
    report.samples.push({ elapsedSeconds: Math.round(elapsed / 1000), ...debug,
      heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
      maxGapMs: Math.round(maxGap), visible: document.visibilityState });
    if (report.samples.length > 1000) report.samples.shift();
    metrics.textContent = JSON.stringify({ seconds: Math.round(elapsed / 1000), cycles: report.cycles,
      transitions: report.transitions, fps: debug.fps, meshes: debug.meshes,
      cache: debug.farmCache, scheduler: debug.streamingScheduler,
      upgradedHomesReady: debug.upgradedHomesReady,
      heapMB: report.samples.at(-1).heapMB, gapsOver1000: report.gaps.length,
      maxGapMs: Math.round(maxGap), longTasks: report.longTasks.length }, null, 2);
  }
  if (elapsed >= report.durationSeconds * 1000) {
    running = false; report.completed = true;
    report.runtime = window.__farmDebug?.getReport();
    status.textContent = `Completed: ${report.cycles} route cycles, ${report.gaps.length} gaps over 1s. Download report for evidence.`;
  } else requestAnimationFrame(tick);
}

document.querySelector('#export').onclick = () => {
  report.runtime = window.__farmDebug?.getReport();
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'streaming-soak-report.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
document.querySelector('#show-report').onclick = () => {
  const groups = new Map();
  for (const mesh of world.scene.meshes) {
    let root = mesh;
    while (root.parent) root = root.parent;
    const entry = groups.get(root.name) || { name: root.name, meshes: 0, vertices: 0 };
    entry.meshes++; entry.vertices += mesh.getTotalVertices(); groups.set(root.name, entry);
  }
  report.resources = { roots: [...groups.values()].sort((a,b) => b.meshes-a.meshes).slice(0,30),
    textures: world.scene.textures.map(t => ({name:t.name, ...t.getSize(), mipmaps:!!t.getInternalTexture()?.generateMipMaps}))
      .sort((a,b) => b.width*b.height-a.width*a.height) };
  report.coastalAudit = auditCoastalMeshes(world.scene);
  report.runtime = window.__farmDebug?.getReport();
  const output = document.querySelector('#report');
  output.hidden = false;
  output.textContent = JSON.stringify(report);
};
window.addEventListener('pagehide', () => {
  auditBootChannel?.port1.close();auditBootChannel?.port2.close();
  observer.disconnect(); world.dispose();
});
