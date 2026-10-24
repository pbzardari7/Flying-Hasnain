import React from 'react';
import { X, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { Achievement } from '../game/types';
import { sounds } from '../game/sound';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                ACHIEVEMENTS
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {unlockedCount} of {achievements.length} Badges Unlocked
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

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-r from-amber-50/70 to-yellow-50/70 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                  ach.unlocked
                    ? 'bg-amber-100 border-amber-300 shadow-sm'
                    : 'bg-slate-200 border-slate-300 text-slate-400 grayscale'
                }`}
              >
                {ach.icon}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-arcade text-xs font-bold text-slate-800 truncate">
                    {ach.title}
                  </h3>
                  {ach.unlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 font-arcade">
                      <CheckCircle2 className="w-3 h-3" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 font-arcade">
                      <Lock className="w-3 h-3" />
                      LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {ach.description}
                </p>
                {ach.dateUnlocked && (
                  <p className="text-[9px] text-amber-700 font-medium mt-1">
                    Unlocked on {ach.dateUnlocked}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
