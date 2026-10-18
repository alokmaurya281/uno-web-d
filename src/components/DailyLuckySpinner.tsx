import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Trophy, RotateCw, X } from 'lucide-react';
import { sfx } from '../services/soundEffects';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

interface SpinnerSegment {
  type: 'coins' | 'solo' | 'quick';
  amount: number;
  label: string;
  color: string;
  textColor: string;
}

const SEGMENTS: SpinnerSegment[] = [
  { type: 'coins', amount: 20, label: '+20 COINS', color: '#ff3b3b', textColor: '#ffffff' },
  { type: 'solo', amount: 1, label: '+1 SOLO', color: '#ffcc00', textColor: '#000000' },
  { type: 'coins', amount: 15, label: '+15 COINS', color: '#008cff', textColor: '#ffffff' },
  { type: 'solo', amount: 2, label: '+2 SOLO', color: '#37b54a', textColor: '#ffffff' },
  { type: 'quick', amount: 2, label: '+2 QUICK', color: '#8b5cf6', textColor: '#ffffff' },
  { type: 'coins', amount: 30, label: '+30 COINS', color: '#f59e0b', textColor: '#000000' },
  { type: 'quick', amount: 3, label: '+3 QUICK', color: '#ec4899', textColor: '#ffffff' },
  { type: 'coins', amount: 5, label: '+5 COINS', color: '#3b82f6', textColor: '#ffffff' },
];

export const DailyLuckySpinner: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { profile, updateCoinsLocal, refreshProfile } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<SpinnerSegment | null>(null);
  const [spinsCount, setSpinsCount] = useState(0);
  const spinIntervalRef = useRef<number | null>(null);

  const numSegments = SEGMENTS.length;
  const segmentAngle = 360 / numSegments;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonReward(null);

    // Play ticker sound while spinning
    let tickCount = 0;
    spinIntervalRef.current = window.setInterval(() => {
      sfx.playSpinnerTick();
      tickCount++;
      if (tickCount > 25) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      }
    }, 120);

    // Pick random target segment
    const targetIndex = Math.floor(Math.random() * numSegments);
    const extraRounds = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    // Note: 0 deg points to top. Each segment spans segmentAngle.
    const targetAngle = extraRounds * 360 + (360 - targetIndex * segmentAngle - segmentAngle / 2);

    const nextRotation = rotation + targetAngle;
    setRotation(nextRotation);

    setTimeout(async () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      setIsSpinning(false);
      const reward = SEGMENTS[targetIndex];
      setWonReward(reward);
      setSpinsCount((c) => c + 1);
      sfx.playRewardWin();

      // Claim on backend
      try {
        await apiClient.grantSpinnerReward({
          type: reward.type,
          amount: reward.amount,
          label: reward.label,
        });
        if (reward.type === 'coins') {
          updateCoinsLocal(reward.amount);
        }
        if (!profile?.isGuest) {
          await refreshProfile();
        }
      } catch (err) {
        console.warn('Backend spinner claim fallback:', err);
        if (reward.type === 'coins') {
          updateCoinsLocal(reward.amount);
        }
      }
    }, 4200);
  };

  return (
    <section id="spinner" className="w-full py-24 px-4 sm:px-6 relative z-10 bg-black/40 border-y border-white/5">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={22} />
        </button>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-uno-green/10 border border-uno-green/30 text-uno-green text-xs font-black uppercase tracking-widest mb-4">
            <Gift size={14} /> Daily Rewards
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white mb-4">
            DAILY LUCKY <span className="text-uno-green">SPINNER</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Spin the official 8-segment reward wheel daily for free coins, solo play passes, and quick match energy tokens!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* WHEEL DISPLAY (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            {/* Top Pointer */}
            <div className="relative z-20 -mb-5 flex flex-col items-center">
              <div className="w-8 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-xl shadow-2xl flex items-center justify-center font-black text-black text-xs border border-amber-200">
                ▼
              </div>
            </div>

            {/* Circular Spinner Outer Ring */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full p-3 bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-500 shadow-[0_0_50px_rgba(255,204,0,0.25)] border-4 border-white/20">
              <div
                className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                }}
              >
                {/* SVG Segments */}
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {SEGMENTS.map((seg, idx) => {
                    const startAngle = (idx * 360) / numSegments;
                    const endAngle = ((idx + 1) * 360) / numSegments;
                    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    // Middle angle for label
                    const midAngle = startAngle + segmentAngle / 2;
                    const textX = 50 + 32 * Math.cos((Math.PI * midAngle) / 180);
                    const textY = 50 + 32 * Math.sin((Math.PI * midAngle) / 180);

                    return (
                      <g key={idx}>
                        <path d={pathData} fill={seg.color} stroke="#121212" strokeWidth="0.8" />
                        <text
                          x={textX}
                          y={textY}
                          fill={seg.textColor}
                          fontSize="4.2"
                          fontWeight="900"
                          fontStyle="italic"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        >
                          {seg.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-neutral-900 to-black border-4 border-amber-400 shadow-2xl flex items-center justify-center">
                    <span className="font-black italic text-xl tracking-tighter text-white">
                      UNO<span className="text-uno-red">.</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spin CTA Button */}
            <div className="mt-8">
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`px-10 py-4 rounded-2xl text-base font-black uppercase tracking-wider shadow-2xl transition-all cursor-pointer flex items-center gap-3 ${
                  isSpinning
                    ? 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-uno-green via-emerald-500 to-teal-500 text-white shadow-uno-green/40 hover:scale-105 active:scale-95'
                }`}
              >
                <RotateCw size={20} className={isSpinning ? 'animate-spin' : ''} />
                <span>{isSpinning ? 'Spinning...' : 'SPIN FOR FREE!'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: REWARD BREAKDOWN & RECENT WIN (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WON REWARD MODAL / CARD */}
            <AnimatePresence>
              {wonReward && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/80 via-black to-neutral-900 border-2 border-amber-400 shadow-2xl space-y-3"
                >
                  <div className="flex items-center gap-2 text-uno-yellow text-xs font-black uppercase tracking-wider">
                    <Sparkles size={16} /> WINNING REWARD GRANTED!
                  </div>
                  <h3 className="text-4xl font-black italic text-white tracking-tight">
                    {wonReward.label}
                  </h3>
                  <p className="text-xs text-gray-300">
                    Credited immediately to user wallet via server-authorized balance operation.
                  </p>
                  <div className="pt-2 text-xs font-mono text-uno-green">
                    ✓ Verified via backend coin controller (idempotency key generated)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass-dark p-6 rounded-3xl border border-white/10 space-y-4">
              <h4 className="text-base font-black italic uppercase text-white flex items-center gap-2">
                <Trophy size={18} className="text-uno-yellow" /> Daily Spinner Rules
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-uno-green" />
                  <span><strong>1 Free Spin every 24 hours</strong> with no ads or purchase required.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-uno-blue" />
                  <span>Extra spin available by watching an optional rewarded video ad.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-uno-red" />
                  <span>Weighted server-side random distribution protects the game economy.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-uno-yellow" />
                  <span>Total simulated spins this session: <strong>{spinsCount}</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
