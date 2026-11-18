import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Coins, Flame } from 'lucide-react';
import type { Player } from '../../game/unoEngine';
import { sfx } from '../../services/soundEffects';

interface GameOverModalProps {
  winner: Player | null;
  isPlayerWinner: boolean;
  coinsEarned: number;
  totalTurns: number;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  isPlayerWinner,
  coinsEarned,
  totalTurns,
  onPlayAgain,
  onReturnHome,
}) => {
  useEffect(() => {
    if (isPlayerWinner) {
      sfx.playRewardWin();
    } else {
      sfx.playDefeat();
    }
  }, [isPlayerWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="glass-dark border border-white/20 p-8 sm:p-10 rounded-3xl text-center max-w-lg w-full mx-4 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Glow Background */}
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[90px] opacity-40 pointer-events-none ${
            isPlayerWinner ? 'bg-uno-yellow' : 'bg-uno-red'
          }`}
        />

        {/* Victory Icon / Defeat Badge */}
        <div className="relative flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl ${
              isPlayerWinner
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 border-white text-black shadow-[0_0_50px_rgba(255,204,0,0.8)]'
                : 'bg-gradient-to-tr from-red-600 to-rose-400 border-white text-white shadow-[0_0_50px_rgba(255,59,59,0.8)]'
            }`}
          >
            {isPlayerWinner ? <Trophy size={48} /> : <Flame size={48} />}
          </motion.div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase text-white">
            {isPlayerWinner ? 'VICTORY!' : 'MATCH DEFEAT'}
          </h2>
          <p className="text-sm font-medium text-gray-300 mt-2">
            {isPlayerWinner
              ? 'Congratulations! You emptied your hand and won the match!'
              : `${winner?.name || 'Opponent'} emptied their hand and claimed the round.`}
          </p>
        </div>

        {/* MATCH REWARDS & STATS */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-uno-yellow font-black text-2xl">
              <Coins size={22} />
              +{coinsEarned}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Coins Rewarded
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="font-black text-2xl text-white">{totalTurns}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Turns Played
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className="flex-1 py-4 rounded-2xl bg-uno-red text-white font-black uppercase text-sm tracking-wider shadow-[0_10px_25px_rgba(255,59,59,0.5)] flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Play Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReturnHome}
            className="py-4 px-6 rounded-2xl bg-white/10 text-white font-black uppercase text-sm tracking-wider hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} /> Lobby
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
