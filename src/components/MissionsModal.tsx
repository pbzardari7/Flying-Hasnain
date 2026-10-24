import React from 'react';
import { X, Check, Target, Gift } from 'lucide-react';
import { Mission } from '../game/types';
import { sounds } from '../game/sound';

interface MissionsModalProps {
  missions: Mission[];
  onClaim: (id: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  onClaim,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                MISSIONS
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Complete flight objectives & earn bonus coins
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

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  m.claimed
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : m.completed
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-sky-200 shadow-xs'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-arcade text-xs font-bold text-slate-800 truncate">
                      {m.title}
                    </h3>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                      +{m.reward} 🪙
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {m.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden flex items-center border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        m.completed ? 'bg-emerald-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                    <span>Progress</span>
                    <span>
                      {m.current} / {m.target} ({pct}%)
                    </span>
                  </div>
                </div>

                {/* Claim / Status Action */}
                <div className="shrink-0 pl-1">
                  {m.claimed ? (
                    <div className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center gap-1 font-arcade">
                      <Check className="w-3 h-3 stroke-[3]" />
                      CLAIMED
                    </div>
                  ) : m.completed ? (
                    <button
                      onClick={() => {
                        sounds.playFanfare();
                        onClaim(m.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-500/30 flex items-center gap-1 font-arcade transition active:scale-95 animate-bounce"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      CLAIM
                    </button>
                  ) : (
                    <div className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-bold font-arcade">
                      LOCKED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
