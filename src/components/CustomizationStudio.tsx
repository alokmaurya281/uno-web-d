import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Palette, User, Shield, Trophy, Zap, RotateCw, Check, Flame } from 'lucide-react';
import { InteractiveCard3D, type CardColor, type CardValue, type SkinId } from './InteractiveCard3D';
import { sfx } from '../services/soundEffects';

interface SkinMetadata {
  id: SkinId;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  unlockRequirement: string;
  price: string;
  badgeTone: string;
}

const SKINS: SkinMetadata[] = [
  {
    id: 'classic',
    name: 'Classic Official',
    rarity: 'common',
    description: 'The iconic international UNO deck design with vibrant colors and bold drop-shadows.',
    unlockRequirement: 'Default starter deck',
    price: 'Free',
    badgeTone: 'bg-gray-700 text-gray-200',
  },
  {
    id: 'dark-obsidian',
    name: 'Dark Obsidian',
    rarity: 'epic',
    description: 'Polished carbon-black cards with glowing border illumination and dark glass oval center.',
    unlockRequirement: 'Store Tier 2 or 2,000 Coins',
    price: '2,000 Coins',
    badgeTone: 'bg-purple-900/70 border border-purple-500/50 text-purple-200',
  },
  {
    id: 'gold-foil',
    name: 'Gold Foil',
    rarity: 'legendary',
    description: '24-Karat electroplated golden foil with embossed insignia and high-specular reflective glare.',
    unlockRequirement: 'Win 50 Ranked Multiplayer Matches',
    price: '400 Coins / IAP',
    badgeTone: 'bg-amber-900/70 border border-amber-500/50 text-amber-200',
  },
  {
    id: 'aurora',
    name: 'Northern Aurora',
    rarity: 'epic',
    description: 'Holographic shifting aurora borealis gradient that shimmers under dynamic lighting.',
    unlockRequirement: 'Collect 5 Aurora Fragments from UNO Pass',
    price: '5 Fragments',
    badgeTone: 'bg-cyan-900/70 border border-cyan-500/50 text-cyan-200',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyberpunk',
    rarity: 'rare',
    description: 'Futuristic ultraviolet neon wireframes, geometric circuit traces, and high-contrast glow.',
    unlockRequirement: 'Reach UNO Pass Level 15',
    price: 'Pass Tier 15',
    badgeTone: 'bg-blue-900/70 border border-blue-500/50 text-blue-200',
  },
  {
    id: 'retro-pixel',
    name: '8-Bit Arcade',
    rarity: 'rare',
    description: 'Nostalgic retro pixel-art aesthetic with chunky borders and arcade font styling.',
    unlockRequirement: 'Complete 25 Daily Missions',
    price: 'Mission Reward',
    badgeTone: 'bg-emerald-900/70 border border-emerald-500/50 text-emerald-200',
  },
  {
    id: 'champion',
    name: 'Royal Champion',
    rarity: 'legendary',
    description: 'Deep royal crimson velvet with golden laurel wreath trims reserved for top leaderboard victors.',
    unlockRequirement: 'Reach #1 on Global Leaderboard',
    price: 'Rank Reward',
    badgeTone: 'bg-rose-900/70 border border-rose-500/50 text-rose-200',
  },
];

interface TableTheme {
  id: string;
  name: string;
  feltColor: string;
  surfaceClass: string;
  accent: string;
  preview: string;
}

const TABLE_THEMES: TableTheme[] = [
  {
    id: 'casino_green',
    name: 'Casino Royale Felt',
    feltColor: '#0a4223',
    surfaceClass: 'bg-gradient-to-b from-[#0e5c31] via-[#094022] to-[#052814] border-[#1b7a44]',
    accent: 'border-emerald-500',
    preview: 'bg-emerald-800',
  },
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Grid',
    feltColor: '#0a0d1f',
    surfaceClass: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#181938] via-[#090b17] to-[#04050a] border-cyan-500/50',
    accent: 'border-cyan-400',
    preview: 'bg-cyan-950',
  },
  {
    id: 'wood_classic',
    name: 'Mahogany Lounge',
    feltColor: '#2b1408',
    surfaceClass: 'bg-gradient-to-br from-[#3d1e0d] via-[#241005] to-[#120702] border-amber-800/60',
    accent: 'border-amber-700',
    preview: 'bg-amber-950',
  },
  {
    id: 'midnight_purple',
    name: 'Midnight Amethyst',
    feltColor: '#1c0e33',
    surfaceClass: 'bg-gradient-to-b from-[#2d1554] via-[#160a2b] to-[#090312] border-purple-500/40',
    accent: 'border-purple-500',
    preview: 'bg-purple-950',
  },
  {
    id: 'space_nebula',
    name: 'Deep Cosmos Nebula',
    feltColor: '#09081a',
    surfaceClass: 'bg-gradient-to-tr from-[#130924] via-[#0c142c] to-[#050611] border-blue-400/40',
    accent: 'border-indigo-400',
    preview: 'bg-blue-950',
  },
];

interface AvatarFrame {
  id: string;
  name: string;
  borderClass: string;
  glowClass: string;
  badge: string;
}

const AVATAR_FRAMES: AvatarFrame[] = [
  { id: 'golden_flame', name: 'Golden Flame', borderClass: 'border-amber-400', glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse', badge: '🔥 VIP' },
  { id: 'diamond_sparkle', name: 'Diamond Prism', borderClass: 'border-cyan-300', glowClass: 'shadow-[0_0_20px_rgba(103,232,249,0.7)]', badge: '💎 Master' },
  { id: 'neon_pulse', name: 'Ultraviolet Pulse', borderClass: 'border-purple-400', glowClass: 'shadow-[0_0_20px_rgba(192,132,252,0.6)]', badge: '⚡ Cyber' },
  { id: 'cosmic_vortex', name: 'Cosmic Nebula', borderClass: 'border-emerald-400', glowClass: 'shadow-[0_0_20px_rgba(52,211,153,0.6)]', badge: '🌌 Legend' },
];

export const CustomizationStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'skins' | 'tables' | 'avatars' | 'victory'>('skins');
  const [selectedSkin, setSelectedSkin] = useState<SkinId>('gold-foil');
  const [selectedColor, setSelectedColor] = useState<CardColor>('red');
  const [selectedValue, setSelectedValue] = useState<CardValue>('7');
  const [selectedTable, setSelectedTable] = useState<TableTheme>(TABLE_THEMES[0]);
  const [selectedFrame, setSelectedFrame] = useState<AvatarFrame>(AVATAR_FRAMES[0]);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const triggerVictoryDemo = () => {
    sfx.playRewardWin();
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  const currentSkinMeta = SKINS.find((s) => s.id === selectedSkin) || SKINS[0];

  return (
    <section id="customizations" className="w-full py-24 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-uno-red/10 border border-uno-red/30 text-uno-red text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Interactive Studio
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white mb-4">
            LIVE CUSTOMIZATION <span className="text-uno-yellow">STUDIO</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Test and customize card decks, table felts, and animated player frames in real-time with responsive 3D perspective physics.
          </p>
        </div>

        {/* STUDIO CATEGORY TABS */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {[
            { id: 'skins', label: 'Card Skins', icon: <Layers size={18} /> },
            { id: 'tables', label: 'Table Themes', icon: <Palette size={18} /> },
            { id: 'avatars', label: 'Player Badges & Frames', icon: <User size={18} /> },
            { id: 'victory', label: 'Victory FX & Power-Ups', icon: <Trophy size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sfx.playCardClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-uno-red to-orange-500 text-white shadow-xl shadow-uno-red/30 scale-105'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN STUDIO STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 3D PREVIEW STAGE (7 COLS) */}
          <div
            className={`lg:col-span-7 rounded-[2.5rem] p-6 sm:p-10 border-2 ${selectedTable.accent} ${selectedTable.surfaceClass} shadow-2xl relative overflow-hidden min-h-[520px] flex flex-col justify-between transition-colors duration-500`}
          >
            {/* Table Surface Pattern Overlay */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Stage Top Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-uno-green animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  3D Render: <span className="text-uno-yellow">{currentSkinMeta.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sfx.playCardFlip();
                    setCardFlipped(!cardFlipped);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <RotateCw size={14} className={cardFlipped ? 'rotate-180 transition-transform' : ''} />
                  Flip Card
                </button>
              </div>
            </div>

            {/* Stage Center Card Display */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center">
              <InteractiveCard3D
                color={selectedColor}
                value={selectedValue}
                skin={selectedSkin}
                size="lg"
                isFlipped={cardFlipped}
                interactive={true}
              />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                Move cursor or touch card to test 3D tilt & reflective sheen
              </p>
            </div>

            {/* Stage Bottom Card Face Controls */}
            <div className="relative z-10 bg-black/50 backdrop-blur-md p-4 rounded-3xl border border-white/10 space-y-3">
              {/* Color Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Color Variant:</span>
                <div className="flex items-center gap-2">
                  {(['red', 'yellow', 'green', 'blue', 'black'] as CardColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        sfx.playCardClick();
                        setSelectedColor(c);
                        if (c === 'black') setSelectedValue('wild');
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                      } ${
                        c === 'red'
                          ? 'bg-uno-red'
                          : c === 'yellow'
                          ? 'bg-uno-yellow'
                          : c === 'green'
                          ? 'bg-uno-green'
                          : c === 'blue'
                          ? 'bg-uno-blue'
                          : 'bg-gradient-to-tr from-uno-red via-uno-yellow to-uno-blue'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Value Selector */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400 shrink-0">Face Card:</span>
                <div className="flex items-center gap-1.5">
                  {(['0', '1', '2', '3', '7', 'skip', 'reverse', 'draw2', 'wild', 'draw4'] as CardValue[]).map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        sfx.playCardClick();
                        setSelectedValue(val);
                        if (val === 'wild' || val === 'draw4') setSelectedColor('black');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                        selectedValue === val ? 'bg-uno-red text-white scale-110 shadow' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {val === 'draw2' ? '+2' : val === 'draw4' ? '+4' : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Confetti Animation Effect */}
            <AnimatePresence>
              {confettiActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: [1, 1.4, 2], opacity: [1, 0.8, 0] }}
                    transition={{ duration: 1.5 }}
                    className="text-6xl font-black italic text-uno-yellow drop-shadow-[0_0_30px_rgba(255,204,0,0.8)]"
                  >
                    🎉 VICTORY! 🎉
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT CONFIGURATION & SELECTION DRAWER (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* TAB 1: CARD SKINS */}
            {activeTab === 'skins' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black italic text-white uppercase">Deck Styles ({SKINS.length})</h3>
                  <span className="text-xs font-bold text-gray-400">Click to preview</span>
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {SKINS.map((skin) => (
                    <div
                      key={skin.id}
                      onClick={() => {
                        sfx.playCardClick();
                        setSelectedSkin(skin.id);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedSkin === skin.id
                          ? 'glass-dark border-uno-red shadow-lg shadow-uno-red/20 scale-[1.02]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-16 rounded-xl border flex items-center justify-center font-black italic text-xs ${
                            skin.id === 'gold-foil'
                              ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-black border-amber-200'
                              : skin.id === 'dark-obsidian'
                              ? 'bg-neutral-900 text-purple-400 border-neutral-700'
                              : skin.id === 'aurora'
                              ? 'bg-gradient-to-br from-cyan-400 to-teal-600 text-white border-cyan-200'
                              : skin.id === 'neon-cyber'
                              ? 'bg-black text-cyan-400 border-cyan-500'
                              : skin.id === 'champion'
                              ? 'bg-rose-950 text-amber-300 border-amber-500'
                              : 'bg-uno-red text-white border-white/20'
                          }`}
                        >
                          UNO
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-white text-base">{skin.name}</h4>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${skin.badgeTone}`}>
                              {skin.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{skin.description}</p>
                          <span className="text-[11px] font-bold text-uno-yellow mt-1 block">
                            {skin.unlockRequirement}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {selectedSkin === skin.id ? (
                          <div className="w-8 h-8 rounded-full bg-uno-red text-white flex items-center justify-center">
                            <Check size={16} />
                          </div>
                        ) : (
                          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                            {skin.price}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TABLE THEMES */}
            {activeTab === 'tables' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black italic text-white uppercase">Table Felts ({TABLE_THEMES.length})</h3>
                  <span className="text-xs font-bold text-gray-400">Updates live background</span>
                </div>

                <div className="space-y-3">
                  {TABLE_THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => {
                        sfx.playCardClick();
                        setSelectedTable(theme);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedTable.id === theme.id
                          ? 'glass-dark border-uno-green shadow-lg shadow-uno-green/20 scale-[1.02]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl border-2 ${theme.accent} ${theme.preview} shadow-inner flex items-center justify-center`}>
                          <Palette size={20} className="text-white opacity-80" />
                        </div>
                        <div>
                          <h4 className="font-black text-white text-base">{theme.name}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Premium high-resolution felt texture</p>
                        </div>
                      </div>

                      {selectedTable.id === theme.id && (
                        <div className="w-8 h-8 rounded-full bg-uno-green text-white flex items-center justify-center">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: AVATAR FRAMES & BADGES */}
            {activeTab === 'avatars' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black italic text-white uppercase">Avatar Frames</h3>
                  <span className="text-xs font-bold text-gray-400">Profile showcase</span>
                </div>

                {/* Profile Banner Preview */}
                <div className="p-5 rounded-2xl glass-dark border border-white/15 flex items-center gap-4">
                  <div className={`relative w-16 h-16 rounded-full border-4 ${selectedFrame.borderClass} ${selectedFrame.glowClass} flex items-center justify-center bg-neutral-800 text-2xl`}>
                    👑
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-uno-red text-white uppercase">
                      Lvl 42
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-lg">Alok Master</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-uno-yellow/20 text-uno-yellow border border-uno-yellow/40">
                        {selectedFrame.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">UNO Legend • Win Streak: 12</p>
                    <p className="text-[11px] font-bold text-uno-green mt-1">Equipped Frame: {selectedFrame.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {AVATAR_FRAMES.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        sfx.playCardClick();
                        setSelectedFrame(frame);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedFrame.id === frame.id
                          ? 'glass-dark border-uno-yellow scale-[1.03]'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 ${frame.borderClass} mb-2 flex items-center justify-center text-xs font-bold`}>
                        ✨
                      </div>
                      <h5 className="font-black text-white text-sm">{frame.name}</h5>
                      <span className="text-[10px] text-gray-400">{frame.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: VICTORY FX & POWER-UPS */}
            {activeTab === 'victory' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black italic text-white uppercase">Victory FX & Power-Ups</h3>
                  <span className="text-xs font-bold text-gray-400">Interactive simulation</span>
                </div>

                <div className="p-5 rounded-2xl glass-dark border border-white/15 space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">Victory Celebration:</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={triggerVictoryDemo}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-uno-yellow to-amber-600 text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Trophy size={16} /> Trigger Win Chime & FX
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">In-Game Consumable Power-Ups:</h4>
                  {[
                    { name: 'Streak Shield', desc: 'Preserves your winning streak after one loss.', icon: <Shield size={16} className="text-uno-blue" />, count: '3 in bag' },
                    { name: 'Double XP Boost', desc: 'Doubles all UNO Pass progression XP for 60 minutes.', icon: <Zap size={16} className="text-uno-yellow" />, count: '2 active' },
                    { name: 'Time Freeze', desc: 'Adds +15 seconds to your turn timer during crucial plays.', icon: <Flame size={16} className="text-uno-red" />, count: '5 in bag' },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          {p.icon}
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-sm">{p.name}</h5>
                          <p className="text-xs text-gray-400">{p.desc}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-uno-green bg-uno-green/10 px-2 py-0.5 rounded-full border border-uno-green/20">
                        {p.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
