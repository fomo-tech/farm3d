const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const approach = (current, target, dt, speed) => current + (target - current) * (1 - Math.exp(-speed * dt));

/**
 * Hides chunk transitions in plain sight. The horizon closes quickly while a
 * nearby cell is loading or FPS is under pressure, then opens slowly again so
 * the player never sees geometry pop into existence.
 */
export class FogStreamingController {
  constructor(scene, camera, { getStreamingStats, getFps, mobile = false, presets = null } = {}) {
    this.scene = scene;
    this.camera = camera;
    this.getStreamingStats = getStreamingStats || (() => ({}));
    this.getFps = getFps || (() => 60);
    this.elapsed = 1;
    this.mobile = mobile;
    this.filteredFps = 60;
    this.candidateMode = 'streaming';
    this.modeAge = 0;
    this.presets = presets;
    const initialPreset = this._getPreset('streaming');
    this.state = { mode: 'streaming', targetFogEnd: initialPreset.end, pendingNear: 1 };
    scene.fogStart = initialPreset.start;
    scene.fogEnd = initialPreset.end;
    camera.maxZ = Math.min(camera.maxZ, initialPreset.clip);
  }

  _getPreset(mode) {
    if (this.presets && this.presets[mode]) return this.presets[mode];
    return {
      performance: { start: this.mobile ? 50 : 65, end: this.mobile ? 120 : 150, clip: this.mobile ? 155 : 190 },
      streaming: { start: this.mobile ? 55 : 70, end: this.mobile ? 130 : 160, clip: this.mobile ? 165 : 200 },
      recovering: { start: this.mobile ? 60 : 75, end: this.mobile ? 140 : 170, clip: this.mobile ? 175 : 210 },
      clear: { start: this.mobile ? 65 : 80, end: this.mobile ? 145 : 180, clip: this.mobile ? 180 : 220 },
    }[mode];
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed < 0.2) return;
    const elapsed = clamp(this.elapsed, 0, 1);
    this.elapsed = 0;
    const stream = this.getStreamingStats() || {};
    const fps = Number(this.getFps()) || 60;
    const pendingNear = Number(stream.pendingNear) || 0;
    const loading = !!stream.loading || pendingNear > 0;
    this.filteredFps = approach(this.filteredFps, fps, elapsed, .4);
    const pressure = this.filteredFps < 24;
    const recovering = !pressure && this.filteredFps < 38;
    const desiredMode = pressure ? 'performance' : (loading ? 'streaming' : (recovering ? 'recovering' : 'clear'));
    if (this.candidateMode !== desiredMode) { this.candidateMode = desiredMode; this.modeAge = 0; }
    this.modeAge += elapsed;
    const mode = this.modeAge >= 3 ? desiredMode : this.state.mode;
    const preset = this._getPreset(mode);
    this.state = { mode, fps: Math.round(fps), pendingNear, targetFogEnd: preset.end };
    const frameDt = elapsed;
    const closing = preset.end < this.scene.fogEnd;
    const speed = closing ? .6 : .3;
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
