import React from 'react';
import { X, Medal, Trophy, ShieldCheck } from 'lucide-react';
import { PlayerStats } from '../game/types';
import { sounds } from '../game/sound';

interface LeaderboardModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  stats,
  onClose,
}) => {
  // Sort runs by score descending to get top 10
  const topRuns = [...stats.recentRuns]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const getRankBadge = (index: number) => {
    if (index === 0)
      return (
        <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-arcade text-xs font-black flex items-center justify-center shadow-xs">
          1
        </span>
      );
    if (index === 1)
      return (
        <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-arcade text-xs font-black flex items-center justify-center shadow-xs">
          2
        </span>
      );
    if (index === 2)
      return (
        <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-arcade text-xs font-black flex items-center justify-center shadow-xs">
          3
        </span>
      );
    return (
      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-arcade text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <Medal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                LOCAL HALL OF FAME
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Top 10 flights recorded on this device
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Honest Transparency Card */}
          <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">
              <strong>Honest Leaderboard:</strong> This board tracks only genuine
              flights completed by you on this device. No bot ranks or fake
              online records!
            </p>
          </div>

          {topRuns.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-arcade text-sm font-bold text-slate-600">
                Leaderboard Empty
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Fly through some pipes to claim the #1 spot!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xs">
              {topRuns.map((run, idx) => (
                <div
                  key={run.id}
                  className={`p-3 flex items-center justify-between text-xs transition ${
                    idx === 0 ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankBadge(idx)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-arcade font-bold text-slate-800 text-sm">
                          {stats.playerName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({run.characterName})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {run.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-arcade font-black text-sky-900 text-base tabular-nums block">
                      {run.score} pts
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold font-arcade">
                      {run.coinsEarned} 🪙
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
