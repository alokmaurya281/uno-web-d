import React from 'react';
import { motion } from 'framer-motion';
import type { CardColor } from '../../game/unoEngine';
import { sfx } from '../../services/soundEffects';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: CardColor) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onSelectColor,
}) => {
  if (!isOpen) return null;

  const colors: Array<{ color: CardColor; label: string; bg: string; glow: string }> = [
    { color: 'red', label: 'RED', bg: 'bg-uno-red', glow: 'shadow-[0_0_35px_rgba(255,59,59,0.8)]' },
    { color: 'blue', label: 'BLUE', bg: 'bg-uno-blue', glow: 'shadow-[0_0_35px_rgba(0,140,255,0.8)]' },
    { color: 'green', label: 'GREEN', bg: 'bg-uno-green', glow: 'shadow-[0_0_35px_rgba(55,181,74,0.8)]' },
    { color: 'yellow', label: 'YELLOW', bg: 'bg-uno-yellow text-black', glow: 'shadow-[0_0_35px_rgba(255,204,0,0.8)]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className="glass-dark border border-white/20 p-8 rounded-3xl text-center max-w-sm w-full mx-4 shadow-2xl space-y-6"
      >
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-wider text-white">
            Choose Next Color
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Pick a color to dictate the next round of play
          </p>
        </div>

        {/* 4 QUADRANT RING BUTTONS */}
        <div className="grid grid-cols-2 gap-4">
          {colors.map((c) => (
            <motion.button
              key={c.color}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sfx.playWild();
                onSelectColor(c.color);
              }}
              className={`h-24 rounded-2xl ${c.bg} font-black text-lg tracking-widest flex items-center justify-center transition-all ${c.glow} border-2 border-white/30`}
            >
              {c.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
