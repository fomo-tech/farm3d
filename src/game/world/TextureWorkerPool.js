import { applyGrainRows } from './TextureGrain.js';

const pools = new WeakMap();
let nextId = 0;
export function getTextureWorkerStats(scene) {
  const pool = pools.get(scene);
  return pool ? { mode: pool.worker ? 'worker' : 'cooperative', pending: pool.jobs.size,
    completed: pool.completed, maxJobMs: Math.round(pool.maxJobMs) } : null;
}

// One worker per scene; transferred pixel buffers do not duplicate RAM.
// Babylon texture/GPU mutations remain on the rendering thread.
export function addTextureGrain(scene, pixels, width, height, onReady) {
  let pool = pools.get(scene);
  if (!pool) {
    pool = { worker: null, jobs: new Map(), completed: 0, maxJobMs: 0 };
    pools.set(scene, pool);
    try {
      if (typeof Worker !== 'undefined') {
        pool.worker = new Worker(new URL('./TextureGrain.worker.js', import.meta.url), { type: 'module' });
        pool.worker.onmessage = ({ data }) => {
          const done = pool.jobs.get(data.id);
          pool.jobs.delete(data.id);
          pool.completed++;
          pool.maxJobMs = Math.max(pool.maxJobMs, data.durationMs || 0);
          if (!scene.isDisposed) done?.(new Uint8ClampedArray(data.buffer));
        };
        pool.worker.onerror = () => {
          pool.worker?.terminate();
          pool.worker = null;
          pool.jobs.clear(); // Base textures stay visible; grain is optional.
          if (typeof window !== 'undefined') window.__farmDebug?.report('Worker tạo vân cỏ không hoạt động; giữ texture nền, các tác vụ tiếp theo được chia nhỏ.', 'TEXTURE WORKER FALLBACK');
        };
      }
    } catch { /* Unsupported worker: cooperative fallback below. */ }
    scene.onDisposeObservable.addOnce(() => {
      pool.worker?.terminate();
      pool.jobs.clear();
      pools.delete(scene);
    });
  }
  if (pool.worker) {
    const id = ++nextId;
    pool.jobs.set(id, onReady);
    pool.worker.postMessage({ id, width, height, buffer: pixels.buffer }, [pixels.buffer]);
    return;
  }
  // Worker unavailable: yield between small row batches, never process the
  // million pixels synchronously inside React's world-creation effect.
  let row = 0;
  const step = () => {
    if (scene.isDisposed) return;
    const start = performance.now();
    do {
      applyGrainRows(pixels, width, height, row, row + 2);
      row += 2;
    } while (row < height && performance.now() - start < 1.5);
    if (row < height) requestAnimationFrame(step);
    else onReady(pixels);
  };
  requestAnimationFrame(step);
}
