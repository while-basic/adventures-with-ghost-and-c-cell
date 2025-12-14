
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple synthesizer for UI sounds and Glitch effects
class AudioSynth {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Default volume
      this.masterGain.connect(this.ctx.destination);
    }
    // Crucial for iOS: Resume context if suspended (must happen during user gesture)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, startTime = 0) {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    const now = this.ctx.currentTime + startTime;
    // Envelope to avoid clicking
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  playNoise(duration: number, startTime = 0) {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime + startTime;
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // --- FX Presets ---

  playClick() {
    this.playTone(800, 'sine', 0.05);
  }

  playHover() {
    this.playTone(400, 'triangle', 0.02);
  }

  playPageFlip() {
    this.playNoise(0.15);
  }

  playGlitch() {
    this.init();
    if (!this.ctx) return;
    for(let i=0; i<5; i++) {
        this.playTone(200 + Math.random() * 1000, 'sawtooth', 0.05, i * 0.04);
    }
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;
    this.playTone(440, 'sine', 0.3, 0);
    this.playTone(554, 'sine', 0.3, 0.1); // C#
    this.playTone(659, 'sine', 0.6, 0.2); // E
  }

  playBassDrop() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 1.5);

    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
  }

  // --- Narrative Sounds ---

  playImpact() {
    // Punch/Crash/Slam - Low thud + Noise burst
    this.init();
    if (!this.ctx) return;
    this.playTone(100, 'square', 0.1); // Sharp attack
    this.playTone(60, 'sine', 0.3);    // Low body
    this.playNoise(0.2);               // Texture
  }

  playMagic() {
    // Ghost Vocal/Magic - Chord of high shimmering sines
    this.init();
    if (!this.ctx) return;
    [880, 1100, 1320, 1760].forEach((freq, i) => {
        this.playTone(freq, 'sine', 0.6, i * 0.05);
    });
  }

  playCyber() {
    // Tech/Hacking - Rapid sequence of computer bleeps
    this.init();
    if (!this.ctx) return;
    for(let i=0; i<6; i++) {
        this.playTone(1200 + Math.random() * 1000, 'square', 0.04, i * 0.04);
    }
  }

  playSuspense() {
    // Horror/Cliffhanger - Dissonant low saw waves
    this.init();
    if (!this.ctx) return;
    this.playTone(110, 'sawtooth', 1.5);
    this.playTone(114, 'sawtooth', 1.5); // Slight detune for tension
  }

  playNotification() {
    // Text message/Viral alert - High double beep
    this.init();
    if (!this.ctx) return;
    this.playTone(2000, 'sine', 0.1, 0);
    this.playTone(2000, 'sine', 0.1, 0.15);
  }

  playSpeed() {
    // Whoosh/Car - Filtered noise sweep
    this.init();
    if (!this.ctx) return;
    this.playNoise(0.5);
    // Note: Simple noise for now, in a real synth we'd sweep the filter
  }
}

export const SoundEngine = new AudioSynth();
