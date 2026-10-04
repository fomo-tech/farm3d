export const GRAPHICS_PRESETS = {
  auto: { maxDpr: 2.0, mobileDpr: 1.6, pixels: 9000000 },
  ultra: { maxDpr: 2.0, mobileDpr: 1.75, pixels: 12000000 },
  balanced: { maxDpr: 1.75, mobileDpr: 1.35, pixels: 7000000 },
  eco: { maxDpr: 1.0, mobileDpr: 1.0, pixels: 2000000 },
};

export function readGraphicsQuality() {
  try {
    const saved = localStorage.getItem('farm.graphics.quality');
    return GRAPHICS_PRESETS[saved] ? saved : 'auto';
  } catch { return 'auto'; }
}

export function saveGraphicsQuality(quality) {
  try { localStorage.setItem('farm.graphics.quality', quality); } catch { /* Storage may be disabled. */ }
}

export function calculateRenderDpr({ quality = 'ultra', nativeDpr = 1, width = 1, height = 1, mobile = false, scale = 1 }) {
  const preset = GRAPHICS_PRESETS[quality] || GRAPHICS_PRESETS.balanced;
  const limit = mobile ? preset.mobileDpr : preset.maxDpr;
  const pixelLimit = Math.sqrt(preset.pixels / Math.max(1, width * height));
  // Ultra and Balanced prioritize crisp native 1:1 pixel mapping on High-DPI screens.
  const targetDpr = Math.min(Math.max(1, nativeDpr), limit, pixelLimit);
  const minDpr = (mobile || quality === 'eco') ? 0.75 : 1.0;
  const effectiveScale = quality === 'ultra' ? 1 : scale;
  return Math.max(minDpr, targetDpr * effectiveScale);
}

// Slow hysteresis avoids oscillation and ignores stalls caused by tab suspension/loading.
export class RenderResolutionController {
  scale = 1;
  elapsed = 0;
  frames = 0;
  sample(ms) {
    if (!Number.isFinite(ms) || ms <= 0 || ms > 100) return false;
    this.elapsed += ms;
    this.frames++;
    if (this.elapsed < 5000) return false;
    const average = this.elapsed / this.frames;
    this.elapsed = 0;
    this.frames = 0;
    const previous = this.scale;
    // Only downscale if frame rate drops below 30 FPS for 5 sustained seconds
    if (average > 33) this.scale = Math.max(0.85, this.scale - 0.05);
    else if (average < 18) this.scale = Math.min(1, this.scale + 0.05);
    return Math.abs(previous - this.scale) > 0.001;
  }
}

// Preserve native pixels first; reduce effects before touching resolution.
export class AutoGraphicsController {
  constructor(mobile = false) { this.mobile = mobile; this.level = 0; this.scale = 1; this.elapsed = 0; this.frames = 0; }
  get effects() { return this.level === 0 ? 'balanced' : 'eco'; }
  sample(ms) {
    // Sustained 5–10 FPS is pressure too; only exclude suspension-sized gaps.
    if (!Number.isFinite(ms) || ms <= 0 || ms > 250) return false;
    this.elapsed += ms; this.frames++;
    if (this.elapsed < 8000) return false;
    const average = this.elapsed / this.frames;
    this.elapsed = 0; this.frames = 0;
    const previous = `${this.level}:${this.scale}`;
    if (average > (this.mobile ? 36 : 22)) {
      if (this.level < 1) this.level++;
      else this.scale = Math.max(.85, this.scale - .05);
    } else if (average < (this.mobile ? 27 : 17)) {
      if (this.scale < 1) this.scale = Math.min(1, this.scale + .05);
      else if (this.level > 0) this.level--;
    }
    return previous !== `${this.level}:${this.scale}`;
  }
}
