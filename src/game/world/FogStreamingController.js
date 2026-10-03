const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const approach = (current, target, dt, speed) => current + (target - current) * (1 - Math.exp(-speed * dt));

/**
 * Hides chunk transitions in plain sight. The horizon closes quickly while a
 * nearby cell is loading or FPS is under pressure, then opens slowly again so
 * the player never sees geometry pop into existence.
 */
export class FogStreamingController {
  constructor(scene, camera, { getStreamingStats, getFps } = {}) {
    this.scene = scene;
    this.camera = camera;
    this.getStreamingStats = getStreamingStats || (() => ({}));
    this.getFps = getFps || (() => 60);
    this.elapsed = 1;
    this.state = { mode: 'streaming', targetFogEnd: 420, pendingNear: 1 };
    scene.fogStart = 120;
    scene.fogEnd = 420;
    camera.maxZ = Math.min(camera.maxZ, 650);
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed < 0.2) return;
    this.elapsed = 0;
    const stream = this.getStreamingStats() || {};
    const fps = Number(this.getFps()) || 60;
    const pendingNear = Number(stream.pendingNear) || 0;
    const loading = !!stream.loading || pendingNear > 0;
    const pressure = fps < 24;
    const recovering = !pressure && fps < 38;
    const mode = pressure ? 'performance' : (loading ? 'streaming' : (recovering ? 'recovering' : 'clear'));
    const preset = {
      performance: { start: 75, end: 250, clip: 390 },
      streaming: { start: 105, end: 340, clip: 500 },
      recovering: { start: 145, end: 440, clip: 620 },
      clear: { start: 210, end: 680, clip: 850 },
    }[mode];
    this.state = { mode, fps: Math.round(fps), pendingNear, targetFogEnd: preset.end };
    const frameDt = clamp(dt, 0, 0.1);
    const closing = preset.end < this.scene.fogEnd;
    const speed = closing ? 4.5 : 0.85;
    this.scene.fogStart = approach(this.scene.fogStart, preset.start, frameDt, speed);
    this.scene.fogEnd = approach(this.scene.fogEnd, preset.end, frameDt, speed);
    this.camera.maxZ = approach(this.camera.maxZ, preset.clip, frameDt, speed);
  }

  getState() {
    return {
      ...this.state,
      fogStart: Math.round(this.scene.fogStart),
      fogEnd: Math.round(this.scene.fogEnd),
      cameraFarClip: Math.round(this.camera.maxZ),
    };
  }

  dispose() {}
}
