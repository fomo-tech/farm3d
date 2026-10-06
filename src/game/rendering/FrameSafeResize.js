// Resizing a WebGL canvas clears its drawing buffer. Requests may arrive after
// rendering (adaptive quality) or between frames (rotation/ResizeObserver).
// Apply them only immediately before the next scene.render(), never afterwards.
export class FrameSafeResize {
  constructor(engine, canvas, getDpr) {
    this.engine = engine;
    this.canvas = canvas;
    this.getDpr = getDpr;
    this.pending = true;
  }
  request() { this.pending = true; }
  flush() {
    if (!this.pending) return false;
    this.pending = false;
    const dpr = this.getDpr();
    const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
    if (!(width > 0 && height > 0 && Number.isFinite(dpr) && dpr > 0)) {
      this.pending = true;
      return false;
    }
    const scale = 1 / dpr;
    if (Math.abs(this.engine.getHardwareScalingLevel() - scale) > 0.00001) {
      // Babylon's setter already calls resize(); do not resize twice.
      this.engine.setHardwareScalingLevel(scale);
      return true;
    }
    if (this.canvas.width !== (width * dpr | 0) || this.canvas.height !== (height * dpr | 0)) {
      this.engine.resize();
      return true;
    }
    return false;
  }
}
