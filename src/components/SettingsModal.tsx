import React, { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  Mic,
  Smartphone,
  Sparkles,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { GameSettings } from '../game/types';
import { sounds } from '../game/sound';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleTestVoice = () => {
    sounds.init();
    sounds.playYeahVoice();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-md mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                SETTINGS
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Audio, feedback, and performance preferences
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

        {/* Settings Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Sound FX Switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-arcade text-xs font-bold text-slate-800 block">
                  Sound Effects (SFX)
                </span>
                <span className="text-[10px] text-slate-400">
                  Flaps, coin sparkles, and score chimes
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onSave({ soundEnabled: !settings.soundEnabled });
                sounds.playClick();
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.soundEnabled ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Hasnain Voiceover (Uploaded "Yeah!" audio sample) */}
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-arcade text-xs font-bold text-amber-950 block">
                    Hasnain "Yeah!" Voiceover
                  </span>
                  <span className="text-[10px] text-amber-800/80">
                    Authentic celebratory voice line on high scores
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  onSave({ voiceoverEnabled: !settings.voiceoverEnabled });
                  sounds.playClick();
                }}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  settings.voiceoverEnabled ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.voiceoverEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleTestVoice}
              className="w-full py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-arcade text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Hasnain Voice Clip</span>
            </button>
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-arcade text-xs font-bold text-slate-800 block">
                  Screen Shake & Hitstop
                </span>
                <span className="text-[10px] text-slate-400">
                  Dynamic impact reaction on collisions
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onSave({ screenShake: !settings.screenShake });
                sounds.playClick();
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.screenShake ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.screenShake ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Device Haptic Vibration */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-arcade text-xs font-bold text-slate-800 block">
                  Haptic Vibration
                </span>
                <span className="text-[10px] text-slate-400">
                  Subtle tactile bump on mobile crashes
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onSave({ vibrationEnabled: !settings.vibrationEnabled });
                sounds.playClick();
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.vibrationEnabled ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset All Local Data */}
          <div className="pt-2">
            {showConfirmReset ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <p className="text-xs font-bold text-rose-800 mb-2">
                  Clear all unlocked skins, coins, and high scores?
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setShowConfirmReset(false);
                      sounds.playHit();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-arcade text-xs font-bold rounded-lg"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-arcade text-xs font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-arcade text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reset All Local Game Progress</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
