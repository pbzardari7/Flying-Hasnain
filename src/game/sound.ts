class SoundSystem {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private voiceoverEnabled: boolean = true;
  private sfxVolume: number = 0.9;
  private initialized: boolean = false;

  // Audio URLs
  private readonly yeahUrl: string = '/assets/aistudio/audio-editor.online_9763185a.mp3';
  private readonly ohNoUrl: string = '/assets/aistudio/Oh_No_b61397a1.mp3';
  private readonly gameStartUrl: string = '/assets/aistudio/Game_Start_0dfceae1.mp3';
  private readonly bhaiUrl: string = '/assets/aistudio/Bhai_Kya_Baat_Hai_db6abbf5.mp3';

  // Decoded Web Audio Buffers for instant zero-latency playback
  private yeahBuffer: AudioBuffer | null = null;
  private ohNoBuffer: AudioBuffer | null = null;
  private gameStartBuffer: AudioBuffer | null = null;
  private bhaiBuffer: AudioBuffer | null = null;

  // HTMLAudioElement Fallback Pools
  private yeahPool: HTMLAudioElement[] = [];
  private yeahPoolIndex: number = 0;
  private ohNoPool: HTMLAudioElement[] = [];
  private gameStartPool: HTMLAudioElement[] = [];
  private bhaiPool: HTMLAudioElement[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Pool for rapid spamming of "Yeah!"
        for (let i = 0; i < 8; i++) {
          const audio = new Audio(this.yeahUrl);
          audio.preload = 'auto';
          this.yeahPool.push(audio);
        }
        for (let i = 0; i < 3; i++) {
          const ohNo = new Audio(this.ohNoUrl);
          ohNo.preload = 'auto';
          this.ohNoPool.push(ohNo);

          const gs = new Audio(this.gameStartUrl);
          gs.preload = 'auto';
          this.gameStartPool.push(gs);

          const bhai = new Audio(this.bhaiUrl);
          bhai.preload = 'auto';
          this.bhaiPool.push(bhai);
        }
      } catch (err) {
        console.warn('Audio fallback pool init:', err);
      }
    }
  }

  public init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }

        // Helper to fetch and decode
        const loadBuffer = (url: string, onDecoded: (b: AudioBuffer) => void) => {
          fetch(url)
            .then((res) => res.arrayBuffer())
            .then((buf) => {
              if (this.ctx) {
                return this.ctx.decodeAudioData(buf);
              }
              return null;
            })
            .then((decoded) => {
              if (decoded) onDecoded(decoded);
            })
            .catch((err) => {
              console.warn(`Buffer decode fallback for ${url}:`, err);
            });
        };

        loadBuffer(this.yeahUrl, (b) => (this.yeahBuffer = b));
        loadBuffer(this.ohNoUrl, (b) => (this.ohNoBuffer = b));
        loadBuffer(this.gameStartUrl, (b) => (this.gameStartBuffer = b));
        loadBuffer(this.bhaiUrl, (b) => (this.bhaiBuffer = b));
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
    const updatePool = (pool: HTMLAudioElement[]) => {
      for (const a of pool) {
        a.volume = this.sfxVolume;
      }
    };
    updatePool(this.yeahPool);
    updatePool(this.ohNoPool);
    updatePool(this.gameStartPool);
    updatePool(this.bhaiPool);
  }

  // Generic buffer / pool playback helper
  private playClip(
    buffer: AudioBuffer | null,
    pool: HTMLAudioElement[],
    pitchVariation: number = 0,
    gainMultiplier: number = 1.0
  ) {
    if (!this.soundEnabled || !this.voiceoverEnabled) return;

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (buffer) {
        try {
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          if (pitchVariation > 0) {
            source.playbackRate.value =
              1 - pitchVariation / 2 + Math.random() * pitchVariation;
          }
          const gainNode = this.ctx.createGain();
          gainNode.gain.setValueAtTime(
            this.sfxVolume * gainMultiplier,
            this.ctx.currentTime
          );

          source.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          source.start(0);
          return;
        } catch (err) {
          console.warn('Web Audio playback error:', err);
        }
      }
    }

    // Fallback using HTMLAudioElement pool
    if (pool.length > 0) {
      try {
        const audio = pool[Math.floor(Math.random() * pool.length)];
        audio.currentTime = 0;
        audio.volume = Math.max(0, Math.min(1, this.sfxVolume * gainMultiplier));
        audio.play().catch(() => {});
      } catch {
        // Ignore
      }
    }
  }

  // Flap / wing whoosh (synthesized)
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

  // 1. Hasnain's authentic "Yeah!" voice on every flap/click
  public playYeahVoice() {
    this.playClip(this.yeahBuffer, this.yeahPool, 0.08, 1.0);
  }

  // 2. "Oh No" audio clip when bird hits / dies
  public playOhNo() {
    this.playClip(this.ohNoBuffer, this.ohNoPool, 0, 1.15);
  }

  // 3. "Game Start" audio clip on the last count (1) of the 3-second countdown
  public playGameStart() {
    this.playClip(this.gameStartBuffer, this.gameStartPool, 0, 1.15);
  }

  // 4. "Bhai kya baat hai" audio clip when player makes a new best score
  public playBhaiKyaBaatHai() {
    this.playClip(this.bhaiBuffer, this.bhaiPool, 0, 1.2);
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
