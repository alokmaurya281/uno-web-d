import React from 'react';
import { motion } from 'framer-motion';
import type { CardColor, UnoCard } from '../../game/unoEngine';
import { InteractiveCard3D, type CardColor as RenderColor, type CardValue as RenderValue } from '../InteractiveCard3D';

interface GameTable3DProps {
  currentColor: CardColor;
  topDiscardCard: UnoCard;
  discardPile: UnoCard[];
  deckCount: number;
  direction: 1 | -1;
  pendingDraw: number;
  isPlayerTurn: boolean;
  onDrawCard: () => void;
}

export const GameTable3D: React.FC<GameTable3DProps> = ({
  currentColor,
  topDiscardCard,
  discardPile,
  deckCount,
  direction,
  pendingDraw,
  isPlayerTurn,
  onDrawCard,
}) => {
  // Map engine card color to InteractiveCard3D color
  const mapColor = (col: CardColor): RenderColor => {
    if (col === 'wild') return 'black';
    return col;
  };

  // Map engine card value to InteractiveCard3D value
  const mapValue = (val: string): RenderValue => {
    if (val === 'draw2') return 'draw2';
    if (val === 'draw4') return 'draw4';
    if (val === 'skip') return 'skip';
    if (val === 'reverse') return 'reverse';
    if (val === 'wild') return 'wild';
    return val as RenderValue;
  };

  const colorGlow = {
    red: 'rgba(255, 59, 59, 0.45)',
    yellow: 'rgba(255, 204, 0, 0.45)',
    green: 'rgba(55, 181, 74, 0.45)',
    blue: 'rgba(0, 140, 255, 0.45)',
    wild: 'rgba(255, 255, 255, 0.4)',
  }[currentColor];

  return (
    <div className="relative w-full max-w-4xl h-[240px] sm:h-[270px] mx-auto flex items-center justify-center select-none">
      {/* 3D OVAL TABLE BASE */}
      <div 
        className="absolute inset-0 rounded-[160px] border-4 sm:border-6 border-[#2a1e12] shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, #184b2e 0%, #0d2a19 70%, #07170e 100%)',
        }}
      >
        {/* Felt Texture Grain */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Ambient Ring Glow Matching Active Color */}
        <motion.div
          animate={{
            boxShadow: `0 0 80px 20px ${colorGlow}, inset 0 0 60px 10px ${colorGlow}`,
          }}
          transition={{ duration: 0.6 }}
          className="absolute inset-8 rounded-[170px] border border-white/20 pointer-events-none"
        />

        {/* Orbiting Play Direction Arrows */}
        <motion.div
          animate={{ rotate: direction === 1 ? 360 : -360 }}
          transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
          className="absolute inset-16 rounded-[140px] pointer-events-none border border-dashed border-white/15 flex items-center justify-between px-6"
        >
          <span className="text-xs font-black tracking-widest uppercase opacity-40 text-white">
            {direction === 1 ? '▶ CLOCKWISE' : '◀ COUNTER-CLOCKWISE'}
          </span>
          <span className="text-xs font-black tracking-widest uppercase opacity-40 text-white">
            {direction === 1 ? 'CLOCKWISE ▶' : 'COUNTER-CLOCKWISE ◀'}
          </span>
        </motion.div>
      </div>

      {/* CENTER ARENA: DRAW DECK & DISCARD PILE */}
      <div className="relative z-10 flex items-center justify-center gap-8 sm:gap-16">
        {/* DRAW DECK WITH 3D LAYERED SHADOWS */}
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: isPlayerTurn ? 1.05 : 1, y: isPlayerTurn ? -6 : 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isPlayerTurn) onDrawCard();
            }}
            className={`relative cursor-pointer transition-all ${isPlayerTurn ? 'ring-4 ring-uno-yellow ring-offset-4 ring-offset-transparent shadow-[0_0_25px_rgba(255,204,0,0.6)]' : 'opacity-90'}`}
          >
            {/* Pseudo-3D Stack Depth Layers */}
            <div className="absolute top-1.5 left-1.5 w-24 h-36 rounded-xl bg-[#1a0f0f] border border-black/80 shadow-md" />
            <div className="absolute top-1 left-1 w-24 h-36 rounded-xl bg-[#2e1818] border border-black/60 shadow-md" />

            {/* Top Deck Card (Facing Down) */}
            <div className="relative w-24 h-36 rounded-xl bg-gradient-to-br from-[#1c1e24] via-[#121316] to-[#0a0b0d] border-2 border-white/30 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              <div className="w-16 h-26 rounded-lg border-2 border-uno-red/60 bg-black/50 flex flex-col items-center justify-center transform -rotate-12">
                <span className="text-lg font-black italic tracking-tighter text-uno-yellow drop-shadow-md">
                  UNO
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  DECK
                </span>
              </div>

              {/* Draw Click Prompt if User's Turn */}
              {isPlayerTurn && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="absolute bottom-1.5 px-2 py-0.5 rounded-full bg-uno-yellow text-black text-[9px] font-black uppercase tracking-wider shadow-lg"
                >
                  {pendingDraw > 0 ? `DRAW +${pendingDraw}` : 'DRAW'}
                </motion.div>
              )}
            </div>
          </motion.div>
          <span className="mt-1 text-[11px] font-bold text-gray-300 drop-shadow">
            {deckCount} cards
          </span>
        </div>

        {/* DISCARD PILE */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Prior card ghost underneath to simulate table pile */}
            {discardPile.length > 1 && (
              <div className="absolute top-1 left-1 w-24 h-36 rounded-xl bg-black/40 transform rotate-6 border border-white/10 pointer-events-none" />
            )}

            {/* Top Discard Card in full 3D */}
            <motion.div
              key={topDiscardCard.id}
              initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 2, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
            >
              <InteractiveCard3D
                color={mapColor(topDiscardCard.color)}
                value={mapValue(topDiscardCard.value)}
                size="sm"
                interactive={false}
                skin="classic"
              />
            </motion.div>
          </div>

          {/* Current Active Color & Pending Draw Indicator */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-md"
              style={{
                backgroundColor:
                  currentColor === 'red'
                    ? '#ff3b3b'
                    : currentColor === 'yellow'
                    ? '#ffcc00'
                    : currentColor === 'green'
                    ? '#37b54a'
                    : currentColor === 'blue'
                    ? '#008cff'
                    : '#ffffff',
              }}
            />
            <span className="text-xs font-black uppercase tracking-wider text-white drop-shadow">
              Active: {currentColor}
            </span>
            {pendingDraw > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase animate-pulse">
                +{pendingDraw} Stack!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
