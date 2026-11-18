import React, { useState } from 'react';
import { Layers, Trophy, Coins } from 'lucide-react';
import { sfx } from '../services/soundEffects';

interface SeasonData {
  number: number;
  id: string;
  name: string;
  theme: string;
  gradient: string;
  accent: string;
  badge: string;
  highlightReward: string;
}

const SEASONS: SeasonData[] = [
  { number: 1, id: 'season_1_fire', name: 'Fire Edition', theme: 'Blazing Phoenix & Magma Deck', gradient: 'from-red-600 to-amber-600', accent: 'border-red-500', badge: 'Active Season', highlightReward: 'Phoenix Avatar & 3,000 Coins' },
  { number: 2, id: 'season_2_ocean', name: 'Ocean Depths', theme: 'Abyssal Bioluminescence & Kraken Crest', gradient: 'from-blue-600 to-cyan-500', accent: 'border-cyan-500', badge: 'Season 2', highlightReward: 'Abyssal Card Skin & Tidal Table' },
  { number: 3, id: 'season_3_cyber', name: 'Cyberpunk 2099', theme: 'Ultraviolet Wireframes & Laser Grid', gradient: 'from-purple-600 to-pink-500', accent: 'border-purple-500', badge: 'Season 3', highlightReward: 'Neon Cyber Deck & Laser FX' },
  { number: 4, id: 'season_4_gold', name: 'Golden Oasis', theme: '24K Electroplated Foil & Sphinx Crest', gradient: 'from-amber-500 to-yellow-600', accent: 'border-yellow-400', badge: 'Season 4', highlightReward: 'Gold Foil Skin & Sphinx Frame' },
  { number: 5, id: 'season_5_emerald', name: 'Emerald Forest', theme: 'Enchanted Flora & Mystic Runes', gradient: 'from-emerald-600 to-teal-500', accent: 'border-emerald-500', badge: 'Season 5', highlightReward: 'Emerald Felt & Rune Badge' },
  { number: 6, id: 'season_6_royal', name: 'Royal Amethyst', theme: 'Crown Jewels & Regal Velvet', gradient: 'from-violet-700 to-indigo-600', accent: 'border-violet-500', badge: 'Season 6', highlightReward: 'Champion Skin & Golden Laurel' },
  { number: 7, id: 'season_7_starlight', name: 'Starlight Galaxy', theme: 'Supernova Dust & Cosmic Constellations', gradient: 'from-indigo-600 to-blue-800', accent: 'border-blue-400', badge: 'Season 7', highlightReward: 'Cosmic Burst & Star Frame' },
];

export const UnoPassRoadmap: React.FC = () => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [selectedTier, setSelectedTier] = useState(15);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([1, 2, 3]);

  const activeSeason = SEASONS.find((s) => s.number === selectedSeasonNumber) || SEASONS[0];

  const handleClaimTier = (tier: number) => {
    sfx.playRewardWin();
    if (!claimedTiers.includes(tier)) {
      setClaimedTiers([...claimedTiers, tier]);
    }
  };

  return (
    <section id="pass" className="w-full py-24 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-uno-red/10 border border-uno-red/30 text-uno-red text-xs font-black uppercase tracking-widest mb-4">
            <Layers size={14} /> Seasonal Progression
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white mb-4">
            UNO PASS & <span className="text-uno-red">REWARD TRACKS</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium">
            30 tiers of exclusive card cosmetics, coin bags, streak shields, and animated frames. Featuring permanent VIP pass retention and dynamic continuous seasons.
          </p>
        </div>

        {/* PERMANENT ACCESS HIGHLIGHT BANNER */}
        <div className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-black border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
              👑
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Permanent VIP Pass Ownership</h3>
              <p className="text-xs sm:text-sm text-gray-300">
                Unlock the UNO Pass once, and your premium access stays active across Season 1, 2, 3 and all future dynamic seasons!
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-black uppercase px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ✓ Lifetime Multi-Season
          </span>
        </div>

        {/* SEASON SELECTION TIMELINE */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">Select Season Schedule:</span>
            <span className="text-xs text-uno-yellow font-bold">Dynamic Auto-Rotation Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {SEASONS.map((s) => (
              <button
                key={s.number}
                onClick={() => {
                  sfx.playCardClick();
                  setSelectedSeasonNumber(s.number);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedSeasonNumber === s.number
                    ? `bg-gradient-to-br ${s.gradient} text-white shadow-xl scale-[1.03] border-white/40`
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-gray-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block mb-1">
                    Season {s.number}
                  </span>
                  <h4 className="font-black text-white text-sm sm:text-base leading-tight">{s.name}</h4>
                </div>
                <span className="mt-3 text-[10px] font-bold block opacity-90 truncate">
                  {s.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE SEASON DETAILS & TIER ROADMAP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: SEASON HERO CARD (4 COLS) */}
          <div className={`lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${activeSeason.gradient} border ${activeSeason.accent} text-white shadow-2xl relative overflow-hidden`}>
            <div className="relative z-10 space-y-4">
              <span className="inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                Season {activeSeason.number} Theme
              </span>
              <h3 className="text-3xl font-black italic tracking-tight">{activeSeason.name}</h3>
              <p className="text-sm text-white/90 font-medium leading-relaxed">{activeSeason.theme}</p>

              <div className="pt-4 border-t border-white/20 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-white/70">Top Milestone Reward:</span>
                <div className="text-base font-black text-amber-200 flex items-center gap-2">
                  <Trophy size={18} /> {activeSeason.highlightReward}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE 30-TIER SLIDER & REWARDS (8 COLS) */}
          <div className="lg:col-span-8 glass-dark p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-xl font-black italic uppercase text-white">Interactive Reward Track</h4>
                <p className="text-xs text-gray-400">Scrub slider to preview Free vs Premium Pass tier contents</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 uppercase font-bold">Selected Level:</span>
                <div className="text-2xl font-black text-uno-yellow">Tier {selectedTier} of 30</div>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="30"
                value={selectedTier}
                onChange={(e) => {
                  sfx.playCardClick();
                  setSelectedTier(Number(e.target.value));
                }}
                className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-uno-red"
              />
              <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <span>Tier 1 (Starter)</span>
                <span>Tier 15 (Midway)</span>
                <span>Tier 30 (Master)</span>
              </div>
            </div>

            {/* Free vs Premium Reward Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Track */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">Free Track:</span>
                  <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">All Players</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-uno-blue/10 border border-uno-blue/20 flex items-center justify-center text-uno-blue">
                    <Coins size={22} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">+{selectedTier * 20} Coins</h5>
                    <p className="text-xs text-gray-400">In-game wallet currency</p>
                  </div>
                </div>
              </div>

              {/* Premium Track */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-black border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">VIP Track:</span>
                  <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">VIP Pass</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl">
                    {selectedTier % 5 === 0 ? '✨' : selectedTier % 2 === 0 ? '🛡️' : '💎'}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      {selectedTier % 5 === 0
                        ? `Exclusive ${activeSeason.name} Skin`
                        : selectedTier % 2 === 0
                        ? 'Streak Shield & +150 Coins'
                        : 'Double XP Boost (60 Min)'}
                    </h5>
                    <p className="text-xs text-gray-400">Permanent collectible reward</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Claim Simulation Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400">
                {claimedTiers.includes(selectedTier) ? '✓ Tier already claimed in simulation' : 'Tap to test reward grant sound & animation'}
              </span>
              <button
                onClick={() => handleClaimTier(selectedTier)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  claimedTiers.includes(selectedTier)
                    ? 'bg-uno-green/20 text-uno-green border border-uno-green/40'
                    : 'bg-uno-red text-white shadow-lg shadow-uno-red/30 hover:scale-105 active:scale-95'
                }`}
              >
                {claimedTiers.includes(selectedTier) ? 'Claimed ✓' : `Claim Tier ${selectedTier}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
