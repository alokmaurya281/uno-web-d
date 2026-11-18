import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { UnoCard, CardColor } from '../../game/unoEngine';
import { UnoGameEngine } from '../../game/unoEngine';
import { InteractiveCard3D, type CardColor as RenderColor, type CardValue as RenderValue, type SkinId } from '../InteractiveCard3D';

interface PlayerHand3DProps {
  cards: UnoCard[];
  topDiscardCard: UnoCard;
  currentColor: CardColor;
  pendingDraw: number;
  isPlayerTurn: boolean;
  rules: any;
  skin?: SkinId;
  onPlayCard: (card: UnoCard) => void;
}

export const PlayerHand3D: React.FC<PlayerHand3DProps> = ({
  cards,
  topDiscardCard,
  currentColor,
  pendingDraw,
  isPlayerTurn,
  rules,
  skin = 'classic',
  onPlayCard,
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const mapColor = (col: CardColor): RenderColor => {
    if (col === 'wild') return 'black';
    return col;
  };

  const mapValue = (val: string): RenderValue => {
    if (val === 'draw2') return 'draw2';
    if (val === 'draw4') return 'draw4';
    if (val === 'skip') return 'skip';
    if (val === 'reverse') return 'reverse';
    if (val === 'wild') return 'wild';
    return val as RenderValue;
  };

  const totalCards = cards.length;

  return (
    <div className="relative w-full max-w-5xl h-48 sm:h-56 mx-auto flex items-center justify-center select-none overflow-visible mb-6 sm:mb-10">
      <div className="relative flex items-center justify-center w-full">
        {cards.map((card, idx) => {
          const isPlayable = isPlayerTurn && UnoGameEngine.canPlayCard(card, topDiscardCard, currentColor, pendingDraw, rules);
          const isHovered = hoveredCardId === card.id;

          // Fan Calculation
          const mid = (totalCards - 1) / 2;
          const diff = idx - mid;

          // Scale spread based on count to prevent offscreen overflow
          const maxSpread = Math.min(42, 440 / Math.max(totalCards, 1));
          const rotDeg = diff * (totalCards > 10 ? 3.5 : 5);
          const transX = diff * maxSpread;
          const transY = Math.abs(diff) * (totalCards > 10 ? 2.5 : 4) - 30;

          return (
            <motion.div
              key={card.id}
              initial={{ y: 80, opacity: 0 }}
              animate={{
                y: isHovered ? -75 : transY,
                x: transX,
                rotateZ: isHovered ? 0 : rotDeg,
                scale: isHovered ? 1.35 : 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 30,
              }}
              style={{
                zIndex: isHovered ? 100 : idx + 10,
                position: 'absolute',
              }}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => {
                if (isPlayable) {
                  onPlayCard(card);
                }
              }}
              className={`cursor-pointer transition-shadow rounded-xl ${
                isPlayable
                  ? 'ring-2 ring-uno-yellow ring-offset-2 ring-offset-black/50 shadow-[0_0_20px_rgba(255,204,0,0.7)]'
                  : isPlayerTurn
                  ? 'opacity-60 brightness-75 hover:opacity-80'
                  : 'opacity-85'
              }`}
            >
              {/* Playable Pulse indicator */}
              {isPlayable && !isHovered && (
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-1 rounded-xl border-2 border-uno-yellow pointer-events-none"
                />
              )}

              <InteractiveCard3D
                color={mapColor(card.color)}
                value={mapValue(card.value)}
                size="sm"
                interactive={false}
                skin={skin}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
