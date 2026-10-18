import React, { useState, useRef } from 'react';
import { sfx } from '../services/soundEffects';

export type CardColor = 'red' | 'yellow' | 'green' | 'blue' | 'black';
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'draw4';
export type SkinId = 'classic' | 'dark-obsidian' | 'gold-foil' | 'aurora' | 'neon-cyber' | 'retro-pixel' | 'champion';

interface InteractiveCard3DProps {
  color: CardColor;
  value: CardValue;
  skin?: SkinId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isFlipped?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const InteractiveCard3D: React.FC<InteractiveCard3DProps> = ({
  color,
  value,
  skin = 'classic',
  size = 'md',
  isFlipped = false,
  interactive = true,
  onClick,
  className = '',
}) => {
  const [internalFlipped, setInternalFlipped] = useState(isFlipped);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const flipped = isFlipped || internalFlipped;

  // Handle 3D Mouse Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-15 to 15 degrees)
    const rotX = ((y - centerY) / centerY) * -16;
    const rotY = ((x - centerX) / centerX) * 16;
    setRotateX(rotX);
    setRotateY(rotY);

    // Glare position
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseEnter = () => {
    if (interactive) sfx.playCardClick();
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleCardClick = () => {
    if (interactive && !onClick) {
      sfx.playCardFlip();
      setInternalFlipped(!internalFlipped);
    }
    if (onClick) {
      sfx.playCardPlay();
      onClick();
    }
  };

  // Dimensions based on size
  const sizeClasses = {
    sm: 'w-24 h-36 rounded-xl text-base',
    md: 'w-40 h-60 rounded-2xl text-2xl',
    lg: 'w-56 h-84 rounded-3xl text-4xl',
    xl: 'w-64 h-96 rounded-[2rem] text-5xl',
  }[size];

  // Base background color scheme
  const getColorScheme = () => {
    switch (skin) {
      case 'dark-obsidian':
        return {
          bg: 'bg-gradient-to-br from-[#1c1e24] via-[#121316] to-[#0a0b0d]',
          border: 'border-[#2d3139]',
          text: color === 'red' ? 'text-[#ff4d4d]' : color === 'yellow' ? 'text-[#ffd000]' : color === 'green' ? 'text-[#00e676]' : color === 'blue' ? 'text-[#00b0ff]' : 'text-white',
          oval: 'bg-[#181a20]/90 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]',
          glow: color === 'red' ? 'shadow-[0_0_25px_rgba(255,59,59,0.3)]' : color === 'yellow' ? 'shadow-[0_0_25px_rgba(255,204,0,0.3)]' : color === 'green' ? 'shadow-[0_0_25px_rgba(55,181,74,0.3)]' : color === 'blue' ? 'shadow-[0_0_25px_rgba(0,140,255,0.3)]' : 'shadow-[0_0_25px_rgba(255,255,255,0.2)]',
        };
      case 'gold-foil':
        return {
          bg: 'bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#aa7c11]',
          border: 'border-[#fff4a3]',
          text: 'text-[#3b2b00]',
          oval: 'bg-gradient-to-tr from-[#fff7c2] to-[#ffd700] border-2 border-[#fff8d4] shadow-md',
          glow: 'shadow-[0_0_30px_rgba(255,215,0,0.5)]',
        };
      case 'aurora':
        return {
          bg: 'bg-gradient-to-br from-[#00f2fe] via-[#4facfe] to-[#a8edea]',
          border: 'border-white/40',
          text: 'text-[#09203f]',
          oval: 'bg-white/80 backdrop-blur-md border border-white shadow-inner',
          glow: 'shadow-[0_0_30px_rgba(79,172,254,0.5)]',
        };
      case 'neon-cyber':
        return {
          bg: 'bg-[#050508] border-2 ' + (color === 'red' ? 'border-[#ff0055]' : color === 'yellow' ? 'border-[#ffe600]' : color === 'green' ? 'border-[#00ff88]' : color === 'blue' ? 'border-[#00e5ff]' : 'border-[#d000ff]'),
          border: '',
          text: color === 'red' ? 'text-[#ff0055]' : color === 'yellow' ? 'text-[#ffe600]' : color === 'green' ? 'text-[#00ff88]' : color === 'blue' ? 'text-[#00e5ff]' : 'text-[#d000ff]',
          oval: 'bg-black/90 border border-white/20',
          glow: color === 'red' ? 'shadow-[0_0_30px_#ff0055]' : color === 'yellow' ? 'shadow-[0_0_30px_#ffe600]' : color === 'green' ? 'shadow-[0_0_30px_#00ff88]' : color === 'blue' ? 'shadow-[0_0_30px_#00e5ff]' : 'shadow-[0_0_30px_#d000ff]',
        };
      case 'retro-pixel':
        return {
          bg: color === 'red' ? 'bg-[#e52521]' : color === 'yellow' ? 'bg-[#fbb034]' : color === 'green' ? 'bg-[#43a047]' : color === 'blue' ? 'bg-[#1e88e5]' : 'bg-[#212121]',
          border: 'border-4 border-black',
          text: 'text-black font-mono',
          oval: 'bg-white border-2 border-black rounded-none',
          glow: 'shadow-[4px_4px_0px_#000]',
        };
      case 'champion':
        return {
          bg: 'bg-gradient-to-br from-[#780206] to-[#061161]',
          border: 'border-2 border-[#ffd700]',
          text: 'text-[#ffd700]',
          oval: 'bg-black/70 border border-[#ffd700]/60 shadow-[inset_0_0_15px_rgba(255,215,0,0.4)]',
          glow: 'shadow-[0_0_30px_rgba(255,215,0,0.4)]',
        };
      default: // classic
        return {
          bg: color === 'red' ? 'bg-gradient-to-br from-[#ff3b3b] to-[#d31010]'
            : color === 'yellow' ? 'bg-gradient-to-br from-[#ffcc00] to-[#e69900]'
            : color === 'green' ? 'bg-gradient-to-br from-[#37b54a] to-[#258233]'
            : color === 'blue' ? 'bg-gradient-to-br from-[#008cff] to-[#005fb8]'
            : 'bg-gradient-to-br from-[#2a2a2e] to-[#121214]',
          border: 'border-white/30',
          text: color === 'red' ? 'text-[#ff3b3b]' : color === 'yellow' ? 'text-[#d99b00]' : color === 'green' ? 'text-[#258233]' : color === 'blue' ? 'text-[#0070cc]' : 'text-white',
          oval: 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
          glow: color === 'red' ? 'shadow-[0_10px_30px_rgba(255,59,59,0.35)]' : color === 'yellow' ? 'shadow-[0_10px_30px_rgba(255,204,0,0.35)]' : color === 'green' ? 'shadow-[0_10px_30px_rgba(55,181,74,0.35)]' : color === 'blue' ? 'shadow-[0_10px_30px_rgba(0,140,255,0.35)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.4)]',
        };
    }
  };

  const scheme = getColorScheme();

  // Render symbol or number
  const renderCardSymbol = (isCorner = false) => {
    switch (value) {
      case 'skip':
        return <span className={isCorner ? 'text-[0.65em] font-black' : 'text-[1.2em] font-black'}>⊘</span>;
      case 'reverse':
        return <span className={isCorner ? 'text-[0.65em] font-black' : 'text-[1.2em] font-black'}>⇄</span>;
      case 'draw2':
        return <span className={isCorner ? 'text-[0.65em] font-black tracking-tight' : 'text-[1.1em] font-black tracking-tight'}>+2</span>;
      case 'draw4':
        return (
          <div className="flex flex-col items-center">
            <span className={isCorner ? 'text-[0.65em] font-black' : 'text-[1.1em] font-black'}>+4</span>
            {!isCorner && (
              <div className="flex gap-1 mt-1">
                <span className="w-2.5 h-3 bg-uno-red rounded-xs" />
                <span className="w-2.5 h-3 bg-uno-blue rounded-xs" />
                <span className="w-2.5 h-3 bg-uno-yellow rounded-xs" />
                <span className="w-2.5 h-3 bg-uno-green rounded-xs" />
              </div>
            )}
          </div>
        );
      case 'wild':
        return (
          <div className="flex flex-col items-center">
            <div className={isCorner ? 'w-3 h-3 rounded-full flex flex-wrap overflow-hidden' : 'w-10 h-10 rounded-full flex flex-wrap overflow-hidden shadow-md'}>
              <div className="w-1/2 h-1/2 bg-uno-red" />
              <div className="w-1/2 h-1/2 bg-uno-blue" />
              <div className="w-1/2 h-1/2 bg-uno-yellow" />
              <div className="w-1/2 h-1/2 bg-uno-green" />
            </div>
            {!isCorner && <span className="text-[0.35em] font-black uppercase tracking-widest mt-1 text-black">WILD</span>}
          </div>
        );
      default:
        return <span className="font-black italic tracking-tighter">{value}</span>;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`relative select-none cursor-pointer [perspective:1000px] transition-transform duration-200 active:scale-95 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY + (flipped ? 180 : 0)}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {/* CARD FRONT */}
      <div
        className={`relative ${sizeClasses} p-2.5 flex flex-col justify-between overflow-hidden border ${scheme.border} ${scheme.bg} ${scheme.glow} [backface-visibility:hidden]`}
      >
        {/* Dynamic Specular Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, transparent 60%)`,
          }}
        />

        {/* Top-Left Corner Index */}
        <div className="flex flex-col items-start leading-none drop-shadow">
          <span className="text-white font-black italic">{renderCardSymbol(true)}</span>
        </div>

        {/* Center Oval with Emblem */}
        <div className="relative w-full h-[65%] flex items-center justify-center">
          <div
            className={`w-[82%] h-[92%] -rotate-25 rounded-[50%] flex items-center justify-center transition-all ${scheme.oval}`}
          >
            <div className={`rotate-25 ${scheme.text} drop-shadow-md flex items-center justify-center`}>
              {renderCardSymbol(false)}
            </div>
          </div>
        </div>

        {/* Bottom-Right Corner Index (Inverted) */}
        <div className="flex flex-col items-end leading-none rotate-180 drop-shadow">
          <span className="text-white font-black italic">{renderCardSymbol(true)}</span>
        </div>
      </div>

      {/* CARD BACK */}
      <div
        className={`absolute inset-0 ${sizeClasses} p-2 flex items-center justify-center overflow-hidden border border-white/20 bg-gradient-to-br from-[#1c1d22] via-[#0f1012] to-[#050507] shadow-2xl [backface-visibility:hidden]`}
        style={{ transform: 'rotateY(180deg)' }}
      >
        {/* Card Back Graphic */}
        <div className="w-[88%] h-[92%] rounded-xl border border-white/10 bg-black/60 flex items-center justify-center relative overflow-hidden">
          {/* Decorative Oval Ring */}
          <div className="w-[90%] h-[80%] -rotate-25 rounded-[50%] border-4 border-uno-red/80 flex items-center justify-center shadow-[0_0_20px_rgba(255,59,59,0.3)]">
            <span className="rotate-25 font-black italic text-3xl md:text-4xl tracking-tighter text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              UNO<span className="text-uno-red">.</span>
            </span>
          </div>
          {/* Subtle watermarked corner dots */}
          <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {skin}
          </div>
        </div>
      </div>
    </div>
  );
};
