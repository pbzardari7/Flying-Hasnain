import React from 'react';
import { X, HelpCircle, ArrowUp, ShieldAlert, Coins } from 'lucide-react';
import { sounds } from '../game/sound';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                HOW TO PLAY
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Flight manual & survival tips
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

        {/* Instructions Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Rule 1: Controls */}
          <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-arcade text-xs font-bold text-sky-950">
                1. Tap or Press Space to Flap
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Every tap gives Hasnain an upward boost. Stop tapping and gravity
                pulls him down. Find a rhythmic tapping cadence!
              </p>
            </div>
          </div>

          {/* Rule 2: Obstacles */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-arcade text-xs font-bold text-emerald-950">
                2. Thread Through the Pipes
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Fly cleanly between the top and bottom green pipes without
                touching. Each pair successfully crossed earns <strong>+1 Point</strong>.
              </p>
            </div>
          </div>

          {/* Rule 3: Collect Coins */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-arcade text-xs font-bold text-amber-950">
                3. Collect Golden Coins
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Spinning gold coins spawn in the gaps. Collect them to unlock 12
                exclusive character skins in the shop!
              </p>
            </div>
          </div>

          {/* Rule 4: Difficulty */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <h4 className="font-arcade font-bold text-slate-800 mb-1">
              Flight Tip:
            </h4>
            <p className="text-[11px] text-slate-600 leading-snug">
              Don't fly too high! Hitting the ceiling restricts your upward motion,
              and touching the ground causes an immediate crash. Aim for the center
              of each gap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
