import { lakeShoreDistance } from '../../../shared/lakeConfig.js';
import { networkWaterAt } from '../../../shared/waterNetwork.js';

export function distanceToWater(x, z) {
  // 1. Crystal Lake
  const lakeDist = Math.abs(lakeShoreDistance(x, z));
  if (lakeDist < 25) return lakeDist;

  // 2. Water Network (4 satellite lakes + 5 streams)
  if (networkWaterAt(x, z, 5)) return 0;
  if (networkWaterAt(x, z, 14)) return 8;
  if (networkWaterAt(x, z, 24)) return 18;

  // 3. Central Park Pond & Brook
  const pondD = Math.hypot(x - 84, z - 68);
  if (pondD < 24) return Math.max(0, pondD - 6);

  // 4. Grand Winding River (runs roughly x ~ 205-225, z: -580 to 720)
  if (z >= -580 && z <= 720) {
    const rx = 215 + Math.sin(z * 0.015) * 8;
    const dX = Math.abs(x - rx);
    if (dX < 32) return Math.max(0, dX - 9);
  }

  // 5. South Beach & Ocean (z > 318)
  if (z >= 318) {
    const dZ = Math.abs(z - 350);
    if (dZ < 35) return Math.max(0, dZ - 8);
  }

  return 100;
}

/**
 * FarmAudioSystem - Hệ thống âm thanh Procedural Web Audio API cho Farm Online 3D
 * Không phụ thuộc file âm thanh ngoài, độ trễ 0ms, âm sắc trong trẻo mượt mà.
 */
class FarmAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.sfxGain = null;
    this.isInitialized = false;
    this.natureOscillators = [];
    this.lastFootstep = 0;
    this.waterGain = null;
    this.waterFilter = null;
    this.waterSource = null;
    this.waterAudioActive = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.55;
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      // Ambient Gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.22;
      this.ambientGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch {
      // AudioContext unavailable
    }
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.55, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // === 1. ÂM THANH NÔNG NGHIỆP & TƯƠNG TÁC ===

  // Short UI feedback, shared by context actions and wardrobe controls.
  playPop() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(310, now + 0.07);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Tiếng cuốc đất (Hoe dirt sound)
  playCoins() {
    // Optional feedback must never prevent a server-bound transaction.
    try {
      this.ensureContext();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      [880, 1320, 1760].forEach((frequency, index) => {
        const at = now + index * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, at);
        gain.gain.setValueAtTime(0.1, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
        osc.connect(gain);gain.connect(this.sfxGain);
        osc.onended = () => { osc.disconnect();gain.disconnect(); };
        osc.start(at);osc.stop(at + 0.16);
      });
    } catch { /* Sound is optional; keep the gameplay action running. */ }
  }

  playHoe() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Tiếng gieo hạt giống (Planting seeds)
  playPlant() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Tiếng tưới nước (Watering sound)
  playWater() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Tạo tiếng rào rào của giọt nước bằng bandpass filter trên noise
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.25);
  }

  // Tiếng thu hoạch nông sản "Pop" lấp lánh (Harvest Pop & Chime)
  playHarvest() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Tiếng Pop củ cà rốt nhổ lên
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(680, now + 0.08);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Chùm âm lấp lánh nốt nhạc (Arpeggio Chime)
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const delay = 0.04 + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    });
  }

  // === 2. ÂM THANH PHƯƠNG TIỆN ===

  // Chuông xe đạp kính coong (Bicycle Bell)
  playBicycleBell() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    [1760, 2093].forEach((freq, idx) => {
      const delay = idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0.35, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.45);
    });
  }

  // Tiếng bước chân đi bộ (Footstep)
  playFootstep() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastFootstep < 280) return;
    this.lastFootstep = now;

    const ctxNow = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90 + Math.random() * 20, ctxNow);
    osc.frequency.exponentialRampToValueAtTime(30, ctxNow + 0.06);
    gain.gain.setValueAtTime(0.12, ctxNow);
    gain.gain.exponentialRampToValueAtTime(0.001, ctxNow + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(ctxNow);
    osc.stop(ctxNow + 0.06);
  }

  // Tiếng nhận phần thưởng / Thăng cấp (Fanfare chime)
  playFanfare() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const chords = [
      { f: 523.25, d: 0.0 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.2 }, // G5
      { f: 1046.5, d: 0.3 }, // C6
    ];
    chords.forEach(({ f, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + d);
      gain.gain.setValueAtTime(0.28, now + d);
      gain.gain.exponentialRampToValueAtTime(0.001, now + d + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + d);
      osc.stop(now + d + 0.5);
    });
  }

  // Tiếng còi xe buýt tốc hành vui nhộn Play Together (Bus Horn)
  playBusHorn() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [349.23, 440].forEach((freq) => {
      [0, 0.16].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.16, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.13);
      });
    });
  }

  // === 3. ÂM THANH MÔI TRƯỜNG SÔNG NƯỚC THƯ THÁI (WATERFRONT AMBIENCE) ===
  initWaterAmbience() {
    if (!this.ctx || this.waterAudioActive) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 2.5);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;
      }

      this.waterSource = this.ctx.createBufferSource();
      this.waterSource.buffer = noiseBuffer;
      this.waterSource.loop = true;

      this.waterFilter = this.ctx.createBiquadFilter();
      this.waterFilter.type = 'lowpass';
      this.waterFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
      this.waterFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);

      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.waterSource.connect(this.waterFilter);
      this.waterFilter.connect(this.waterGain);
      if (this.ambientGain) {
        this.waterGain.connect(this.ambientGain);
      } else {
        this.waterGain.connect(this.masterGain);
      }

      this.waterSource.start(0);
      this.waterAudioActive = true;
    } catch {
      // Audio fallback
    }
  }

  updateWaterfrontPosition(x, z) {
    if (this.isMuted || !this.ctx) return;
    const d = distanceToWater(x, z);
    if (!this.waterAudioActive) {
      if (d < 26) this.initWaterAmbience();
      else return;
    }
    const now = this.ctx.currentTime;
    let targetVolume = 0;
    if (d < 24) {
      const proximity = Math.max(0, 1 - d / 24);
      targetVolume = proximity * proximity * 0.32;
      if (this.waterFilter) {
        const waveFreq = 340 + Math.sin(now * 1.2) * 90 + Math.cos(now * 0.45) * 50;
        this.waterFilter.frequency.setTargetAtTime(waveFreq, now, 0.2);
      }
    }
    if (this.waterGain) {
      this.waterGain.gain.setTargetAtTime(targetVolume, now, 0.25);
    }
  }
}

export const farmAudio = new FarmAudioSystem();
