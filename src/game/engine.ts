import {
  BackgroundCloud,
  CollectibleCoin,
  GameState,
  ObstaclePipe,
  PlayerCharacter,
  VisualParticle,
} from './types';
import {
  DIFFICULTY_TIERS,
  PHYSICS,
} from './constants';
import { CHARACTER_CATALOG, drawHasnainCharacter } from './skins';
import { sounds } from './sound';
import { storage } from './storage';

export class GameEngine {
  public state: GameState = 'MENU';
  public width: number = 400;
  public height: number = 700;

  // Hasnain Physics State
  public playerX: number = 100;
  public playerY: number = 300;
  public velocityY: number = 0;
  public tiltAngle: number = 0;
  public wingPhase: number = 0;
  public squashScaleY: number = 1;
  public squashScaleX: number = 1;

  // Fixed-timestep physics accumulator for rock-solid 60fps simulation
  private accumulator: number = 0;
  private readonly FIXED_DT: number = 1 / 60;

  // Run Score and Economy
  public score: number = 0;
  public coinsInRun: number = 0;
  public obstaclesCleared: number = 0;
  public runStartTime: number = 0;
  public runDurationSec: number = 0;
  public isNewBestRun: boolean = false;
  public bestScoreAtStart: number = 0;

  // Gameplay Objects
  public obstacles: ObstaclePipe[] = [];
  public coins: CollectibleCoin[] = [];
  public particles: VisualParticle[] = [];
  public clouds: BackgroundCloud[] = [];
  public groundOffset: number = 0;
  private nextObstacleId: number = 1;
  private nextCoinId: number = 1;

  // Screen Shake & Hitstop
  public screenShakeTrauma: number = 0;
  public hitstopTimer: number = 0;

  // Active Skin & Settings
  public currentCharacter: PlayerCharacter = CHARACTER_CATALOG[0];
  private customHeadImg: HTMLImageElement | null = null;
  public currentSpeed: number = PHYSICS.BASE_OBSTACLE_SPEED;
  public currentGap: number = PHYSICS.BASE_GAP;

  // Floating text alerts (e.g. "+1 COIN", "YEAH!") - capped at 4 items
  public floatingAlerts: Array<{
    text: string;
    x: number;
    y: number;
    color: string;
    alpha: number;
    vy: number;
  }> = [];

  // Cached canvas gradients to eliminate per-frame allocations
  private cachedSkyGrad: CanvasGradient | null = null;
  private cachedSkyHeight: number = 0;

  // Callbacks to React
  public onStateChange?: (state: GameState) => void;
  public onScoreChange?: (score: number) => void;
  public onCoinChange?: (coins: number) => void;
  public onGameOver?: (summary: {
    score: number;
    coinsEarned: number;
    isNewBest: boolean;
    previousBest: number;
  }) => void;

  constructor() {
    this.initClouds();
    this.syncEquippedCharacter();
  }

  public syncEquippedCharacter() {
    const stats = storage.getStats();
    const found = CHARACTER_CATALOG.find(
      (c) => c.id === stats.equippedCharacterId
    );
    this.currentCharacter = found || CHARACTER_CATALOG[0];
    this.customHeadImg = storage.getCustomHeadImage();
  }

  public resize(w: number, h: number) {
    if (this.width !== w || this.height !== h) {
      this.width = w;
      this.height = h;
      this.cachedSkyGrad = null; // invalidates sky gradient cache
    }

    if (this.state === 'MENU') {
      this.playerX = Math.round(w * 0.5);
      this.playerY = Math.round(h * 0.35);
    } else {
      this.playerX = Math.round(w * 0.28);
      if (this.state === 'READY') {
        this.playerY = Math.round(h * 0.42);
      }
    }
  }

  private initClouds() {
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * 600,
        y: 35 + Math.random() * 220,
        speed: 0.3 + Math.random() * 0.5,
        scale: 0.65 + Math.random() * 0.6,
        opacity: 0.3 + Math.random() * 0.4,
        type: Math.floor(Math.random() * 3),
      });
    }
  }

  // --- State Transitions ---

  public startReady() {
    this.syncEquippedCharacter();
    this.resetFlightData();
    this.setState('READY');
  }

  public flap() {
    sounds.init();

    if (this.state === 'MENU' || this.state === 'GAMEOVER') {
      this.startReady();
      return;
    }

    if (this.state === 'READY') {
      this.setState('PLAYING');
      this.runStartTime = Date.now();
      this.applyFlapImpulse();
      return;
    }

    if (this.state === 'PLAYING') {
      this.applyFlapImpulse();
    }
  }

  private applyFlapImpulse() {
    this.velocityY = PHYSICS.FLAP_IMPULSE;
    this.squashScaleY = 0.84;
    this.squashScaleX = 1.16;

    sounds.playFlap();
    sounds.playYeahVoice();

    // Fast-decaying comic YEAH text alert (capped at 3 items)
    this.floatingAlerts.push({
      text: 'YEAH!',
      x: this.playerX + (Math.random() - 0.5) * 14,
      y: this.playerY - 26,
      color: '#fef08a',
      alpha: 1,
      vy: -2.2,
    });
    if (this.floatingAlerts.length > 3) {
      this.floatingAlerts.shift();
    }

    // Pooled flap particles (max 2 per flap, max 24 total)
    if (this.particles.length < 24) {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: this.playerX - PHYSICS.HEAD_RADIUS * 0.7,
          y: this.playerY + (Math.random() - 0.5) * 12,
          vx: -1.4 - Math.random() * 1.5,
          vy: (Math.random() - 0.5) * 1.2,
          size: 2.5 + Math.random() * 2.5,
          color: this.currentCharacter.wingColor,
          alpha: 0.75,
          decay: 0.05,
          shape: 'feather',
        });
      }
    }
  }

  public pause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.setState('PLAYING');
      this.accumulator = 0; // reset accumulator to prevent sudden jump
    }
  }

  public restart() {
    this.syncEquippedCharacter();
    this.resetFlightData();
    this.setState('READY');
  }

  public quitToMenu() {
    this.syncEquippedCharacter();
    this.resetFlightData();
    this.playerX = Math.round(this.width * 0.5);
    this.playerY = Math.round(this.height * 0.35);
    this.setState('MENU');
  }

  private resetFlightData() {
    this.playerX = Math.round(this.width * 0.28);
    this.playerY = Math.round(this.height * 0.42);
    this.velocityY = 0;
    this.tiltAngle = 0;
    this.wingPhase = 0;
    this.squashScaleX = 1;
    this.squashScaleY = 1;
    this.accumulator = 0;

    this.score = 0;
    this.coinsInRun = 0;
    this.obstaclesCleared = 0;
    this.obstacles.length = 0;
    this.coins.length = 0;
    this.particles.length = 0;
    this.floatingAlerts.length = 0;
    this.screenShakeTrauma = 0;
    this.hitstopTimer = 0;
    this.isNewBestRun = false;

    const stats = storage.getStats();
    this.bestScoreAtStart = stats.bestScore;

    this.updateDifficulty(0);

    this.onScoreChange?.(0);
    this.onCoinChange?.(0);
  }

  private setState(newState: GameState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  // --- Fixed-Timestep Simulation Update Loop ---

  public update(rawDt: number) {
    // Clamp frame delta to max 0.1s to prevent giant jumps after lag or tab switch
    const clampedDt = Math.min(rawDt, 0.1);

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= clampedDt;
      return;
    }

    // Screen shake decay
    if (this.screenShakeTrauma > 0) {
      this.screenShakeTrauma = Math.max(0, this.screenShakeTrauma - clampedDt * 2.5);
    }

    // Update non-physics visuals with real delta time
    this.updateClouds(clampedDt);
    this.updateAlerts(clampedDt);
    this.updateParticles(clampedDt);

    // Elastic return for squash/stretch
    this.squashScaleX += (1 - this.squashScaleX) * clampedDt * 10;
    this.squashScaleY += (1 - this.squashScaleY) * clampedDt * 10;

    // Wing flapping
    const flapSpeed = this.state === 'PLAYING' ? 16 : 7;
    this.wingPhase += clampedDt * flapSpeed;

    if (this.state === 'MENU' || this.state === 'READY') {
      const floatOffset = Math.sin(this.wingPhase * 0.5) * 0.6;
      this.playerY += floatOffset;
      this.tiltAngle = floatOffset * 0.06;
      this.groundOffset = (this.groundOffset + 1.2 * clampedDt * 60) % 40;
      return;
    }

    if (this.state === 'PAUSED') {
      return;
    }

    if (this.state === 'CRASHED') {
      this.velocityY += PHYSICS.GRAVITY * 1.5;
      this.playerY += this.velocityY * clampedDt * 60;
      this.tiltAngle += clampedDt * 7;

      const groundY = this.height - PHYSICS.GROUND_HEIGHT - PHYSICS.HEAD_RADIUS;
      if (this.playerY >= groundY) {
        this.playerY = groundY;
        this.finishRun();
      }
      return;
    }

    if (this.state === 'PLAYING') {
      // Accumulate time for deterministic fixed physics steps (60 steps/sec)
      this.accumulator += clampedDt;
      let steps = 0;
      while (this.accumulator >= this.FIXED_DT && steps < 3) {
        this.stepFixedPhysics(this.FIXED_DT);
        this.accumulator -= this.FIXED_DT;
        steps++;
      }
      if (this.accumulator > this.FIXED_DT) {
        this.accumulator = 0;
      }
    }
  }

  // Pure fixed 60Hz physics step (guarantees identical jump and fall across all devices)
  private stepFixedPhysics(dt: number) {
    // 1. Gravity & Velocity Update
    this.velocityY += PHYSICS.GRAVITY;
    if (this.velocityY > PHYSICS.MAX_FALL_VELOCITY) {
      this.velocityY = PHYSICS.MAX_FALL_VELOCITY;
    }
    if (this.velocityY < PHYSICS.MAX_RISE_VELOCITY) {
      this.velocityY = PHYSICS.MAX_RISE_VELOCITY;
    }

    this.playerY += this.velocityY;

    // Smooth tilt responsive to velocity
    const targetTilt =
      this.velocityY < 0
        ? Math.max(-0.45, this.velocityY * 0.065)
        : Math.min(0.75, this.velocityY * 0.08);
    this.tiltAngle += (targetTilt - this.tiltAngle) * 0.15;

    // Soft ceiling clamp
    if (this.playerY < PHYSICS.CEILING_OFFSET + PHYSICS.HEAD_RADIUS) {
      this.playerY = PHYSICS.CEILING_OFFSET + PHYSICS.HEAD_RADIUS;
      this.velocityY = 0;
    }

    // Ground collision
    const groundY = this.height - PHYSICS.GROUND_HEIGHT - PHYSICS.HEAD_RADIUS;
    if (this.playerY >= groundY) {
      this.playerY = groundY;
      this.triggerCrash('ground');
      return;
    }

    // 2. Obstacles & Ground Movement
    this.groundOffset = (this.groundOffset + this.currentSpeed) % 40;
    this.spawnObstaclesIfNeeded();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.currentSpeed;

      // Scoring
      if (!obs.scored && obs.x + obs.width < this.playerX) {
        obs.scored = true;
        this.score += 1;
        this.obstaclesCleared += 1;
        sounds.playScore();
        this.onScoreChange?.(this.score);

        if (
          !this.isNewBestRun &&
          this.bestScoreAtStart > 0 &&
          this.score > this.bestScoreAtStart
        ) {
          this.isNewBestRun = true;
          sounds.playYeahVoice();
          this.spawnNewBestCelebration();
        }

        this.updateDifficulty(this.score);
      }

      // Collision
      if (this.checkObstacleCollision(obs)) {
        this.triggerCrash('pipe');
        return;
      }

      // Despawn
      if (obs.x + obs.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }

    // 3. Collectible Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.x -= this.currentSpeed;
      coin.rotation += 0.06;

      const dx = this.playerX - coin.x;
      const dy = this.playerY - coin.y;
      const distSq = dx * dx + dy * dy;
      const minDist = PHYSICS.HEAD_RADIUS + coin.radius;

      if (distSq < minDist * minDist) {
        this.coins.splice(i, 1);
        this.coinsInRun += coin.value;
        sounds.playCoin();
        this.onCoinChange?.(this.coinsInRun);

        this.floatingAlerts.push({
          text: `+${coin.value} 🪙`,
          x: coin.x,
          y: coin.y - 10,
          color: '#fbbf24',
          alpha: 1,
          vy: -1.6,
        });

        // 4 sparkle particles
        if (this.particles.length < 32) {
          for (let p = 0; p < 4; p++) {
            const angle = (p / 4) * Math.PI * 2;
            this.particles.push({
              x: coin.x,
              y: coin.y,
              vx: Math.cos(angle) * 2,
              vy: Math.sin(angle) * 2,
              size: 3,
              color: '#fbbf24',
              alpha: 1,
              decay: 0.06,
              shape: 'star',
            });
          }
        }
      } else if (coin.x < -40) {
        this.coins.splice(i, 1);
      }
    }
  }

  private updateDifficulty(score: number) {
    let tier = DIFFICULTY_TIERS[0];
    for (const t of DIFFICULTY_TIERS) {
      if (score >= t.minScore && score <= t.maxScore) {
        tier = t;
        break;
      }
    }
    this.currentSpeed = tier.speed;
    this.currentGap = tier.gap;
  }

  private spawnObstaclesIfNeeded() {
    const minSafeX = this.width + 50;
    const lastObs = this.obstacles[this.obstacles.length - 1];

    if (!lastObs || lastObs.x < this.width - PHYSICS.BASE_SPACING) {
      const spawnX = lastObs
        ? lastObs.x + PHYSICS.BASE_SPACING
        : Math.max(minSafeX, this.width * 0.95);

      const usableHeight =
        this.height - PHYSICS.GROUND_HEIGHT - this.currentGap - 120;
      const topHeight = 60 + Math.random() * usableHeight;
      const bottomY = topHeight + this.currentGap;

      const newObs: ObstaclePipe = {
        id: this.nextObstacleId++,
        x: spawnX,
        topHeight,
        bottomY,
        gap: this.currentGap,
        width: PHYSICS.PIPE_WIDTH,
        passed: false,
        scored: false,
      };
      this.obstacles.push(newObs);

      // Spawn coin with 60% probability
      if (Math.random() < 0.6) {
        const coinY = topHeight + this.currentGap * (0.35 + Math.random() * 0.3);
        this.coins.push({
          id: this.nextCoinId++,
          x: spawnX + PHYSICS.PIPE_WIDTH * 0.5,
          y: coinY,
          radius: 12,
          collected: false,
          rotation: 0,
          value: 1,
        });
      }
    }
  }

  private checkObstacleCollision(obs: ObstaclePipe): boolean {
    const px = this.playerX;
    const py = this.playerY;
    const r = PHYSICS.HEAD_RADIUS * 0.88;

    const pipeLeft = obs.x;
    const pipeRight = obs.x + obs.width;

    if (px + r > pipeLeft && px - r < pipeRight) {
      if (py - r < obs.topHeight || py + r > obs.bottomY) {
        return true;
      }
    }
    return false;
  }

  private triggerCrash(cause: 'pipe' | 'ground') {
    if (this.state !== 'PLAYING') return;

    this.setState('CRASHED');
    this.screenShakeTrauma = 0.8;
    this.hitstopTimer = 0.05;

    sounds.playHit();
    sounds.playTumble();

    if (navigator.vibrate) {
      try {
        navigator.vibrate([35, 25, 60]);
      } catch {
        // Ignore
      }
    }

    // 8 impact particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.particles.push({
        x: this.playerX,
        y: this.playerY,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        size: 3.5,
        color: i % 2 === 0 ? '#ef4444' : '#fbbf24',
        alpha: 1,
        decay: 0.04,
        shape: 'star',
      });
    }

    if (cause === 'ground') {
      this.finishRun();
    }
  }

  private finishRun() {
    this.setState('GAMEOVER');
    this.runDurationSec = (Date.now() - this.runStartTime) / 1000;

    const result = storage.recordRun(
      this.score,
      this.coinsInRun,
      this.obstaclesCleared,
      this.currentCharacter.id,
      this.runDurationSec
    );

    if (result.isNewBest) {
      sounds.playYeahVoice();
      this.spawnNewBestCelebration();
    }

    this.onGameOver?.({
      score: this.score,
      coinsEarned: this.coinsInRun,
      isNewBest: result.isNewBest,
      previousBest: result.previousBest,
    });
  }

  private spawnNewBestCelebration() {
    this.floatingAlerts.push({
      text: '★ NEW BEST! ★',
      x: this.playerX,
      y: this.playerY - 40,
      color: '#fde047',
      alpha: 1,
      vy: -1.2,
    });
  }

  private updateClouds(dt: number) {
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * dt * 60;
      if (cloud.x < -140) {
        cloud.x = this.width + 40 + Math.random() * 60;
        cloud.y = 30 + Math.random() * 200;
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateAlerts(dt: number) {
    for (let i = this.floatingAlerts.length - 1; i >= 0; i--) {
      const a = this.floatingAlerts[i];
      a.y += a.vy * dt * 60;
      a.alpha -= dt * 2.2;
      if (a.alpha <= 0) {
        this.floatingAlerts.splice(i, 1);
      }
    }
  }

  // --- Optimized Canvas Rendering (Zero Per-Frame Gradients & Zero ShadowBlur) ---

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Screen Shake
    if (this.screenShakeTrauma > 0) {
      const shakeAmt = this.screenShakeTrauma * this.screenShakeTrauma * 8;
      ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
    }

    // 1. Sky & Sun (Cached gradient)
    this.renderSky(ctx);

    // 2. Clouds
    this.renderClouds(ctx);

    // 3. Backdrop Silhouette
    this.renderBackdropSilhouette(ctx);

    // 4. Obstacle Pipes (Fast 2-tone rects with zero gradient allocations)
    this.renderObstacles(ctx);

    // 5. Coins
    this.renderCoins(ctx);

    // 6. Particles
    this.renderParticles(ctx);

    // 7. Ground
    this.renderGround(ctx);

    // 8. Player Hasnain
    this.renderPlayer(ctx);

    // 9. Alerts
    this.renderAlerts(ctx);

    ctx.restore();
  }

  private renderSky(ctx: CanvasRenderingContext2D) {
    // Only re-create gradient if canvas height changed
    if (!this.cachedSkyGrad || this.cachedSkyHeight !== this.height) {
      this.cachedSkyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      this.cachedSkyGrad.addColorStop(0, '#38bdf8');
      this.cachedSkyGrad.addColorStop(0.55, '#7dd3fc');
      this.cachedSkyGrad.addColorStop(1, '#bae6fd');
      this.cachedSkyHeight = this.height;
    }

    ctx.fillStyle = this.cachedSkyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Fast sun with outer halo
    const sunX = this.width * 0.82;
    const sunY = 85;

    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderClouds(ctx: CanvasRenderingContext2D) {
    for (const c of this.clouds) {
      ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
      const r = 22 * c.scale;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.arc(c.x + r * 0.85, c.y - r * 0.25, r * 1.05, 0, Math.PI * 2);
      ctx.arc(c.x + r * 1.7, c.y, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderBackdropSilhouette(ctx: CanvasRenderingContext2D) {
    const baseY = this.height - PHYSICS.GROUND_HEIGHT - 32;
    ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, baseY + 32);
    ctx.lineTo(0, baseY);
    ctx.quadraticCurveTo(this.width * 0.25, baseY - 35, this.width * 0.5, baseY - 12);
    ctx.quadraticCurveTo(this.width * 0.75, baseY + 8, this.width, baseY - 25);
    ctx.lineTo(this.width, baseY + 32);
    ctx.closePath();
    ctx.fill();
  }

  // Fast solid fill with specular highlights: zero gradient allocations!
  private renderObstacles(ctx: CanvasRenderingContext2D) {
    const rimH = 22;
    const rimOverhang = 4;

    for (const obs of this.obstacles) {
      const w = obs.width;
      const bottomH = this.height - PHYSICS.GROUND_HEIGHT - obs.bottomY;

      // --- TOP PIPE ---
      // Main Body
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(obs.x, 0, w, obs.topHeight - rimH);

      // Left shadow stripe
      ctx.fillStyle = '#15803d';
      ctx.fillRect(obs.x, 0, 8, obs.topHeight - rimH);
      // Right edge shadow
      ctx.fillRect(obs.x + w - 8, 0, 8, obs.topHeight - rimH);
      // Specular highlight line
      ctx.fillStyle = '#86efac';
      ctx.fillRect(obs.x + 12, 0, 6, obs.topHeight - rimH);

      // Top Pipe Rim Cap
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(obs.x - rimOverhang, obs.topHeight - rimH, w + rimOverhang * 2, rimH);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(obs.x - rimOverhang, obs.topHeight - rimH, 8, rimH);
      ctx.fillRect(obs.x + w + rimOverhang - 8, obs.topHeight - rimH, 8, rimH);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(obs.x + 12, obs.topHeight - rimH, 6, rimH);

      // Outline
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, 0, w, obs.topHeight - rimH);
      ctx.strokeRect(obs.x - rimOverhang, obs.topHeight - rimH, w + rimOverhang * 2, rimH);

      // --- BOTTOM PIPE ---
      // Bottom Pipe Rim Cap
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(obs.x - rimOverhang, obs.bottomY, w + rimOverhang * 2, rimH);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(obs.x - rimOverhang, obs.bottomY, 8, rimH);
      ctx.fillRect(obs.x + w + rimOverhang - 8, obs.bottomY, 8, rimH);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(obs.x + 12, obs.bottomY, 6, rimH);

      // Bottom Pipe Body
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(obs.x, obs.bottomY + rimH, w, bottomH - rimH);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(obs.x, obs.bottomY + rimH, 8, bottomH - rimH);
      ctx.fillRect(obs.x + w - 8, obs.bottomY + rimH, 8, bottomH - rimH);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(obs.x + 12, obs.bottomY + rimH, 6, bottomH - rimH);

      // Outlines
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x - rimOverhang, obs.bottomY, w + rimOverhang * 2, rimH);
      ctx.strokeRect(obs.x, obs.bottomY + rimH, w, bottomH - rimH + 4);
    }
  }

  private renderCoins(ctx: CanvasRenderingContext2D) {
    for (const coin of this.coins) {
      ctx.save();
      ctx.translate(coin.x, coin.y);

      const cosScale = Math.cos(coin.rotation);
      ctx.scale(Math.abs(cosScale) * 0.85 + 0.15, 1);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 0);

      ctx.restore();
    }
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    const gy = this.height - PHYSICS.GROUND_HEIGHT;
    const gh = PHYSICS.GROUND_HEIGHT;

    // Grass strip
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, gy, this.width, 14);
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(this.width, gy);
    ctx.stroke();

    // Dirt base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, gy + 14, this.width, gh - 14);

    // Fast scrolling ground diagonal marks
    ctx.fillStyle = '#92400e';
    for (let x = -this.groundOffset; x < this.width + 30; x += 30) {
      ctx.fillRect(x, gy + 18, 12, 10);
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.playerX, this.playerY);
    ctx.scale(this.squashScaleX, this.squashScaleY);
    ctx.translate(-this.playerX, -this.playerY);

    const radius =
      this.state === 'MENU'
        ? PHYSICS.HEAD_RADIUS * 1.35
        : PHYSICS.HEAD_RADIUS;

    drawHasnainCharacter(
      ctx,
      this.currentCharacter,
      this.playerX,
      this.playerY,
      radius,
      this.wingPhase,
      this.tiltAngle,
      this.customHeadImg
    );

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Fast text alert rendering with crisp 1px offset shadow instead of heavy blur
  private renderAlerts(ctx: CanvasRenderingContext2D) {
    for (const a of this.floatingAlerts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, a.alpha));
      ctx.font = 'bold 15px Fredoka, sans-serif';
      ctx.textAlign = 'center';

      // 1px crisp outline shadow
      ctx.fillStyle = '#0f172a';
      ctx.fillText(a.text, a.x + 1, a.y + 1);

      // Main color
      ctx.fillStyle = a.color;
      ctx.fillText(a.text, a.x, a.y);
      ctx.restore();
    }
  }
}
