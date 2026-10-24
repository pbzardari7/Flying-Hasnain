import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../game/sound';

interface GameOverModalProps {
  score: number;
  coinsEarned: number;
  isNewBest: boolean;
  previousBest: number;
  onTryAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coinsEarned,
  isNewBest,
  previousBest,
  onTryAgain,
  onHome,
}) => {
  useEffect(() => {
    if (isNewBest && score > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#f59e0b', '#10b981', '#fbbf24'],
        });
      } catch {
        // Ignore
      }
    }
  }, [isNewBest, score]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-sky-950/80 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-xl border border-slate-200 text-center flex flex-col items-center">
        {/* Hasnain Face Avatar */}
        <div className="relative mb-1">
          <div className="w-20 h-24 mx-auto overflow-hidden flex items-center justify-center">
            <img
              src="/hasnain.png"
              alt="Hasnain"
              className="w-full h-full object-contain"
            />
          </div>
          {isNewBest && score > 0 && (
            <span className="absolute -top-1 -right-2 text-xl animate-bounce">
              👑
            </span>
          )}
        </div>

        {/* Header */}
        {isNewBest && score > 0 ? (
          <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full font-arcade text-xs font-black shadow-xs mb-1 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
            <span>NEW HIGH SCORE!</span>
          </div>
        ) : null}

        <h2 className="font-arcade text-2xl font-black text-slate-900 tracking-wide">
          {score > 5 ? 'GREAT FLYING!' : 'GAME OVER'}
        </h2>

        {/* Score & Coins Summary Strip */}
        <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 my-3 flex items-center justify-around">
          {/* Score */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-arcade">
              SCORE
            </span>
            <span className="font-arcade text-3xl font-black text-sky-900 tabular-nums">
              {score}
            </span>
          </div>

          <div className="w-px h-8 bg-slate-200" />

          {/* Best */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-arcade flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500 fill-amber-400" />
              BEST
            </span>
            <span className="font-arcade text-3xl font-black text-amber-600 tabular-nums">
              {Math.max(score, previousBest)}
            </span>
          </div>

          <div className="w-px h-8 bg-slate-200" />

          {/* Coins */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-arcade">
              COINS
            </span>
            <span className="font-arcade text-2xl font-black text-amber-700 tabular-nums">
              +{coinsEarned}
            </span>
          </div>
        </div>

        {/* Big Bright Primary Action: TRY AGAIN */}
        <button
          onClick={() => {
            sounds.playClick();
            onTryAgain();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-arcade text-xl font-black shadow-[0_4px_0_#065f46,0_8px_16px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_#065f46] transition-all flex items-center justify-center gap-2 border border-emerald-300 mb-2"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>TRY AGAIN</span>
        </button>

        {/* Secondary: HOME */}
        <button
          onClick={() => {
            sounds.playClick();
            onHome();
          }}
          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-arcade text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>HOME</span>
        </button>
      </div>
    </div>
  );
};
