import React from 'react';
import { Pause } from 'lucide-react';

interface GameHUDProps {
  score: number;
  coins: number;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ score, onPause }) => {
  return (
    <div className="absolute inset-x-0 top-0 pt-5 px-5 flex items-start justify-between pointer-events-none z-20 select-none">
      {/* Empty spacer to balance pause button */}
      <div className="w-10 h-10" />

      {/* Giant Central Score for Kids */}
      <div className="flex flex-col items-center">
        <span
          key={score}
          className="font-arcade text-6xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] tabular-nums scale-100 transition-transform duration-100 ease-out animate-in zoom-in-95"
          style={{
            textShadow: '0 4px 0 #0284c7, 0 8px 16px rgba(0,0,0,0.5)',
          }}
        >
          {score}
        </span>
      </div>

      {/* Simple Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPause();
        }}
        aria-label="Pause Game"
        className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-900 shadow-md flex items-center justify-center border border-white/60 active:scale-95 transition-transform"
      >
        <Pause className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
};
