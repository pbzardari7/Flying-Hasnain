import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';

interface GameCanvasProps {
  engine: GameEngine;
  gameState: GameState;
  onTap: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = React.memo(
  ({ engine, gameState, onTap }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameId = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(performance.now());

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true, // low latency canvas rendering
      });
      if (!ctx) return;

      // Responsive Canvas Resizing with capped DPR for smooth mobile performance
      const handleResize = () => {
        const rect = container.getBoundingClientRect();
        // Cap DPR at 1.75 on mobile to avoid 4K fill-rate GPU slowdowns
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);

        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        engine.resize(w, h);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      // Handle tab visibility changes to prevent huge frame-delta jumps
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          lastTimeRef.current = performance.now();
        } else if (engine.state === 'PLAYING') {
          engine.pause();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Single, rock-solid requestAnimationFrame Game Loop
      let running = true;
      lastTimeRef.current = performance.now();

      const loop = (currentTime: number) => {
        if (!running) return;

        // Calculate clamped delta-time
        const rawDt = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;

        // Update fixed-step physics engine
        engine.update(rawDt);

        // Render optimized canvas frame
        engine.render(ctx);

        animFrameId.current = requestAnimationFrame(loop);
      };

      animFrameId.current = requestAnimationFrame(loop);

      return () => {
        running = false;
        if (animFrameId.current) {
          cancelAnimationFrame(animFrameId.current);
        }
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [engine]);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      onTap();
    };

    return (
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="relative w-full h-full max-w-[480px] mx-auto select-none touch-none overflow-hidden cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none select-none"
        />

        {/* Ready State Tap-To-Fly Prompt */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none bg-black/10">
            <div className="flex flex-col items-center animate-bounce">
              <div className="w-16 h-16 rounded-full bg-white text-emerald-600 shadow-xl flex items-center justify-center mb-3 border-4 border-emerald-400">
                <svg
                  className="w-8 h-8 translate-y-[-2px]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4l-8 8h6v8h4v-8h6z" />
                </svg>
              </div>
              <span
                className="font-arcade text-3xl font-black text-white tracking-wider"
                style={{
                  textShadow: '0 2px 0 #065f46, 0 4px 10px rgba(0,0,0,0.6)',
                }}
              >
                TAP TO FLY!
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);
