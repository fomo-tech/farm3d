// Preview does not need to compete with the main world at 60/144 FPS.
export class PreviewFrameGate {
  constructor(fps = 30) {
    this.interval = 1000 / fps;
    this.lastRenderAt = -Infinity;
    this.lastAnimationAt = null;
  }
  tick(now, { visible, animate, dirty = false, cameraMoving = false }) {
    if (!visible) { this.lastAnimationAt = null; return null; }
    if (!animate && !dirty && !cameraMoving) { this.lastAnimationAt = null; return null; }
    if (!dirty && now - this.lastRenderAt < this.interval - 0.5) return null;
    const delta = animate ? this.lastAnimationAt == null ? this.interval / 1000 : Math.min(0.1, Math.max(0, (now - this.lastAnimationAt) / 1000)) : 0;
    this.lastRenderAt = now;
    this.lastAnimationAt = animate ? now : null;
    return { delta, animate };
  }
}
