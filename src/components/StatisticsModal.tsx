import React from 'react';
import { X, BarChart2, Calendar, Trophy, Zap } from 'lucide-react';
import { PlayerStats } from '../game/types';
import { CHARACTER_CATALOG } from '../game/skins';
import { sounds } from '../game/sound';

interface StatisticsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  stats,
  onClose,
}) => {
  // Calculate average score strictly from actual saved runs
  const totalRuns = stats.recentRuns.length;
  const avgScore =
    totalRuns > 0
      ? (
          stats.recentRuns.reduce((acc, r) => acc + r.score, 0) / totalRuns
        ).toFixed(1)
      : '0.0';

  // Find most-used character
  let mostUsedName = 'Classic Hasnain';
  let maxCount = 0;
  for (const [charId, count] of Object.entries(stats.characterUsageCounts)) {
    if (count > maxCount) {
      maxCount = count;
      const found = CHARACTER_CATALOG.find((c) => c.id === charId);
      if (found) mostUsedName = found.name;
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                STATISTICS
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Verified telemetry from your actual flights
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {stats.totalGames === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <div className="text-4xl mb-2">🪶</div>
              <h3 className="font-arcade text-base font-bold text-slate-600">
                No Flights Recorded Yet
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Take your first flight as Flying Hasnain to start recording your
                speeds, averages, and records!
              </p>
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    High Score
                  </span>
                  <span className="font-arcade text-2xl font-black text-sky-900 tabular-nums">
                    {stats.bestScore}
                  </span>
                </div>

                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Average Score
                  </span>
                  <span className="font-arcade text-2xl font-black text-sky-900 tabular-nums">
                    {avgScore}
                  </span>
                </div>

                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Flights
                  </span>
                  <span className="font-arcade text-2xl font-black text-sky-900 tabular-nums">
                    {stats.totalGames}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    High Coin Run
                  </span>
                  <span className="font-arcade text-2xl font-black text-amber-700 tabular-nums">
                    {stats.highestCoinsInRun} 🪙
                  </span>
                </div>
              </div>

              {/* Extra details strip */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Most Used Aviator:</span>
                  <span className="font-bold text-slate-800 font-arcade">
                    {mostUsedName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Pipes Cleared:</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {stats.totalObstaclesCleared}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Sky Playtime:</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round(stats.totalPlayTimeSeconds / 60)} min
                  </span>
                </div>
              </div>

              {/* Recent 20 Runs History */}
              <div>
                <h3 className="font-arcade text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  Recent Flight Log (Last {stats.recentRuns.length})
                </h3>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {stats.recentRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-sky-50/50 transition"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-arcade font-bold text-slate-800">
                            Score: {run.score}
                          </span>
                          {run.score === stats.bestScore && run.score > 0 && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <Trophy className="w-2.5 h-2.5 text-amber-600" />
                              BEST
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {run.characterName} · {run.date}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-arcade font-bold text-amber-600 block">
                          +{run.coinsEarned} 🪙
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {run.obstaclesCleared} pipes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
