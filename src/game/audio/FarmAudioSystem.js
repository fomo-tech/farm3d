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
      this.ctx.resume();
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
}

export const farmAudio = new FarmAudioSystem();
