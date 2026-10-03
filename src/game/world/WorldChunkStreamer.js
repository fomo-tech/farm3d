import { CHUNK_SIZE, chunkAt } from './WorldPartition.js';

const streamers = new WeakMap();

export class WorldChunkStreamer {
  constructor({ detailRadius = 2, keepRadius = 3, maxDetailed = 240 } = {}) {
    this.cellSize = CHUNK_SIZE;
    this.detailRadius = detailRadius;
    this.keepRadius = keepRadius;
    this.maxDetailed = maxDetailed;
    this.entries = new Map();
    this.loading = null;
    this.lastUpdate = 0;
    this.center = null;
  }

  register(id, x, z, handlers) {
    const cell = chunkAt(x, z);
    const entry = { id, x, z, cell, state: 'unloaded', lastUsed: 0, ...handlers };
    this.entries.set(id, entry);
    entry.showLod?.();
    return () => {
      entry.generation = (entry.generation || 0) + 1;
      entry.unload?.();
      this.entries.delete(id);
    };
  }

  update(position, forward = { x: 0, z: 0 }, now = performance.now()) {
    if (now - this.lastUpdate < 100) return;
    this.lastUpdate = now;
    const center = chunkAt(position.x, position.z);
    this.center = center;
    const queued = [];
    let detailed = 0;
    let unloaded = 0;
    for (const entry of this.entries.values()) {
      const distance = Math.max(Math.abs(entry.cell.x - center.x), Math.abs(entry.cell.z - center.z));
      if (entry.state === 'ready') detailed++;
      if (distance <= this.detailRadius) {
        entry.lastUsed = now;
        if (entry.state === 'unloaded') {
          const ahead = (entry.x - position.x) * forward.x + (entry.z - position.z) * forward.z;
          queued.push({ entry, score: distance * 100 - Math.min(50, ahead / this.cellSize) });
        }
      } else if (distance > this.keepRadius && entry.state === 'ready' && unloaded < 3) {
        entry.unload?.();
        entry.showLod?.();
        entry.state = 'unloaded';
        detailed--;
        unloaded++;
      }
    }
    if (detailed > this.maxDetailed) {
      const victims = [...this.entries.values()].filter(entry => entry.state === 'ready'
        && Math.max(Math.abs(entry.cell.x - center.x), Math.abs(entry.cell.z - center.z)) > this.detailRadius)
        .sort((a, b) => a.lastUsed - b.lastUsed);
      for (const entry of victims.slice(0, detailed - this.maxDetailed)) {
        entry.unload?.();
        entry.showLod?.();
        entry.state = 'unloaded';
      }
    }
    if (this.loading || !queued.length) return;
    queued.sort((a, b) => a.score - b.score);
    const entry = queued[0].entry;
    entry.state = 'loading';
    const generation = entry.generation = (entry.generation || 0) + 1;
    this.loading = entry;
    Promise.resolve().then(() => entry.load?.()).then(success => {
      if (entry.generation !== generation || !this.entries.has(entry.id)) return;
      if (success !== false) {
        const current = this.center;
        const distance = current ? Math.max(Math.abs(entry.cell.x - current.x), Math.abs(entry.cell.z - current.z)) : 0;
        if (distance > this.keepRadius) {
          entry.unload?.();
          entry.showLod?.();
          entry.state = 'unloaded';
        } else {
          entry.hideLod?.();
          entry.state = 'ready';
        }
      } else entry.state = 'unloaded';
    }, () => { if (entry.generation === generation) entry.state = 'unloaded'; })
      .finally(() => { if (this.loading === entry) this.loading = null; });
  }

  getStats() {
    let ready = 0;
    let pendingNear = 0;
    for (const entry of this.entries.values()) {
      if (entry.state === 'ready') ready++;
      if (this.center) {
        const distance = Math.max(Math.abs(entry.cell.x - this.center.x), Math.abs(entry.cell.z - this.center.z));
        if (distance <= this.detailRadius && entry.state !== 'ready') pendingNear++;
      }
    }
    return { entries: this.entries.size, ready, pendingNear, loading: !!this.loading };
  }

  dispose() {
    for (const entry of this.entries.values()) entry.unload?.();
    this.entries.clear();
    this.loading = null;
  }
}

export function getWorldChunkStreamer(scene) {
  let streamer = streamers.get(scene);
  if (streamer) return streamer;
  streamer = new WorldChunkStreamer();
  streamers.set(scene, streamer);
  let lastX = 0;
  let lastZ = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    const target = scene.activeCamera?.target;
    if (!target) return;
    streamer.update(target, { x: target.x - lastX, z: target.z - lastZ });
    lastX = target.x;
    lastZ = target.z;
  });
  scene.onDisposeObservable.addOnce(() => {
    scene.onBeforeRenderObservable.remove(observer);
    streamer.dispose();
    streamers.delete(scene);
  });
  return streamer;
}
