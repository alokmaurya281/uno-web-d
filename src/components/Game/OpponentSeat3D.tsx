import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '../../game/unoEngine';

interface OpponentSeat3DProps {
  player: Player;
  isTurn: boolean;
  position: 'top' | 'left' | 'right';
  actionBubble?: string;
  turnCountdown?: number;
}

export const OpponentSeat3D: React.FC<OpponentSeat3DProps> = ({
  player,
  isTurn,
  position,
  actionBubble,
  turnCountdown,
}) => {
  const cardCount = player.cards.length;
  const isUno = cardCount === 1;

  // Max 8 visible cards to avoid visual clutter
  const visibleCards = Math.min(cardCount, 8);

  const positionStyles = {
    top: 'flex-col items-center',
    left: 'flex-row items-center',
    right: 'flex-row-reverse items-center',
  }[position];

  return (
    <div className={`relative flex ${positionStyles} gap-3 z-20`}>
      {/* ACTION SPEECH BUBBLE */}
      <AnimatePresence>
        {actionBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute -top-10 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-black shadow-2xl z-30 whitespace-nowrap border-2 border-uno-yellow"
          >
            {actionBubble}
            {/* Bubble arrow */}
            <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-white transform -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-uno-yellow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAYER AVATAR & BADGE */}
      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Animated Turn Spotlight Ring */}
          {isTurn && (
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{ rotate: { repeat: Infinity, duration: 4, ease: 'linear' }, scale: { repeat: Infinity, duration: 1.5 } }}
              className="absolute -inset-2 rounded-full border-2 border-dashed border-uno-yellow shadow-[0_0_20px_rgba(255,204,0,0.8)]"
            />
          )}

          {/* Avatar Image */}
          <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 ${isTurn ? 'border-uno-yellow' : 'border-white/30'} shadow-xl bg-gray-800`}>
            <img
              src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Turn Countdown Ring Badge */}
          {isTurn && turnCountdown !== undefined && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-uno-red text-white text-[10px] font-black flex items-center justify-center border border-white shadow-lg">
              {turnCountdown}
            </div>
          )}

          {/* UNO Warning Badge */}
          {isUno && (
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-uno-red text-white text-[10px] font-black italic border border-white shadow-xl"
            >
              UNO!
            </motion.div>
          )}
        </div>

        {/* Player Name & Tag */}
        <div className="mt-1 text-center">
          <span className="block text-xs font-black text-white drop-shadow">
            {player.name}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
        </div>
      </div>

      {/* 3D MINI CARD FAN */}
      <div className="relative flex items-center justify-center h-16 w-24">
        {Array.from({ length: visibleCards }).map((_, idx) => {
          const mid = (visibleCards - 1) / 2;
          const offset = idx - mid;
          const rot = offset * 12;
          const transX = offset * 8;

          return (
            <div
              key={idx}
              className="absolute w-8 h-12 sm:w-10 sm:h-14 rounded-md bg-gradient-to-br from-[#20222a] via-[#14151a] to-[#0a0b0d] border border-white/20 shadow-md flex items-center justify-center"
              style={{
                transform: `translateX(${transX}px) rotate(${rot}deg)`,
                zIndex: idx,
              }}
            >
              <div className="w-5 h-8 rounded border border-uno-red/40 bg-black/40 flex items-center justify-center">
                <span className="text-[8px] font-black text-uno-yellow italic">U</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
