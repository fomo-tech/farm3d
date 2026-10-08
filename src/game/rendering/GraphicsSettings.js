export const GRAPHICS_PRESETS = {
  auto: { maxDpr: 2.0, mobileDpr: 1.5, pixels: 9000000 },
  ultra: { maxDpr: 2.0, mobileDpr: 1.75, pixels: 12000000 },
  balanced: { maxDpr: 1.75, mobileDpr: 1.5, pixels: 7000000 },
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

export function calculateRenderDpr({ quality = 'ultra', nativeDpr = 1, width = 1, height = 1, mobile = false, scale = 1, allowBelowNative = false }) {
  const preset = GRAPHICS_PRESETS[quality] || GRAPHICS_PRESETS.ultra;
  // Keep Ultra at 2x; lighter phone presets bound GPU work and framebuffer memory.
  const limit = mobile ? (quality === 'ultra' ? 2 : preset.mobileDpr) : preset.maxDpr;
  const pixelBudget = mobile ? Math.min(preset.pixels, quality === 'eco' ? 1000000 : 1800000) : preset.pixels;
  const pixelLimit = Math.sqrt(pixelBudget / Math.max(1, width * height));
  // Desktop presets preserve native pixels; phone presets use their own density caps.
  const targetDpr = Math.min(Math.max(1, nativeDpr), limit, pixelLimit);
  const minDpr = mobile ? (quality === 'eco' ? 0.75 : Math.min(nativeDpr, 1.25)) : (quality === 'eco' && allowBelowNative ? 0.75 : 1.0);
  // Auto adapts after reducing effects; manual desktop presets retain their density.
  const effectiveScale = mobile || quality === 'auto' || quality === 'eco' ? scale : 1;
  const resolved = Math.max(minDpr, targetDpr * effectiveScale);
  return mobile ? Math.min(resolved, pixelLimit) : resolved;
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
    if (this.elapsed < (this.mobile ? 3000 : 8000)) return false;
    const average = this.elapsed / this.frames;
    this.elapsed = 0; this.frames = 0;
    const previous = `${this.level}:${this.scale}`;
    if (average > (this.mobile ? 40 : 36)) {
      if (this.level < 1) this.level++;
      else this.scale = Math.max(.7, this.scale - (this.mobile && average > 50 ? .1 : .05));
    } else if (average < (this.mobile ? 35 : 27)) {
      if (this.scale < 1) this.scale = Math.min(1, this.scale + .05);
      else if (this.level > 0) this.level--;
    }
    return previous !== `${this.level}:${this.scale}`;
  }
}

// Engine-level pacing skips CPU simulation and GPU submission together.
export function applyWorldPowerPolicy(engine, mobile) {
  engine.maxFPS = mobile ? 30 : 60;
  engine.renderEvenInBackground = false;
}
