import {
  Achievement,
  DailyRewardState,
  GameSettings,
  Mission,
  PlayerCharacter,
  PlayerStats,
  RunRecord,
} from './types';
import {
  CHARACTER_CATALOG,
  drawHasnainCharacter,
} from './skins';
import {
  DAILY_REWARD_DAYS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_MISSIONS,
} from './constants';

const STATS_KEY = 'flying_hasnain_stats_v1';
const MISSIONS_KEY = 'flying_hasnain_missions_v1';
const ACHIEVEMENTS_KEY = 'flying_hasnain_achievements_v1';
const DAILY_KEY = 'flying_hasnain_daily_v1';
const SETTINGS_KEY = 'flying_hasnain_settings_v1';
const UNLOCKED_CHARS_KEY = 'flying_hasnain_unlocked_chars_v1';
const CUSTOM_HEAD_KEY = 'flying_hasnain_custom_head_v1';

export const defaultSettings: GameSettings = {
  soundEnabled: true,
  voiceoverEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.85,
  screenShake: true,
  particlesEnabled: true,
  vibrationEnabled: true,
  highContrastPipes: false,
};

export const defaultStats: PlayerStats = {
  totalGames: 0,
  bestScore: 0,
  totalCoins: 0,
  currentCoins: 0,
  totalObstaclesCleared: 0,
  highestCoinsInRun: 0,
  totalPlayTimeSeconds: 0,
  equippedCharacterId: 'classic',
  favoriteCharacterId: 'classic',
  characterUsageCounts: { classic: 0 },
  recentRuns: [],
  playerName: 'Hasnain Fan',
};

class StorageService {
  private stats: PlayerStats = { ...defaultStats };
  private missions: Mission[] = [...INITIAL_MISSIONS];
  private achievements: Achievement[] = [...INITIAL_ACHIEVEMENTS];
  private daily: DailyRewardState = {
    currentDay: 1,
    lastClaimDateString: null,
    streak: 0,
    claimedToday: false,
  };
  private settings: GameSettings = { ...defaultSettings };
  private unlockedCharacters: Set<string> = new Set(['classic']);
  private customHeadDataUrl: string | null = null;
  private customHeadImage: HTMLImageElement | null = null;

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    if (typeof window === 'undefined') return;
    try {
      // 1. Stats
      const savedStats = localStorage.getItem(STATS_KEY);
      if (savedStats) {
        this.stats = { ...defaultStats, ...JSON.parse(savedStats) };
      }

      // 2. Unlocked skins
      const savedChars = localStorage.getItem(UNLOCKED_CHARS_KEY);
      if (savedChars) {
        const arr = JSON.parse(savedChars);
        this.unlockedCharacters = new Set(arr);
      }
      this.unlockedCharacters.add('classic'); // always free

      // 3. Missions
      const savedMissions = localStorage.getItem(MISSIONS_KEY);
      if (savedMissions) {
        const loaded: Mission[] = JSON.parse(savedMissions);
        // Merge with initial missions to support new missions seamlessly
        this.missions = INITIAL_MISSIONS.map((initM) => {
          const found = loaded.find((m) => m.id === initM.id);
          return found ? { ...initM, ...found } : initM;
        });
      }

      // 4. Achievements
      const savedAch = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (savedAch) {
        const loaded: Achievement[] = JSON.parse(savedAch);
        this.achievements = INITIAL_ACHIEVEMENTS.map((initA) => {
          const found = loaded.find((a) => a.id === initA.id);
          return found ? { ...initA, ...found } : initA;
        });
      }

      // 5. Daily Reward
      const savedDaily = localStorage.getItem(DAILY_KEY);
      if (savedDaily) {
        this.daily = JSON.parse(savedDaily);
      }
      this.evaluateDailyStatus();

      // 6. Settings
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
      }

      // 7. Custom Head image
      const savedHead = localStorage.getItem(CUSTOM_HEAD_KEY);
      if (savedHead) {
        this.customHeadDataUrl = savedHead;
        this.loadCustomHeadImage(savedHead);
      }
    } catch (err) {
      console.warn('Error loading storage, using clean defaults:', err);
    }
  }

  private loadCustomHeadImage(dataUrl: string) {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      this.customHeadImage = img;
    };
  }

  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public getMissions(): Mission[] {
    return [...this.missions];
  }

  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public getDailyState(): DailyRewardState {
    this.evaluateDailyStatus();
    return { ...this.daily };
  }

  public getUnlockedCharacterIds(): string[] {
    return Array.from(this.unlockedCharacters);
  }

  public getCustomHeadImage(): HTMLImageElement | null {
    return this.customHeadImage;
  }

  public getCustomHeadDataUrl(): string | null {
    return this.customHeadDataUrl;
  }

  public setCustomHeadDataUrl(dataUrl: string | null) {
    this.customHeadDataUrl = dataUrl;
    if (dataUrl) {
      localStorage.setItem(CUSTOM_HEAD_KEY, dataUrl);
      this.loadCustomHeadImage(dataUrl);
    } else {
      localStorage.removeItem(CUSTOM_HEAD_KEY);
      this.customHeadImage = null;
    }
  }

  public saveSettings(newSettings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
  }

  public setPlayerName(name: string) {
    this.stats.playerName = name.trim() || 'Hasnain Fan';
    this.saveStats();
  }

  public setEquippedCharacter(id: string) {
    this.stats.equippedCharacterId = id;
    this.saveStats();
  }

  public setFavoriteCharacter(id: string) {
    this.stats.favoriteCharacterId = id;
    this.saveStats();
  }

  public unlockCharacter(id: string, price: number): boolean {
    if (this.unlockedCharacters.has(id)) return true;
    if (this.stats.currentCoins < price) return false;

    // Deduct coins atomically
    this.stats.currentCoins -= price;
    this.unlockedCharacters.add(id);
    localStorage.setItem(
      UNLOCKED_CHARS_KEY,
      JSON.stringify(Array.from(this.unlockedCharacters))
    );
    this.saveStats();

    // Mission check: UNLOCK_COSMETIC
    this.updateMissionProgress('UNLOCK_COSMETIC', 1);

    // Achievement check: 5 characters unlocked
    if (this.unlockedCharacters.size >= 5) {
      this.unlockAchievement('ach_collector');
    }

    return true;
  }

  // Record a completed run
  public recordRun(
    score: number,
    coinsInRun: number,
    obstaclesCleared: number,
    charId: string,
    durationSec: number
  ): { isNewBest: boolean; previousBest: number } {
    const previousBest = this.stats.bestScore;
    const isNewBest = score > previousBest;

    this.stats.totalGames += 1;
    this.stats.totalCoins += coinsInRun;
    this.stats.currentCoins += coinsInRun;
    this.stats.totalObstaclesCleared += obstaclesCleared;
    this.stats.totalPlayTimeSeconds += Math.round(durationSec);

    if (score > this.stats.bestScore) {
      this.stats.bestScore = score;
    }
    if (coinsInRun > this.stats.highestCoinsInRun) {
      this.stats.highestCoinsInRun = coinsInRun;
    }

    // Usage tracking
    this.stats.characterUsageCounts[charId] =
      (this.stats.characterUsageCounts[charId] || 0) + 1;

    // Run record
    const charObj = CHARACTER_CATALOG.find((c) => c.id === charId);
    const newRecord: RunRecord = {
      id: 'run_' + Date.now(),
      score,
      coinsEarned: coinsInRun,
      characterId: charId,
      characterName: charObj ? charObj.name : 'Custom Hasnain',
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      obstaclesCleared,
      durationSeconds: Math.round(durationSec),
    };

    // Keep latest 20 runs
    this.stats.recentRuns = [newRecord, ...this.stats.recentRuns.slice(0, 19)];
    this.saveStats();

    // --- Update Missions from real gameplay ---
    this.updateMissionProgress('FIRST_GAME', 1);
    this.updateMissionProgress('GAMES_5', this.stats.totalGames);
    this.updateMissionProgress('TOTAL_COINS', this.stats.totalCoins);
    this.updateMissionProgress('TOTAL_COINS_25', this.stats.totalCoins);
    this.updateMissionProgress('TOTAL_OBSTACLES_30', this.stats.totalObstaclesCleared);

    if (obstaclesCleared >= 5) {
      this.updateMissionProgress('PASS_OBSTACLES_RUN', obstaclesCleared);
    }
    if (score >= 10) {
      this.updateMissionProgress('SCORE_10', score);
    }
    if (score >= 20) {
      this.updateMissionProgress('SCORE_20', score);
    }
    if (isNewBest && previousBest > 0) {
      this.updateMissionProgress('BEAT_BEST', 1);
    }

    // --- Update Achievements ---
    this.unlockAchievement('ach_first_flight');
    if (this.stats.totalObstaclesCleared >= 10) {
      this.unlockAchievement('ach_getting_started');
    }
    if (this.stats.totalCoins >= 50) {
      this.unlockAchievement('ach_coin_collector');
    }
    if (score >= 10) {
      this.unlockAchievement('ach_sky_rookie');
    }
    if (score >= 25) {
      this.unlockAchievement('ach_sky_explorer');
    }
    if (score >= 50) {
      this.unlockAchievement('ach_high_flyer');
    }
    if (score >= 100) {
      this.unlockAchievement('ach_sky_legend');
    }
    if (this.stats.totalGames >= 25) {
      this.unlockAchievement('ach_persistent');
    }

    return { isNewBest, previousBest };
  }

  private updateMissionProgress(
    type: Mission['type'],
    val: number
  ) {
    let changed = false;
    this.missions = this.missions.map((m) => {
      if (m.type === type && !m.completed) {
        const nextVal = Math.max(m.current, val);
        const completed = nextVal >= m.target;
        if (nextVal !== m.current || completed !== m.completed) {
          changed = true;
          return { ...m, current: Math.min(nextVal, m.target), completed };
        }
      }
      return m;
    });

    if (changed) {
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(this.missions));
    }
  }

  public claimMissionReward(missionId: string): number {
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return 0;

    mission.claimed = true;
    this.stats.currentCoins += mission.reward;
    this.stats.totalCoins += mission.reward;
    this.saveStats();
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(this.missions));
    return mission.reward;
  }

  public unlockAchievement(id: string) {
    const ach = this.achievements.find((a) => a.id === id);
    if (!ach || ach.unlocked) return;

    ach.unlocked = true;
    ach.dateUnlocked = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
  }

  // Daily Reward logic
  private evaluateDailyStatus() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (!this.daily.lastClaimDateString) {
      this.daily.claimedToday = false;
      return;
    }

    if (this.daily.lastClaimDateString === today) {
      this.daily.claimedToday = true;
      return;
    }

    // Check difference in days
    const lastDate = new Date(this.daily.lastClaimDateString);
    const currentDate = new Date(today);
    const diffTime = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      // consecutive day: ready to claim next day!
      this.daily.claimedToday = false;
    } else if (diffDays > 1) {
      // Streak broken, reset to day 1
      this.daily.currentDay = 1;
      this.daily.streak = 0;
      this.daily.claimedToday = false;
    }
  }

  public claimDailyReward(): { coins: number; nextDay: number } | null {
    this.evaluateDailyStatus();
    if (this.daily.claimedToday) return null;

    const today = new Date().toISOString().slice(0, 10);
    const dayIndex = Math.min(Math.max(this.daily.currentDay, 1), 7);
    const rewardConfig = DAILY_REWARD_DAYS[dayIndex - 1];
    const rewardCoins = rewardConfig.reward;

    // Credit coins
    this.stats.currentCoins += rewardCoins;
    this.stats.totalCoins += rewardCoins;

    // Advance daily state
    this.daily.lastClaimDateString = today;
    this.daily.claimedToday = true;
    this.daily.streak += 1;
    this.daily.currentDay = dayIndex >= 7 ? 1 : dayIndex + 1;

    this.saveStats();
    localStorage.setItem(DAILY_KEY, JSON.stringify(this.daily));
    return { coins: rewardCoins, nextDay: this.daily.currentDay };
  }

  public resetAllProgress() {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(MISSIONS_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    localStorage.removeItem(DAILY_KEY);
    localStorage.removeItem(UNLOCKED_CHARS_KEY);
    localStorage.removeItem(CUSTOM_HEAD_KEY);
    this.stats = { ...defaultStats };
    this.missions = [...INITIAL_MISSIONS];
    this.achievements = [...INITIAL_ACHIEVEMENTS];
    this.daily = { currentDay: 1, lastClaimDateString: null, streak: 0, claimedToday: false };
    this.unlockedCharacters = new Set(['classic']);
    this.customHeadDataUrl = null;
    this.customHeadImage = null;
  }

  private saveStats() {
    localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
  }
}

export const storage = new StorageService();
