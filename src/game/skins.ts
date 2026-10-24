import { PlayerCharacter } from './types';

const assetBase = import.meta.env.BASE_URL?.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL || './'}/`;

// Preload Hasnain's real photo asset once
export const defaultHasnainImg = new Image();
if (typeof window !== 'undefined') {
  defaultHasnainImg.src = `${assetBase}hasnain.png`;
}

export const CHARACTER_CATALOG: PlayerCharacter[] = [
  {
    id: 'classic',
    name: 'Hasnain',
    tagline: 'The Original Aviator',
    price: 0,
    unlocked: true,
    category: 'classic',
    accentColor: '#38bdf8',
    wingColor: '#ffffff',
    wingBorder: '#94a3b8',
    description: 'The real flying brother Hasnain with signature hair and wings!',
  },
  {
    id: 'royal',
    name: 'Crown Hasnain',
    tagline: 'King of the Skies',
    price: 50,
    unlocked: false,
    category: 'mythic',
    accentColor: '#e11d48',
    glowColor: '#f43f5e',
    wingColor: '#fee2e2',
    wingBorder: '#dc2626',
    description: 'Adorned with a ruby-encrusted royal golden crown!',
  },
  {
    id: 'funny',
    name: 'Party Hasnain',
    tagline: 'Party Mood',
    price: 100,
    unlocked: false,
    category: 'fun',
    accentColor: '#f43f5e',
    glowColor: '#fb7185',
    wingColor: '#fed7aa',
    wingBorder: '#f97316',
    description: 'Equipped with a polka-dot party cone hat for celebrations!',
  },
  {
    id: 'neon',
    name: 'Cool Shades',
    tagline: 'Synthwave Glider',
    price: 150,
    unlocked: false,
    category: 'futuristic',
    accentColor: '#d946ef',
    glowColor: '#f0abfc',
    wingColor: '#fae8ff',
    wingBorder: '#c026d3',
    description: 'Hasnain rocking retro futuristic glowing sunglasses!',
  },
  {
    id: 'golden',
    name: 'Golden Star',
    tagline: 'Pure 24-Karat Swagger',
    price: 250,
    unlocked: false,
    category: 'mythic',
    accentColor: '#f59e0b',
    glowColor: '#fde047',
    wingColor: '#fef08a',
    wingBorder: '#d97706',
    description: 'Shimmering with pure gold wings and a sunny aura!',
  },
  {
    id: 'robot',
    name: 'Cyber Hasnain',
    tagline: 'Cybernetic Flight Unit',
    price: 300,
    unlocked: false,
    category: 'futuristic',
    accentColor: '#06b6d4',
    glowColor: '#22d3ee',
    wingColor: '#cbd5e1',
    wingBorder: '#0891b2',
    description: 'Equipped with a glowing cyber visor and high-speed wings!',
  },
  {
    id: 'sleepy',
    name: 'Sleepy Hasnain',
    tagline: 'Cozy Aviator',
    price: 350,
    unlocked: false,
    category: 'fun',
    accentColor: '#818cf8',
    glowColor: '#a5b4fc',
    wingColor: '#e0e7ff',
    wingBorder: '#6366f1',
    description: 'Flying in total relaxation with cozy nightcap!',
  },
  {
    id: 'pixel',
    name: 'Pixel Hasnain',
    tagline: '8-Bit Retro Pilot',
    price: 400,
    unlocked: false,
    category: 'futuristic',
    accentColor: '#10b981',
    glowColor: '#34d399',
    wingColor: '#d1fae5',
    wingBorder: '#059669',
    description: 'Retro arcade style with emerald pixel wing accents!',
  },
  {
    id: 'space',
    name: 'Astro Hasnain',
    tagline: 'Space Explorer',
    price: 500,
    unlocked: false,
    category: 'futuristic',
    accentColor: '#8b5cf6',
    glowColor: '#a78bfa',
    wingColor: '#f1f5f9',
    wingBorder: '#7c3aed',
    description: 'Cosmic bubble helmet with stellar reflections!',
  },
  {
    id: 'ice',
    name: 'Ice Glider',
    tagline: 'Sub-Zero Aviator',
    price: 600,
    unlocked: false,
    category: 'elemental',
    accentColor: '#38bdf8',
    glowColor: '#7dd3fc',
    wingColor: '#e0f2fe',
    wingBorder: '#0284c7',
    description: 'Frosty crystal wings and chilly wind trails!',
  },
  {
    id: 'fire',
    name: 'Fire Phoenix',
    tagline: 'Blazing Speedster',
    price: 700,
    unlocked: false,
    category: 'elemental',
    accentColor: '#ea580c',
    glowColor: '#fb923c',
    wingColor: '#ffedd5',
    wingBorder: '#c2410c',
    description: 'Superheated fiery aura with phoenix wings!',
  },
  {
    id: 'shadow',
    name: 'Shadow Hasnain',
    tagline: 'Twilight Master',
    price: 900,
    unlocked: false,
    category: 'mythic',
    accentColor: '#6366f1',
    glowColor: '#818cf8',
    wingColor: '#334155',
    wingBorder: '#475569',
    description: 'Midnight ninja aura with mystical twilight wings!',
  },
];

// High-performance character drawing with ZERO shadowBlur (60fps guaranteed on mobile)
export function drawHasnainCharacter(
  ctx: CanvasRenderingContext2D,
  char: PlayerCharacter,
  x: number,
  y: number,
  radius: number,
  wingPhase: number,
  tiltAngle: number,
  customImg?: HTMLImageElement | null
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tiltAngle);

  // Lightweight crisp ring for special skins (zero Gaussian blur pass!)
  if (char.glowColor) {
    ctx.strokeStyle = char.glowColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- 1. ANIMATED WINGS ---
  const wingFlap = Math.sin(wingPhase);
  const wingAngle = wingFlap * 0.48;

  // Left Wing
  ctx.save();
  ctx.translate(-radius * 0.88, radius * 0.05);
  ctx.rotate(-0.35 - wingAngle);
  drawSingleWing(ctx, radius, char.wingColor, char.wingBorder, true);
  ctx.restore();

  // Right Wing
  ctx.save();
  ctx.translate(radius * 0.88, radius * 0.05);
  ctx.rotate(0.35 + wingAngle);
  drawSingleWing(ctx, radius, char.wingColor, char.wingBorder, false);
  ctx.restore();

  // --- 2. HASNAIN'S REAL HEAD PHOTO ---
  const imgToUse =
    (customImg && customImg.complete && customImg.naturalWidth > 0)
      ? customImg
      : (defaultHasnainImg && defaultHasnainImg.complete && defaultHasnainImg.naturalWidth > 0)
      ? defaultHasnainImg
      : null;

  if (imgToUse) {
    const headW = radius * 2.25;
    const aspect = imgToUse.naturalHeight > 0
      ? imgToUse.naturalHeight / imgToUse.naturalWidth
      : 1.17;
    const headH = headW * aspect;

    // Direct drawImage with zero shadow blur overhead
    ctx.drawImage(imgToUse, -headW * 0.5, -headH * 0.52, headW, headH);

    // Draw Hat/Accessory
    drawCosmeticAccessories(ctx, char.id, radius);
  } else {
    // Clean fallback circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd3b8';
    ctx.fill();
    ctx.strokeStyle = '#e07a42';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  ctx.restore();
}

function drawSingleWing(
  ctx: CanvasRenderingContext2D,
  radius: number,
  fillColor: string,
  borderColor: string,
  isLeft: boolean
) {
  const dir = isLeft ? -1 : 1;
  const w = radius * 1.25;
  const h = radius * 0.82;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(dir * w * 0.6, -h * 1.25, dir * w * 1.35, -h * 0.42, dir * w * 1.15, 0);
  ctx.bezierCurveTo(dir * w * 0.95, h * 0.52, dir * w * 0.4, h * 0.72, 0, 0);

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Feather rib lines
  ctx.beginPath();
  ctx.moveTo(dir * w * 0.35, -h * 0.22);
  ctx.lineTo(dir * w * 0.78, -h * 0.12);
  ctx.moveTo(dir * w * 0.38, 0.1 * h);
  ctx.lineTo(dir * w * 0.82, 0.2 * h);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function drawCosmeticAccessories(
  ctx: CanvasRenderingContext2D,
  charId: string,
  radius: number
) {
  const s = radius / 28;

  if (charId === 'royal') {
    // Golden royal crown
    ctx.save();
    ctx.translate(0, -28 * s);
    ctx.beginPath();
    ctx.moveTo(-16 * s, 6 * s);
    ctx.lineTo(-16 * s, -12 * s);
    ctx.lineTo(-8 * s, -3 * s);
    ctx.lineTo(0, -16 * s);
    ctx.lineTo(8 * s, -3 * s);
    ctx.lineTo(16 * s, -12 * s);
    ctx.lineTo(16 * s, 6 * s);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5 * s;
    ctx.stroke();

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(-16 * s, -12 * s, 3 * s, 0, Math.PI * 2);
    ctx.arc(0, -16 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.arc(16 * s, -12 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (charId === 'funny') {
    // Party cone hat
    ctx.save();
    ctx.translate(2 * s, -26 * s);
    ctx.rotate(0.12);
    ctx.beginPath();
    ctx.moveTo(-11 * s, 0);
    ctx.lineTo(0, -26 * s);
    ctx.lineTo(11 * s, 0);
    ctx.closePath();
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -27 * s, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.restore();
  } else if (charId === 'neon') {
    // Retro sunglasses
    ctx.save();
    ctx.translate(0, -2 * s);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-17 * s, -4 * s, 15 * s, 9 * s);
    ctx.fillRect(2 * s, -4 * s, 15 * s, 9 * s);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(-17 * s, -4 * s, 15 * s, 9 * s);
    ctx.strokeRect(2 * s, -4 * s, 15 * s, 9 * s);
    ctx.beginPath();
    ctx.moveTo(-2 * s, 0);
    ctx.lineTo(2 * s, 0);
    ctx.stroke();
    ctx.restore();
  } else if (charId === 'robot') {
    // Glowing cyan cyber visor
    ctx.save();
    ctx.translate(0, -2 * s);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.fillRect(-18 * s, -5 * s, 36 * s, 10 * s);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(-18 * s, -5 * s, 36 * s, 10 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4 * s, -2 * s, 8 * s, 4 * s);
    ctx.restore();
  } else if (charId === 'sleepy') {
    // Nightcap
    ctx.save();
    ctx.translate(-2 * s, -22 * s);
    ctx.beginPath();
    ctx.moveTo(-15 * s, 2 * s);
    ctx.quadraticCurveTo(-2 * s, -14 * s, 15 * s, -2 * s);
    ctx.quadraticCurveTo(23 * s, 6 * s, 25 * s, 12 * s);
    ctx.lineTo(17 * s, 8 * s);
    ctx.quadraticCurveTo(0, -8 * s, -15 * s, 2 * s);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(25 * s, 13 * s, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
}
