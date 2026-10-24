import React, { useState } from 'react';
import {
  X,
  User,
  Trophy,
  Check,
  Edit2,
  Info,
} from 'lucide-react';
import { PlayerCharacter, PlayerStats } from '../game/types';
import { sounds } from '../game/sound';

interface ProfileModalProps {
  stats: PlayerStats;
  equippedChar: PlayerCharacter;
  unlockedCharacters: PlayerCharacter[];
  achievementsCount: number;
  totalAchievements: number;
  onUpdateName: (name: string) => void;
  onSetFavorite: (id: string) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  stats,
  equippedChar,
  unlockedCharacters,
  achievementsCount,
  totalAchievements,
  onUpdateName,
  onSetFavorite,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(stats.playerName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsEditing(false);
      sounds.playClick();
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                PLAYER PROFILE
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Local aviator passport & career progress
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Avatar & Name Header Card */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50/60 rounded-2xl p-4 border border-sky-100 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white font-arcade text-xl font-black shrink-0"
              style={{ backgroundColor: equippedChar.accentColor }}
            >
              {equippedChar.name.slice(0, 1)}
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={18}
                    className="w-full px-2 py-1 text-sm font-bold border-2 border-sky-400 rounded-lg outline-none font-arcade"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-arcade text-lg font-black text-slate-800 truncate">
                    {stats.playerName}
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-sky-600 p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-sky-700 font-semibold font-arcade mt-0.5">
                Flyer with {equippedChar.name}
              </p>
              <div className="text-[11px] text-slate-400 mt-1">
                Level: <strong className="text-sky-900 font-mono">Flight Ace</strong>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Personal Best
              </span>
              <span className="font-arcade text-2xl font-black text-amber-600 tabular-nums">
                {stats.bestScore}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Games
              </span>
              <span className="font-arcade text-2xl font-black text-sky-700 tabular-nums">
                {stats.totalGames}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pipes Cleared
              </span>
              <span className="font-arcade text-2xl font-black text-emerald-600 tabular-nums">
                {stats.totalObstaclesCleared}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Coins Earned
              </span>
              <span className="font-arcade text-2xl font-black text-amber-700 tabular-nums">
                {stats.totalCoins} 🪙
              </span>
            </div>
          </div>

          {/* Unlocked Cosmetics and Badges count */}
          <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Achievements Earned:</span>
            </div>
            <span className="font-arcade font-bold text-sky-900">
              {achievementsCount} / {totalAchievements}
            </span>
          </div>

          {/* Favorite Skin Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 font-arcade">
              Favorite Character Skin:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {unlockedCharacters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    sounds.playClick();
                    onSetFavorite(c.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border-2 transition ${
                    stats.favoriteCharacterId === c.id
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Storage notice as requested */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Your profile and unlocked items are securely stored on this device.
              No account or login required! Progress will remain as long as your
              browser cache is preserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
