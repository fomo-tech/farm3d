import { applyGrainRows } from './TextureGrain.js';
self.onmessage = ({ data: { id, width, height, buffer } }) => {
  const started = performance.now();
  const pixels = new Uint8ClampedArray(buffer);
  applyGrainRows(pixels, width, height);
  self.postMessage({ id, buffer, durationMs: performance.now() - started }, [buffer]);
};
