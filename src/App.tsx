import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { ActiveModal, GameState, PlayerCharacter, PlayerStats } from './game/types';
import { storage } from './game/storage';
import { sounds } from './game/sound';
import { CHARACTER_CATALOG } from './game/skins';

// UI Components
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { CharacterShopModal } from './components/CharacterShopModal';
import { CharacterPreviewModal } from './components/CharacterPreviewModal';
import { MissionsModal } from './components/MissionsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { ProfileModal } from './components/ProfileModal';
import { StatisticsModal } from './components/StatisticsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AboutModal } from './components/AboutModal';

export default function App() {
  // Engine singleton
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // React State Mirrors
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState<number>(0);
  const [coinsInRun, setCoinsInRun] = useState<number>(0);
  const [gameOverSummary, setGameOverSummary] = useState<{
    score: number;
    coinsEarned: number;
    isNewBest: boolean;
    previousBest: number;
  } | null>(null);

  // Active navigation modal
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [previewCharIndex, setPreviewCharIndex] = useState<number>(0);

  // Storage State
  const [stats, setStats] = useState<PlayerStats>(storage.getStats());
  const [unlockedIds, setUnlockedIds] = useState<string[]>(
    storage.getUnlockedCharacterIds()
  );
  const [equippedId, setEquippedId] = useState<string>(
    storage.getStats().equippedCharacterId || 'classic'
  );
  const [customHeadDataUrl, setCustomHeadDataUrl] = useState<string | null>(
    storage.getCustomHeadDataUrl()
  );
  const [settings, setSettings] = useState(storage.getSettings());
  const [missions, setMissions] = useState(storage.getMissions());
  const [achievements, setAchievements] = useState(storage.getAchievements());
  const [dailyState, setDailyState] = useState(storage.getDailyState());

  const syncStateFromStorage = useCallback(() => {
    const s = storage.getStats();
    setStats(s);
    setUnlockedIds(storage.getUnlockedCharacterIds());
    setEquippedId(s.equippedCharacterId || 'classic');
    setCustomHeadDataUrl(storage.getCustomHeadDataUrl());
    setMissions(storage.getMissions());
    setAchievements(storage.getAchievements());
    setDailyState(storage.getDailyState());
    setSettings(storage.getSettings());
    engine.syncEquippedCharacter();
  }, [engine]);

  // Hook up Engine Callbacks
  useEffect(() => {
    sounds.setSettings(
      settings.soundEnabled,
      settings.voiceoverEnabled,
      settings.sfxVolume
    );

    engine.onStateChange = (nextState) => {
      setGameState(nextState);
    };

    engine.onScoreChange = (s) => {
      setScore(s);
    };

    engine.onCoinChange = (c) => {
      setCoinsInRun(c);
    };

    engine.onGameOver = (summary) => {
      setGameOverSummary(summary);
      syncStateFromStorage();
    };

    return () => {
      engine.onStateChange = undefined;
      engine.onScoreChange = undefined;
      engine.onCoinChange = undefined;
      engine.onGameOver = undefined;
    };
  }, [engine, settings, syncStateFromStorage]);

  // Global Keyboard Controls (Space, ArrowUp, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
          return;
        }
        if (gameState === 'PLAYING') {
          engine.pause();
          return;
        }
        if (gameState === 'PAUSED') {
          engine.resume();
          return;
        }
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        if (e.target === document.body || (e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }

        if (activeModal) return;

        if (gameState === 'MENU') {
          engine.startReady();
          return;
        }

        if (gameState === 'GAMEOVER') {
          setGameOverSummary(null);
          engine.restart();
          return;
        }

        if (gameState === 'READY' || gameState === 'PLAYING') {
          engine.flap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, gameState, activeModal]);

  // Handlers
  const handleCanvasTap = () => {
    if (activeModal) return;

    if (gameState === 'MENU') {
      engine.startReady();
      return;
    }

    if (gameState === 'GAMEOVER') {
      setGameOverSummary(null);
      engine.restart();
      return;
    }

    if (gameState === 'READY' || gameState === 'PLAYING') {
      engine.flap();
    }
  };

  const handleStartPlay = () => {
    setActiveModal(null);
    setGameOverSummary(null);
    engine.startReady();
  };

  const handleTryAgain = () => {
    setGameOverSummary(null);
    engine.restart();
  };

  const handleHome = () => {
    setGameOverSummary(null);
    setActiveModal(null);
    engine.quitToMenu();
    syncStateFromStorage();
  };

  const handleEquipChar = (id: string) => {
    storage.setEquippedCharacter(id);
    syncStateFromStorage();
  };

  const handleBuyChar = (id: string, price: number) => {
    const success = storage.unlockCharacter(id, price);
    if (success) {
      storage.setEquippedCharacter(id);
      syncStateFromStorage();
    }
  };

  const handleSaveCustomHead = (dataUrl: string | null) => {
    storage.setCustomHeadDataUrl(dataUrl);
    syncStateFromStorage();
  };

  const handleClaimMission = (id: string) => {
    storage.claimMissionReward(id);
    syncStateFromStorage();
  };

  const handleClaimDaily = () => {
    storage.claimDailyReward();
    syncStateFromStorage();
  };

  const handleUpdatePlayerName = (name: string) => {
    storage.setPlayerName(name);
    syncStateFromStorage();
  };

  const handleSetFavorite = (id: string) => {
    storage.setFavoriteCharacter(id);
    syncStateFromStorage();
  };

  const handleToggleSound = () => {
    const newSoundState = !settings.soundEnabled;
    storage.saveSettings({ soundEnabled: newSoundState });
    setSettings((prev) => ({ ...prev, soundEnabled: newSoundState }));
    sounds.setSettings(newSoundState, settings.voiceoverEnabled, settings.sfxVolume);
  };

  const handleToggleVoice = () => {
    const newVoiceState = !settings.voiceoverEnabled;
    storage.saveSettings({ voiceoverEnabled: newVoiceState });
    setSettings((prev) => ({ ...prev, voiceoverEnabled: newVoiceState }));
    sounds.setSettings(settings.soundEnabled, newVoiceState, settings.sfxVolume);
  };

  const handleSaveSettings = (newSettings: Partial<typeof settings>) => {
    storage.saveSettings(newSettings);
    syncStateFromStorage();
  };

  const handleResetProgress = () => {
    storage.resetAllProgress();
    syncStateFromStorage();
    setActiveModal(null);
    engine.quitToMenu();
  };

  const equippedChar: PlayerCharacter =
    CHARACTER_CATALOG.find((c) => c.id === equippedId) || CHARACTER_CATALOG[0];

  const unclaimedMissionsCount = missions.filter(
    (m) => m.completed && !m.claimed
  ).length;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-sky-900 select-none flex items-center justify-center">
      {/* Main Responsive Canvas (React.memo isolated) */}
      <GameCanvas
        engine={engine}
        gameState={gameState}
        onTap={handleCanvasTap}
      />

      {/* In-Game Ultra-Clean Score & Pause */}
      {(gameState === 'PLAYING' ||
        gameState === 'READY' ||
        gameState === 'PAUSED' ||
        gameState === 'CRASHED') && (
        <GameHUD
          score={score}
          coins={coinsInRun}
          onPause={() => engine.pause()}
        />
      )}

      {/* Clean, Modern Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          stats={stats}
          soundEnabled={settings.soundEnabled}
          unclaimedMissionsCount={unclaimedMissionsCount}
          onPlay={handleStartPlay}
          onOpenModal={(modal) => setActiveModal(modal)}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Pause Menu Overlay */}
      {gameState === 'PAUSED' && (
        <PauseModal
          score={score}
          coins={coinsInRun}
          settings={settings}
          onResume={() => engine.resume()}
          onRestart={() => engine.restart()}
          onQuitToMenu={handleHome}
          onToggleSound={handleToggleSound}
          onToggleVoice={handleToggleVoice}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && gameOverSummary && (
        <GameOverModal
          score={gameOverSummary.score}
          coinsEarned={gameOverSummary.coinsEarned}
          isNewBest={gameOverSummary.isNewBest}
          previousBest={gameOverSummary.previousBest}
          onTryAgain={handleTryAgain}
          onHome={handleHome}
        />
      )}

      {/* --- ALL FEATURE MODALS PRESERVED & INTEGRATED --- */}

      {/* Character Shop Modal */}
      {activeModal === 'SHOP' && (
        <CharacterShopModal
          unlockedIds={unlockedIds}
          equippedId={equippedId}
          currentCoins={stats.currentCoins}
          customHeadDataUrl={customHeadDataUrl}
          onEquip={handleEquipChar}
          onBuy={handleBuyChar}
          onPreview={(idx) => {
            setPreviewCharIndex(idx);
            setActiveModal('PREVIEW');
          }}
          onSaveCustomHead={handleSaveCustomHead}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Character Preview Modal */}
      {activeModal === 'PREVIEW' && (
        <CharacterPreviewModal
          characters={CHARACTER_CATALOG}
          selectedIndex={previewCharIndex}
          unlockedIds={unlockedIds}
          equippedId={equippedId}
          currentCoins={stats.currentCoins}
          customHeadImg={storage.getCustomHeadImage()}
          onSelectIndex={(idx) => setPreviewCharIndex(idx)}
          onEquip={handleEquipChar}
          onBuy={handleBuyChar}
          onClose={() => setActiveModal('SHOP')}
        />
      )}

      {/* Missions Modal */}
      {activeModal === 'MISSIONS' && (
        <MissionsModal
          missions={missions}
          onClaim={handleClaimMission}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Achievements Modal */}
      {activeModal === 'ACHIEVEMENTS' && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Daily Reward Modal */}
      {activeModal === 'DAILY_REWARD' && (
        <DailyRewardModal
          dailyState={dailyState}
          onClaim={handleClaimDaily}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Profile Modal */}
      {activeModal === 'PROFILE' && (
        <ProfileModal
          stats={stats}
          equippedChar={equippedChar}
          unlockedCharacters={CHARACTER_CATALOG.filter((c) =>
            unlockedIds.includes(c.id)
          )}
          achievementsCount={achievements.filter((a) => a.unlocked).length}
          totalAchievements={achievements.length}
          onUpdateName={handleUpdatePlayerName}
          onSetFavorite={handleSetFavorite}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Statistics Modal */}
      {activeModal === 'STATS' && (
        <StatisticsModal stats={stats} onClose={() => setActiveModal(null)} />
      )}

      {/* Local Leaderboard Modal */}
      {activeModal === 'LEADERBOARD' && (
        <LeaderboardModal stats={stats} onClose={() => setActiveModal(null)} />
      )}

      {/* Settings Modal */}
      {activeModal === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* How to Play Modal */}
      {activeModal === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={() => setActiveModal(null)} />
      )}

      {/* About Modal */}
      {activeModal === 'ABOUT' && (
        <AboutModal onClose={() => setActiveModal(null)} />
      )}
    </main>
  );
}
