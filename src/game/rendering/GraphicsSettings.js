export const GRAPHICS_PRESETS = {
  ultra: { maxDpr: 2, mobileDpr: 1.5, pixels: 6500000 },
  balanced: { maxDpr: 1.25, mobileDpr: 1.2, pixels: 2400000 },
  eco: { maxDpr: 0.85, mobileDpr: 0.85, pixels: 1400000 },
};

export function readGraphicsQuality() {
  try {
    const saved = localStorage.getItem('farm.graphics.quality');
    return GRAPHICS_PRESETS[saved] ? saved : 'ultra';
  } catch { return 'ultra'; }
}

export function saveGraphicsQuality(quality) {
  try { localStorage.setItem('farm.graphics.quality', quality); } catch { /* Storage may be disabled. */ }
}

export function calculateRenderDpr({ quality = 'ultra', nativeDpr = 1, width = 1, height = 1, mobile = false, scale = 1 }) {
  const preset = GRAPHICS_PRESETS[quality] || GRAPHICS_PRESETS.balanced;
  const limit = mobile ? preset.mobileDpr : preset.maxDpr;
  const pixelLimit = Math.sqrt(preset.pixels / Math.max(1, width * height));
  // Ultra is a stable sharpness setting, not an automatic performance preset.
  const effectiveScale = quality === 'ultra' ? 1 : scale;
  return Math.max(0.5, Math.min(Math.max(1, nativeDpr), limit, pixelLimit) * effectiveScale);
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
    if (average > 27) this.scale = Math.max(0.75, this.scale - 0.05);
    else if (average < 18) this.scale = Math.min(1, this.scale + 0.025);
    return Math.abs(previous - this.scale) > 0.001;
  }
}
