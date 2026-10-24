import React from 'react';
import { X, Info, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../game/sound';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto my-auto bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden p-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h2 className="font-arcade text-lg font-black text-sky-950">
                ABOUT THE GAME
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Flying Hasnain v1.0.0
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

        {/* Mascot & Dedication */}
        <div className="my-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-400 to-sky-600 border-4 border-white shadow-xl flex items-center justify-center text-3xl mb-2 animate-bounce">
            🪶
          </div>
          <h3 className="font-arcade text-xl font-black text-sky-950">
            FLYING HASNAIN
          </h3>
          <p className="font-arcade text-xs font-bold text-amber-600 uppercase tracking-wider">
            Tap. Fly. Survive. Repeat.
          </p>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed text-left px-2">
          <p className="bg-sky-50 p-3 rounded-2xl border border-sky-100">
            <strong>Flying Hasnain</strong> is a high-octane, physics-based flying
            arcade game built with love, featuring Hasnain's signature face as the
            heroic aviator.
          </p>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 font-arcade text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Core Highlights:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-1">
              <li>Responsive 60fps delta-time normalized physics</li>
              <li>12 unique unlockable character cosmetic styles</li>
              <li>Custom Face Studio: fly with any uploaded photo</li>
              <li>10 real missions and 10 persistent achievements</li>
              <li>Authentic voice audio sample with "Yeah!" celebrations</li>
              <li>Zero fake bots or fabricated rankings</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] pt-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Dedicated to brother Hasnain</span>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="mt-4 w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-arcade text-xs font-bold shadow-md shadow-sky-500/25 transition active:scale-95"
        >
          BACK TO SKY
        </button>
      </div>
    </div>
  );
};
