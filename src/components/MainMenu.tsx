import React from 'react';
import {
  Play,
  Trophy,
  ShoppingBag,
  Target,
  User,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ActiveModal, PlayerStats } from '../game/types';
import { sounds } from '../game/sound';

interface MainMenuProps {
  stats: PlayerStats;
  soundEnabled: boolean;
  unclaimedMissionsCount: number;
  onPlay: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  soundEnabled,
  unclaimedMissionsCount,
  onPlay,
  onOpenModal,
  onToggleSound,
}) => {
  const handleNav = (modal: ActiveModal) => {
    sounds.playClick();
    onOpenModal(modal);
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 pointer-events-none select-none">
      {/* Top Header: Clean Stats & Audio */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Coin Balance */}
        <button
          onClick={() => handleNav('SHOP')}
          aria-label="Open Shop"
          className="flex items-center gap-2 bg-white/95 hover:bg-white text-slate-800 font-bold px-3.5 py-1.5 rounded-full shadow-sm border border-slate-200/80 transition active:scale-95"
        >
          <span className="text-sm">🪙</span>
          <span className="font-arcade text-sm tabular-nums text-slate-900 font-black">
            {stats.currentCoins}
          </span>
        </button>

        {/* Right cluster: Best Score & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNav('LEADERBOARD')}
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 font-bold px-3.5 py-1.5 rounded-full shadow-sm border border-slate-200/80 transition active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Best
            </span>
            <span className="font-arcade text-sm tabular-nums text-slate-900 font-black">
              {stats.bestScore}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onToggleSound();
            }}
            aria-label="Toggle Sound"
            className="w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-sm flex items-center justify-center border border-slate-200/80 transition active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-500" />
            )}
          </button>
        </div>
      </div>

      {/* Center Stage: Title, Hasnain Window & Primary PLAY CTA */}
      <div className="flex-1 flex flex-col items-center justify-between pointer-events-auto text-center py-2">
        {/* Title Lockup */}
        <div className="mt-1">
          <h1
            className="font-arcade text-4xl sm:text-5xl font-black text-white tracking-wider"
            style={{
              textShadow: '0 3px 0 #0284c7, 0 6px 14px rgba(0,0,0,0.35)',
            }}
          >
            FLYING HASNAIN
          </h1>
          <p className="font-arcade text-xs font-bold text-yellow-200 uppercase tracking-widest mt-0.5 drop-shadow">
            Tap · Fly · Survive
          </p>
        </div>

        {/* Clear negative space window where Hasnain floats and flaps on canvas */}
        <div className="h-44 sm:h-48 w-full pointer-events-none" />

        {/* Primary Action: PLAY Button */}
        <div className="w-full flex flex-col items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onPlay();
            }}
            className="w-60 py-4 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-arcade text-2xl font-black shadow-[0_5px_0_#065f46,0_10px_20px_rgba(0,0,0,0.25)] active:translate-y-1 active:shadow-[0_2px_0_#065f46] transition-all flex items-center justify-center gap-2.5 border border-emerald-300"
          >
            <Play className="w-7 h-7 fill-white stroke-none" />
            <span>PLAY NOW</span>
          </button>
          <span className="text-[11px] font-bold text-white/90 drop-shadow font-arcade">
            SPACE OR TAP TO FLY
          </span>
        </div>
      </div>

      {/* Bottom Secondary Options Dock (Neatly Grouped & Balanced) */}
      <div className="w-full max-w-sm mx-auto pointer-events-auto bg-white/95 rounded-2xl p-2 shadow-md border border-slate-200/90">
        <div className="grid grid-cols-6 gap-1 text-center">
          {/* Shop */}
          <button
            onClick={() => handleNav('SHOP')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition active:scale-95"
            title="Character Shop"
          >
            <ShoppingBag className="w-4 h-4 text-sky-600 mb-0.5" />
            <span className="text-[10px] font-bold">Shop</span>
          </button>

          {/* Missions */}
          <button
            onClick={() => handleNav('MISSIONS')}
            className="relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition active:scale-95"
            title="Missions"
          >
            {unclaimedMissionsCount > 0 && (
              <span className="absolute top-0.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {unclaimedMissionsCount}
              </span>
            )}
            <Target className="w-4 h-4 text-emerald-600 mb-0.5" />
            <span className="text-[10px] font-bold">Missions</span>
          </button>

          {/* Badges / Achievements */}
          <button
            onClick={() => handleNav('ACHIEVEMENTS')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition active:scale-95"
            title="Achievements"
          >
            <Trophy className="w-4 h-4 text-amber-500 mb-0.5" />
            <span className="text-[10px] font-bold">Badges</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleNav('PROFILE')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition active:scale-95"
            title="Profile"
          >
            <User className="w-4 h-4 text-blue-600 mb-0.5" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNav('SETTINGS')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition active:scale-95"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-600 mb-0.5" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>

          {/* Guide / How to Play */}
          <button
            onClick={() => handleNav('HOW_TO_PLAY')}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition active:scale-95"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 text-teal-600 mb-0.5" />
            <span className="text-[10px] font-bold">Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
