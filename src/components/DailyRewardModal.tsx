import React from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Check, Sparkles, Calendar } from 'lucide-react';
import { DailyRewardState } from '../game/types';
import { DAILY_REWARD_DAYS } from '../game/constants';
import { sounds } from '../game/sound';

interface DailyRewardModalProps {
  dailyState: DailyRewardState;
  onClaim: () => void;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  dailyState,
  onClaim,
  onClose,
}) => {
  const currentDayIndex = dailyState.currentDay;
  const isClaimedToday = dailyState.claimedToday;

  const handleClaim = () => {
    sounds.playFanfare();
    sounds.playYeahVoice();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#34d399'],
      });
    } catch {
      // Ignore
    }
    onClaim();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-sm mx-auto my-auto bg-white rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden text-center p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h2 className="font-arcade text-lg font-black text-amber-950">
                DAILY REWARDS
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Log in every 24 hours to build your streak!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center justify-center gap-1.5 my-3 py-1 px-3 bg-amber-50 rounded-full border border-amber-200 w-fit mx-auto">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-900 font-arcade">
            Current Streak: {dailyState.streak} Days
          </span>
        </div>

        {/* 7-Day Cycle Grid */}
        <div className="grid grid-cols-4 gap-2 my-2">
          {DAILY_REWARD_DAYS.map((item) => {
            const isToday = item.day === currentDayIndex;
            const isPast =
              item.day < currentDayIndex ||
              (isToday && isClaimedToday);
            const isFuture = item.day > currentDayIndex;

            return (
              <div
                key={item.day}
                className={`rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 transition-all ${
                  item.day === 7 ? 'col-span-2 bg-gradient-to-br from-amber-100 to-yellow-100' : ''
                } ${
                  isToday && !isClaimedToday
                    ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300 scale-105'
                    : isPast
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-bold font-arcade uppercase text-slate-400">
                  Day {item.day}
                </span>

                <div className="my-1 text-lg">
                  {isPast ? '✅' : item.day === 7 ? '👑' : '🪙'}
                </div>

                <span className="font-arcade text-xs font-black text-amber-700">
                  +{item.reward}
                </span>

                {isToday && !isClaimedToday && (
                  <span className="text-[9px] font-extrabold text-amber-600 bg-amber-200 px-1 rounded-sm mt-0.5 animate-pulse">
                    TODAY
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action */}
        <div className="mt-4">
          {isClaimedToday ? (
            <div className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-500 font-arcade text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>TODAY'S REWARD CLAIMED! COME BACK TOMORROW</span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-arcade text-base font-black shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 border border-amber-200 transition active:scale-95 animate-bounce"
            >
              <Sparkles className="w-5 h-5 fill-amber-950" />
              <span>
                CLAIM DAY {currentDayIndex} REWARD (+
                {DAILY_REWARD_DAYS[currentDayIndex - 1]?.reward} 🪙)
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
