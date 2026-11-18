import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../services/soundEffects';

interface UnoShoutButtonProps {
  showCallUno: boolean;
  catchUnoOpponentName?: string;
  onCallUno: () => void;
  onCatchUno: () => void;
}

export const UnoShoutButton: React.FC<UnoShoutButtonProps> = ({
  showCallUno,
  catchUnoOpponentName,
  onCallUno,
  onCatchUno,
}) => {
  return (
    <div className="fixed bottom-28 right-6 sm:right-12 z-30 flex flex-col items-center gap-3">
      <AnimatePresence>
        {/* PLAYER'S OWN UNO SHOUT BUTTON */}
        {showCallUno && (
          <motion.button
            key="call-uno"
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1, rotate: [0, 5, -5, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { repeat: Infinity, duration: 1.2 },
              rotate: { repeat: Infinity, duration: 1.2 },
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sfx.playUnoShout();
              onCallUno();
            }}
            className="px-6 py-4 rounded-3xl bg-gradient-to-r from-uno-red via-red-600 to-amber-500 text-white font-black italic text-xl sm:text-2xl tracking-tighter uppercase border-4 border-yellow-300 shadow-[0_0_40px_rgba(255,59,59,0.9)] flex items-center gap-2"
          >
            🔥 CALL UNO!
          </motion.button>
        )}

        {/* CATCH OPPONENT UNO PENALTY BUTTON */}
        {catchUnoOpponentName && (
          <motion.button
            key="catch-uno"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sfx.playPenalty();
              onCatchUno();
            }}
            className="px-5 py-3 rounded-2xl bg-amber-500 text-black font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-white shadow-[0_0_25px_rgba(255,204,0,0.8)]"
          >
            ⚡ CATCH {catchUnoOpponentName.toUpperCase()} (+2)
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
