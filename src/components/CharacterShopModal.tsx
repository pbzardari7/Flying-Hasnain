import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Lock,
  Camera,
  Trash2,
  Sparkles,
  Eye,
} from 'lucide-react';
import { PlayerCharacter } from '../game/types';
import { CHARACTER_CATALOG } from '../game/skins';
import { sounds } from '../game/sound';

interface CharacterShopModalProps {
  unlockedIds: string[];
  equippedId: string;
  currentCoins: number;
  customHeadDataUrl: string | null;
  onEquip: (id: string) => void;
  onBuy: (id: string, price: number) => void;
  onPreview: (idx: number) => void;
  onSaveCustomHead: (dataUrl: string | null) => void;
  onClose: () => void;
}

export const CharacterShopModal: React.FC<CharacterShopModalProps> = ({
  unlockedIds,
  equippedId,
  currentCoins,
  customHeadDataUrl,
  onEquip,
  onBuy,
  onPreview,
  onSaveCustomHead,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'All Styles' },
    { id: 'classic', label: 'Classic' },
    { id: 'fun', label: 'Fun' },
    { id: 'elemental', label: 'Elemental' },
    { id: 'futuristic', label: 'Futuristic' },
    { id: 'mythic', label: 'Mythic' },
  ];

  const filteredCharacters = CHARACTER_CATALOG.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const handleBuyClick = (char: PlayerCharacter) => {
    if (currentCoins < char.price) {
      setErrorMsg(`Need ${char.price - currentCoins} more coins! Complete missions or fly more.`);
      sounds.playHit();
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    sounds.playFanfare();
    onBuy(char.id, char.price);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;

      // Scale down image to 256x256 max for snappy local storage
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 200, 200);
          const compressed = canvas.toDataURL('image/png', 0.85);
          onSaveCustomHead(compressed);
          sounds.playFanfare();
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-sky-950/80 select-none p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-lg mx-auto flex-1 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-100 bg-sky-50/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <div>
              <h2 className="font-arcade text-xl font-black text-sky-950">
                CHARACTER SHOP
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Collect & customize Hasnain's flying styles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3 py-1 rounded-full font-bold text-xs shadow-xs border border-amber-300">
              <span>🪙</span>
              <span className="font-arcade tabular-nums">{currentCoins}</span>
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
        </div>

        {/* Insufficient coins or error toast */}
        {errorMsg && (
          <div className="bg-rose-500 text-white text-xs font-semibold px-4 py-2 text-center animate-in slide-in-from-top">
            {errorMsg}
          </div>
        )}

        {/* Custom Head Studio Banner */}
        <div className="p-3 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-b border-sky-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-sky-200 border-2 border-white shadow-xs overflow-hidden flex items-center justify-center shrink-0">
              {customHeadDataUrl ? (
                <img
                  src={customHeadDataUrl}
                  alt="Custom Face"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-5 h-5 text-sky-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 font-arcade">
                  Custom Face Studio
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {customHeadDataUrl
                  ? 'Custom photo currently active in flights!'
                  : 'Upload your brother’s photo or any PNG face'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-arcade text-xs font-bold shadow-xs transition"
            >
              {customHeadDataUrl ? 'Change' : 'Upload PNG'}
            </button>
            {customHeadDataUrl && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onSaveCustomHead(null);
                }}
                title="Reset to Original Face"
                className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto border-b border-slate-100 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Character Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredCharacters.map((char) => {
            const isUnlocked = unlockedIds.includes(char.id);
            const isEquipped = equippedId === char.id;
            const fullIndex = CHARACTER_CATALOG.findIndex((c) => c.id === char.id);

            return (
              <div
                key={char.id}
                className={`relative rounded-2xl p-3 flex flex-col justify-between border-2 transition-all ${
                  isEquipped
                    ? 'border-sky-500 bg-sky-50/80 shadow-md ring-2 ring-sky-300'
                    : isUnlocked
                    ? 'border-slate-200 bg-white hover:border-sky-300 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 opacity-90'
                }`}
              >
                {/* Top Badge: Category */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: char.accentColor }}
                  >
                    {char.category}
                  </span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onPreview(fullIndex);
                    }}
                    title="Inspect Character"
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Avatar Icon Box */}
                <div
                  onClick={() => onPreview(fullIndex)}
                  className="w-16 h-16 mx-auto my-1 rounded-full bg-sky-100 border-2 border-white shadow-xs flex items-center justify-center cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: `${char.accentColor}20` }}
                >
                  {/* Miniature rendered face indicator */}
                  <div className="flex items-center justify-center font-arcade font-bold text-xs text-sky-800">
                    {char.name.split(' ')[0]}
                  </div>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Name & Tagline */}
                <div className="text-center my-1">
                  <h3 className="font-arcade text-xs font-bold text-slate-800 truncate">
                    {char.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    {char.tagline}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-2">
                  {isEquipped ? (
                    <div className="w-full py-1.5 rounded-xl bg-sky-500 text-white font-arcade text-xs font-bold flex items-center justify-center gap-1 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>EQUIPPED</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onEquip(char.id);
                      }}
                      className="w-full py-1.5 rounded-xl bg-white hover:bg-sky-500 hover:text-white text-sky-600 font-arcade text-xs font-bold border border-sky-300 transition active:scale-95"
                    >
                      SELECT
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyClick(char)}
                      className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-arcade text-xs font-bold border border-amber-300 shadow-xs flex items-center justify-center gap-1 transition active:scale-95"
                    >
                      <span>{char.price}</span>
                      <span>🪙</span>
                    </button>
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
