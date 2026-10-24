import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { GameSettings } from '../game/types';
import { sounds } from '../game/sound';

interface PauseModalProps {
  score: number;
  coins: number;
  settings: GameSettings;
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onToggleSound: () => void;
  onToggleVoice: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  settings,
  onResume,
  onRestart,
  onQuitToMenu,
  onToggleSound,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-sky-950/75 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border-4 border-sky-300 text-center flex flex-col items-center">
        {/* Header */}
        <h2 className="font-arcade text-3xl font-black text-sky-900 tracking-wide mb-3">
          PAUSED
        </h2>

        {/* Current Score */}
        <div className="bg-sky-50 rounded-2xl px-6 py-2.5 mb-5 border border-sky-100 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-arcade">
            SCORE
          </span>
          <span className="font-arcade text-3xl font-black text-sky-900 tabular-nums">
            {score}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Resume */}
          <button
            onClick={() => {
              sounds.playClick();
              onResume();
            }}
            className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-arcade text-xl font-bold shadow-md shadow-sky-500/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>RESUME</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-arcade text-base font-bold shadow-xs flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          {/* Quit to Menu */}
          <button
            onClick={() => {
              sounds.playClick();
              onQuitToMenu();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-arcade text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-100 w-full flex justify-center">
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-arcade text-xs font-bold"
          >
            {settings.soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-sky-600" />
                <span>Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span>Sound OFF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
