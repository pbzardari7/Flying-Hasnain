class SoundSystem {
  private ctx: AudioContext | null = null;
  private voiceBuffer: AudioBuffer | null = null;
  private voicePool: HTMLAudioElement[] = [];
  private poolIndex: number = 0;
  private soundEnabled: boolean = true;
  private voiceoverEnabled: boolean = true;
  private sfxVolume: number = 0.85;
  private initialized: boolean = false;
  private audioUrl: string = '/assets/aistudio/audio-editor.online_9763185a.mp3';

  constructor() {
    if (typeof window !== 'undefined') {
      // Create a pool of 8 Audio elements for instant polyphonic spamming fallback
      try {
        for (let i = 0; i < 8; i++) {
          const audio = new Audio(this.audioUrl);
          audio.preload = 'auto';
          this.voicePool.push(audio);
        }
      } catch (err) {
        console.warn('Audio pool initialization:', err);
      }
    }
  }

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        // Fetch and decode into Web Audio buffer for true 0ms rapid polyphonic playback
        fetch(this.audioUrl)
          .then((res) => res.arrayBuffer())
          .then((buf) => {
            if (this.ctx) {
              return this.ctx.decodeAudioData(buf);
            }
            return null;
          })
          .then((decoded) => {
            if (decoded) {
              this.voiceBuffer = decoded;
            }
          })
          .catch((err) => {
            console.warn('Audio buffer decode fallback to audio elements:', err);
          });
      }

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  public setSettings(sound: boolean, voiceover: boolean, volume: number) {
    this.soundEnabled = sound;
    this.voiceoverEnabled = voiceover;
    this.sfxVolume = Math.max(0, Math.min(1, volume));

    // Update pool volumes
    for (const a of this.voicePool) {
      a.volume = this.sfxVolume;
    }
  }

  // Flap / wing whoosh
  public playFlap() {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.1);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Ignore
    }
  }

  // Play Hasnain's authentic "Yeah!" voice audio clip with rapid polyphonic spamming!
  public playYeahVoice() {
    if (!this.soundEnabled || !this.voiceoverEnabled) return;

    // 1. Preferred: Web Audio Buffer Source (zero latency, unlimited concurrent spamming)
    if (this.ctx && this.voiceBuffer) {
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        const source = this.ctx.createBufferSource();
        source.buffer = this.voiceBuffer;

        // Slight micro-pitch variation (0.97 - 1.05) so rapid spamming sounds organic & dynamic!
        source.playbackRate.value = 0.97 + Math.random() * 0.08;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start(0);
        return;
      } catch (err) {
        console.warn('Web Audio source play error:', err);
      }
    }

    // 2. Fallback: Round-robin Audio element pool
    if (this.voicePool.length > 0) {
      try {
        const audio = this.voicePool[this.poolIndex];
        this.poolIndex = (this.poolIndex + 1) % this.voicePool.length;

        audio.currentTime = 0;
        audio.volume = this.sfxVolume;
        audio.play().catch(() => {
          // If browser restricts before gesture, fallback
          this.playFanfare();
        });
      } catch {
        this.playFanfare();
      }
    } else {
      this.playFanfare();
    }
  }

  // Score obstacle point
  public playScore() {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(1174.66, now + 0.06);

      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.setValueAtTime(1760, now + 0.06);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.29);
      osc2.stop(now + 0.29);
    } catch {
      // Ignore
    }
  }

  // Coin collect sparkle
  public playCoin() {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(1975.53, now + 0.14);

      gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignore
    }
  }

  // Crash / bonk impact
  public playHit() {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.21);
    } catch {
      // Ignore
    }
  }

  // Tumble down after hit
  public playTumble() {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.39);
    } catch {
      // Ignore
    }
  }

  // Button click / UI tap
  public playClick() {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  // Fanfare for purchase or victory
  public playFanfare() {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25 * this.sfxVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundSystem();
