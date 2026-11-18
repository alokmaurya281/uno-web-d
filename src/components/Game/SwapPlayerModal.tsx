import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../game/unoEngine';
import { sfx } from '../../services/soundEffects';

interface SwapPlayerModalProps {
  isOpen: boolean;
  opponents: Player[];
  onSelectPlayer: (player: Player) => void;
}

export const SwapPlayerModal: React.FC<SwapPlayerModalProps> = ({
  isOpen,
  opponents,
  onSelectPlayer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className="glass-dark border border-white/20 p-8 rounded-3xl text-center max-w-md w-full mx-4 shadow-2xl space-y-6"
      >
        <div>
          <span className="px-3 py-1 rounded-full bg-uno-red/20 text-uno-red text-xs font-black uppercase tracking-widest border border-uno-red/30">
            7-0 Swap Rule
          </span>
          <h3 className="text-2xl font-black italic uppercase tracking-wider text-white mt-2">
            Swap Hand With Opponent
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Choose an opponent whose entire hand you want to swap with!
          </p>
        </div>

        {/* OPPONENTS LIST */}
        <div className="space-y-3">
          {opponents.map((opponent) => (
            <motion.button
              key={opponent.id}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sfx.playSwap();
                onSelectPlayer(opponent);
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-uno-yellow transition-all shadow-md group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={opponent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent.name}`}
                  alt={opponent.name}
                  className="w-12 h-12 rounded-full border border-white/20 object-cover"
                />
                <div className="text-left">
                  <span className="block font-bold text-white group-hover:text-uno-yellow transition-colors">
                    {opponent.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    Bot • {opponent.personality || 'Normal'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-lg bg-black/40 text-uno-yellow font-black text-sm border border-white/10">
                  {opponent.cards.length} {opponent.cards.length === 1 ? 'card' : 'cards'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
