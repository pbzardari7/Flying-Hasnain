import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Check, Lock } from 'lucide-react';
import { PlayerCharacter } from '../game/types';
import { drawHasnainCharacter } from '../game/skins';
import { sounds } from '../game/sound';

interface CharacterPreviewModalProps {
  characters: PlayerCharacter[];
  selectedIndex: number;
  unlockedIds: string[];
  equippedId: string;
  currentCoins: number;
  customHeadImg: HTMLImageElement | null;
  onSelectIndex: (idx: number) => void;
  onEquip: (id: string) => void;
  onBuy: (id: string, price: number) => void;
  onClose: () => void;
}

export const CharacterPreviewModal: React.FC<CharacterPreviewModalProps> = ({
  characters,
  selectedIndex,
  unlockedIds,
  equippedId,
  currentCoins,
  customHeadImg,
  onSelectIndex,
  onEquip,
  onBuy,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  const char = characters[selectedIndex] || characters[0];
  const isUnlocked = unlockedIds.includes(char.id);
  const isEquipped = equippedId === char.id;
  const canAfford = currentCoins >= char.price;

  // Animated Live Preview Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    let running = true;

    const render = () => {
      if (!running) return;
      phase += 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky background inside preview circle
      const grad = ctx.createRadialGradient(
        110,
        110,
        10,
        110,
        110,
        90
      );
      grad.addColorStop(0, '#7dd3fc');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(110, 110, 90, 0, Math.PI * 2);
      ctx.fill();

      // Soft clouds inside preview
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(60 + Math.sin(phase * 0.2) * 5, 140, 25, 0, Math.PI * 2);
      ctx.arc(150 - Math.sin(phase * 0.2) * 5, 80, 20, 0, Math.PI * 2);
      ctx.fill();

      // Float offset
      const floatY = 110 + Math.sin(phase * 0.7) * 6;
      const tilt = Math.sin(phase * 0.7) * 0.08;

      drawHasnainCharacter(
        ctx,
        char,
        110,
        floatY,
        42, // Large preview size
        phase * 2.2,
        tilt,
        customHeadImg
      );

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [char, customHeadImg]);

  const handlePrev = () => {
    sounds.playClick();
    onSelectIndex((selectedIndex - 1 + characters.length) % characters.length);
  };

  const handleNext = () => {
    sounds.playClick();
    onSelectIndex((selectedIndex + 1) % characters.length);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/70 select-none animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-sky-300 relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Character Title */}
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1 text-white shadow-xs"
          style={{ backgroundColor: char.accentColor }}
        >
          {char.category}
        </span>
        <h2 className="font-arcade text-2xl font-black text-slate-900">
          {char.name}
        </h2>
        <p className="text-xs text-sky-600 font-semibold mb-3">
          {char.tagline}
        </p>

        {/* Canvas Display with Left / Right Arrows */}
        <div className="relative flex items-center justify-center my-2">
          <button
            onClick={handlePrev}
            aria-label="Previous Character"
            className="absolute -left-6 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-sky-50 active:scale-95 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <canvas
            ref={canvasRef}
            width={220}
            height={220}
            className="w-48 h-48 rounded-full shadow-inner border-4 border-white"
          />

          <button
            onClick={handleNext}
            aria-label="Next Character"
            className="absolute -right-6 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-sky-50 active:scale-95 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Lore / Description */}
        <p className="text-xs text-slate-600 px-4 my-3 min-h-[38px] leading-relaxed">
          {char.description}
        </p>

        {/* Action Button: Equip or Buy */}
        <div className="w-full mt-2">
          {isEquipped ? (
            <div className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-arcade text-base font-bold flex items-center justify-center gap-2 shadow-sm">
              <Check className="w-5 h-5" />
              <span>CURRENTLY EQUIPPED</span>
            </div>
          ) : isUnlocked ? (
            <button
              onClick={() => {
                sounds.playClick();
                onEquip(char.id);
              }}
              className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-arcade text-base font-bold shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>EQUIP CHARACTER</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onBuy(char.id, char.price);
              }}
              disabled={!canAfford}
              className={`w-full py-3.5 rounded-xl font-arcade text-base font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-95 ${
                canAfford
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-amber-400/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>UNLOCK FOR {char.price} 🪙</span>
            </button>
          )}
        </div>

        {/* Coin Balance helper */}
        <div className="mt-3 text-[11px] text-slate-500 font-medium">
          Your Balance: <strong className="text-amber-700 font-arcade">{currentCoins} 🪙</strong>
        </div>
      </div>
    </div>
  );
};
