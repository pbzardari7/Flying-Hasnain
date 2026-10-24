export type GameState =
  | 'MENU'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'CRASHED'
  | 'GAMEOVER';

export type ActiveModal =
  | null
  | 'SHOP'
  | 'PREVIEW'
  | 'MISSIONS'
  | 'ACHIEVEMENTS'
  | 'PROFILE'
  | 'STATS'
  | 'SETTINGS'
  | 'HOW_TO_PLAY'
  | 'DAILY_REWARD'
  | 'ABOUT'
  | 'LEADERBOARD';

export interface PlayerCharacter {
  id: string;
  name: string;
  tagline: string;
  price: number;
  unlocked: boolean;
  category: 'classic' | 'fun' | 'elemental' | 'futuristic' | 'mythic' | 'custom';
  accentColor: string;
  glowColor?: string;
  wingColor: string;
  wingBorder: string;
  description: string;
  customImageUrl?: string;
}

export interface ObstaclePipe {
  id: number;
  x: number;
  topHeight: number;
  bottomY: number;
  gap: number;
  width: number;
  passed: boolean;
  scored: boolean;
  colorTheme?: 'classic' | 'cloud' | 'sunset' | 'space' | 'gold';
}

export interface CollectibleCoin {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  rotation: number;
  value: number;
}

export interface VisualParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'sparkle' | 'feather' | 'star' | 'coin';
  rotation?: number;
  rotationSpeed?: number;
}

export interface BackgroundCloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
  type: number;
}

export interface RunRecord {
  id: string;
  score: number;
  coinsEarned: number;
  characterId: string;
  characterName: string;
  date: string;
  timestamp: number;
  obstaclesCleared: number;
  durationSeconds: number;
}

export interface PlayerStats {
  totalGames: number;
  bestScore: number;
  totalCoins: number;
  currentCoins: number;
  totalObstaclesCleared: number;
  highestCoinsInRun: number;
  totalPlayTimeSeconds: number;
  equippedCharacterId: string;
  favoriteCharacterId: string;
  characterUsageCounts: Record<string, number>;
  recentRuns: RunRecord[];
  playerName: string;
  customAvatarDataUrl?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  type:
    | 'FIRST_GAME'
    | 'PASS_OBSTACLES_RUN'
    | 'TOTAL_COINS'
    | 'SCORE_10'
    | 'SCORE_20'
    | 'GAMES_5'
    | 'TOTAL_COINS_25'
    | 'BEAT_BEST'
    | 'UNLOCK_COSMETIC'
    | 'TOTAL_OBSTACLES_30';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  dateUnlocked?: string;
}

export interface DailyRewardState {
  currentDay: number; // 1 to 7
  lastClaimDateString: string | null;
  streak: number;
  claimedToday: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  voiceoverEnabled: boolean; // Hasnain's "Yeah!" audio sample
  musicVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  particlesEnabled: boolean;
  vibrationEnabled: boolean;
  highContrastPipes: boolean;
}
