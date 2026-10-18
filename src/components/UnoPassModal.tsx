import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, CheckCircle2, Lock, Sparkles, Coins, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sfx } from '../services/soundEffects';

import { apiClient } from '../services/apiClient';

interface Mission {
  id: string;
  title: string;
  progress: number;
  target: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Play 3 online matches', progress: 2, target: 3, rewardCoins: 50, completed: false, claimed: false },
  { id: 'm2', title: 'Play a Wild Draw 4 (+4)', progress: 1, target: 1, rewardCoins: 40, completed: true, claimed: false },
  { id: 'm3', title: 'Successfully call UNO', progress: 1, target: 2, rewardCoins: 30, completed: false, claimed: false },
  { id: 'm4', title: 'Execute a 7-0 Hand Swap', progress: 1, target: 1, rewardCoins: 45, completed: true, claimed: false },
  { id: 'm5', title: 'Win 2 consecutive games', progress: 1, target: 2, rewardCoins: 80, completed: false, claimed: false },
];

export const UnoPassModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { profile, updateCoinsLocal, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'pass' | 'missions'>('pass');
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [claimedTiers, setClaimedTiers] = useState<Set<number>>(new Set([1]));

  if (!isOpen) return null;

  const currentLevel = profile?.passLevel || 2;
  const currentCoins = profile?.coins || 500;

  const handleClaimMission = async (missionId: string) => {
    const target = missions.find((m) => m.id === missionId);
    if (!target || !target.completed || target.claimed) return;

    sfx.playRewardWin();
    updateCoinsLocal(target.rewardCoins);
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
    );
    if (!profile?.isGuest) {
      try {
        await apiClient.changeCoins(target.rewardCoins, 'daily_mission_reward');
        await refreshProfile();
      } catch {
        // Fallback
      }
    }
  };

  const handleClaimTier = async (tier: number, rewardAmount: number) => {
    if (tier > currentLevel || claimedTiers.has(tier)) return;
    sfx.playRewardWin();
    updateCoinsLocal(rewardAmount);
    setClaimedTiers((prev) => new Set([...prev, tier]));
    if (!profile?.isGuest) {
      try {
        await apiClient.changeCoins(rewardAmount, 'pass_tier_reward');
        await refreshProfile();
      } catch {
        // Fallback
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-['Outfit']">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d1017] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black shadow-lg">
                <Award size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  UNO Season Pass <Sparkles size={18} className="text-uno-yellow" />
                </h2>
                <p className="text-xs text-gray-400">Complete missions, unlock 20 tiers, and claim exclusive card skins!</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-uno-yellow/40 text-uno-yellow font-black text-sm">
                <Coins size={18} className="text-amber-400" />
                <span>{currentCoins.toLocaleString()}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex gap-2 my-5">
            <button
              onClick={() => setActiveTab('pass')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'pass'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Award size={16} /> Season Roadmap (Tier {currentLevel}/20)
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'missions'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Zap size={16} /> Daily & Weekly Missions
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto pr-2">
            {activeTab === 'pass' ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tier) => {
                  const unlocked = tier <= currentLevel;
                  const claimed = claimedTiers.has(tier);
                  const rewardCoins = tier * 30 + 50;

                  return (
                    <div
                      key={tier}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        unlocked
                          ? 'bg-white/5 border-uno-yellow/30'
                          : 'bg-black/40 border-white/5 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base ${
                            unlocked
                              ? 'bg-gradient-to-br from-uno-yellow to-amber-500 text-black shadow-md'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}
                        >
                          {unlocked ? tier : <Lock size={18} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">Tier {tier} Milestone</h4>
                          <span className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                            <Coins size={12} /> +{rewardCoins} Coins {tier % 5 === 0 && '• + Cyberpunk Skin Voucher'}
                          </span>
                        </div>
                      </div>

                      <div>
                        {claimed ? (
                          <span className="flex items-center gap-1 text-xs font-black text-uno-green bg-uno-green/10 border border-uno-green/30 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 size={14} /> Claimed
                          </span>
                        ) : unlocked ? (
                          <button
                            onClick={() => handleClaimTier(tier, rewardCoins)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-uno-yellow to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                          >
                            Claim Reward
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="w-32 h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-uno-yellow transition-all"
                            style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 font-bold">
                          {m.progress}/{m.target}
                        </span>
                        <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                          <Coins size={12} /> +{m.rewardCoins}
                        </span>
                      </div>
                    </div>

                    <div>
                      {m.claimed ? (
                        <span className="flex items-center gap-1 text-xs font-black text-uno-green bg-uno-green/10 border border-uno-green/30 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 size={14} /> Claimed
                        </span>
                      ) : m.completed ? (
                        <button
                          onClick={() => handleClaimMission(m.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-uno-green to-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5"
                        >
                          <Coins size={14} /> Claim
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnoPassModal;
