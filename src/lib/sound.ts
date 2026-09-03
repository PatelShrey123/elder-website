"use client";

// Web Audio API Sound Synthesizer for Anime / Gojo & Sukuna SFX
class SoundFx {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Domain Expansion: Infinite Void Activation
  playInfiniteVoid() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Cosmic deep resonance
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(60, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 1.2);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.2);

    // Crystalline chime / bell harmonic (Infinite Void chime)
    [528, 660, 792, 1056, 1320].forEach((freq, i) => {
      if (!this.ctx) return;
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = "sine";
      bell.frequency.setValueAtTime(freq, now + i * 0.08);

      bellGain.gain.setValueAtTime(0.08 / (i + 1), now + i * 0.08);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.4);

      bell.connect(bellGain);
      bellGain.connect(this.ctx.destination);
      bell.start(now + i * 0.08);
      bell.stop(now + i * 0.08 + 1.4);
    });
  }

  // Red + Blue Fusion & Charge up
  playEnergyFusion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Swirling frequency
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 1.0);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  }

  // Laser charge alias
  playChargeLaser() {
    this.playEnergyFusion();
  }

  // Hollow Purple Catastrophic Laser Blast
  playHollowPurpleBeam() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Laser blast burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 1.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.1);

    // Shockwave noise
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1200, now);
    noiseFilter.Q.setValueAtTime(2, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now + 0.05);
  }

  // ==========================================
  // SUKUNA SOUND FX: DOMAIN & SKILL ATTACKS
  // ==========================================

  // Domain Expansion: Malevolent Shrine (Fukuma Mizushi)
  playMalevolentShrine() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Dark subterranean cursed vibration
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(45, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 1.4);

    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.4);

    // Temple Gong / Cursed Bells
    [110, 165, 220, 330, 440].forEach((freq, idx) => {
      if (!this.ctx) return;
      const gong = this.ctx.createOscillator();
      const gongGain = this.ctx.createGain();
      gong.type = "sawtooth";
      gong.frequency.setValueAtTime(freq, now + idx * 0.05);

      gongGain.gain.setValueAtTime(0.12 / (idx + 1), now + idx * 0.05);
      gongGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);

      gong.connect(filter);
      filter.connect(gongGain);
      gongGain.connect(this.ctx.destination);

      gong.start(now + idx * 0.05);
      gong.stop(now + idx * 0.05 + 1.6);
    });
  }

  // Sukuna Cleave & Dismantle Slashes (Kai / Hachi)
  playCleaveDismantle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Multi-slash flurry
    for (let i = 0; i < 5; i++) {
      const delay = now + i * 0.12;
      const slash = this.ctx.createOscillator();
      const slashGain = this.ctx.createGain();

      slash.type = "sawtooth";
      slash.frequency.setValueAtTime(2400 - i * 150, delay);
      slash.frequency.exponentialRampToValueAtTime(200, delay + 0.18);

      slashGain.gain.setValueAtTime(0.25, delay);
      slashGain.gain.exponentialRampToValueAtTime(0.001, delay + 0.18);

      slash.connect(slashGain);
      slashGain.connect(this.ctx.destination);

      slash.start(delay);
      slash.stop(delay + 0.18);
    }
  }

  // Sukuna Fire Arrow (Fuga / Kamino) Inferno Blast
  playFireArrowFuga() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Ignition whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);

    // Explosive flame roar noise
    const bufferSize = this.ctx.sampleRate * 1.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const fireNoise = this.ctx.createBufferSource();
    fireNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 1.0);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now + 0.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    fireNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    fireNoise.start(now + 0.15);
  }

  playHover() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }
}

export const sfx = new SoundFx();
