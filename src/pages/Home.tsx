import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Gamepad2, ArrowRight, Play, Layers, Gift } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { InteractiveCard3D, type CardColor, type CardValue } from '../components/InteractiveCard3D';
import { CustomizationStudio } from '../components/CustomizationStudio';
import { GameRulesSimulator } from '../components/GameRulesSimulator';
import { UnoPassRoadmap } from '../components/UnoPassRoadmap';
import { DailyLuckySpinner } from '../components/DailyLuckySpinner';
import { LiveLeaderboardPodium } from '../components/LiveLeaderboardPodium';
import { DownloadSection } from '../components/DownloadSection';
import { Footer } from '../components/Footer';
import { StoreModal } from '../components/StoreModal';
import { UnoPassModal } from '../components/UnoPassModal';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { GameModeModal } from '../components/Lobby/GameModeModal';
import { WaitingRoomModal } from '../components/Lobby/WaitingRoomModal';
import { type PublicRoom } from '../services/socketService';
import { sfx } from '../services/soundEffects';

interface HeroCardItem {
  id: number;
  color: CardColor;
  value: CardValue;
  skin: 'classic' | 'gold-foil' | 'dark-obsidian' | 'aurora' | 'champion';
  rotation: number;
  offsetY: number;
}

const INITIAL_HERO_HAND: HeroCardItem[] = [
  { id: 1, color: 'red', value: '7', skin: 'classic', rotation: -16, offsetY: 12 },
  { id: 2, color: 'yellow', value: 'draw2', skin: 'gold-foil', rotation: -8, offsetY: 4 },
  { id: 3, color: 'black', value: 'wild', skin: 'dark-obsidian', rotation: 0, offsetY: 0 },
  { id: 4, color: 'blue', value: 'skip', skin: 'aurora', rotation: 8, offsetY: 4 },
  { id: 5, color: 'green', value: 'reverse', skin: 'champion', rotation: 16, offsetY: 12 },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [heroHand, setHeroHand] = useState<HeroCardItem[]>(INITIAL_HERO_HAND);
  const [playedCard, setPlayedCard] = useState<HeroCardItem | null>(null);

  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSpinnerModalOpen, setIsSpinnerModalOpen] = useState(false);
  const [isGameModeOpen, setIsGameModeOpen] = useState(false);
  const [isWaitingRoomOpen, setIsWaitingRoomOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<PublicRoom | null>(null);

  const handlePlayHeroCard = (card: HeroCardItem) => {
    sfx.playCardPlay();
    setPlayedCard(card);
    setHeroHand((prev) => prev.filter((c) => c.id !== card.id));
    setTimeout(() => {
      // Return card back to hand after animation
      setHeroHand((prev) => [...prev, card].sort((a, b) => a.id - b.id));
    }, 2800);
  };

  const scrollToSection = (id: string) => {
    sfx.playCardClick();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0d0e12] text-white font-['Outfit'] overflow-x-hidden selection:bg-uno-red selection:text-white">
      {/* BACKGROUND ATMOSPHERIC GLOW BLOBS */}
      <div className="fixed top-0 -left-20 w-[500px] h-[500px] bg-uno-red rounded-full filter blur-[160px] opacity-15 pointer-events-none animate-pulse" />
      <div className="fixed top-1/3 -right-20 w-[500px] h-[500px] bg-uno-blue rounded-full filter blur-[160px] opacity-15 pointer-events-none animate-pulse delay-700" />
      <div className="fixed bottom-0 left-1/3 w-[600px] h-[600px] bg-uno-green rounded-full filter blur-[180px] opacity-10 pointer-events-none" />

      {/* STICKY GLASS NAVBAR */}
      <Navbar
        onNavigateSection={scrollToSection}
        onOpenStore={() => setIsStoreOpen(true)}
        onOpenPass={() => setIsPassOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenSpinner={() => setIsSpinnerModalOpen(true)}
      />

      {/* HERO SECTION */}
      <header className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 z-10 flex flex-col items-center">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/15 shadow-xl"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-uno-green animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-200">
              Multiplayer Edition • Dynamic Seasons Active
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none"
          >
            THE ULTIMATE <br />
            <span className="bg-gradient-to-r from-uno-red via-uno-yellow to-uno-blue bg-clip-text text-transparent italic drop-shadow-[0_10px_30px_rgba(255,59,59,0.3)]">
              UNO MULTIPLAYER
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 text-lg sm:text-2xl max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Compete with players worldwide with real-time 3D card physics, custom 7-0 swaps, stacking penalties, and lifetime pass rewards.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <button
              onClick={() => {
                sfx.playCardPlay();
                setIsGameModeOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-uno-red via-red-600 to-amber-500 font-black text-white text-base uppercase tracking-wider shadow-2xl shadow-uno-red/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play size={20} className="fill-white" />
              <span>Play Game Now</span>
            </button>

            <button
              onClick={() => scrollToSection('customizations')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 font-bold text-white text-base uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={18} className="text-uno-yellow" />
              <span>Customizations</span>
            </button>

            <button
              onClick={() => scrollToSection('modes')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-dark border border-white/20 font-bold text-white text-base uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gamepad2 size={18} className="text-uno-blue" />
              <span>Simulate Rules</span>
            </button>
          </motion.div>

          {/* INTERACTIVE HERO CARD FAN STAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-12 pb-6 w-full flex flex-col items-center justify-center"
          >
            <div className="relative h-64 sm:h-72 w-full max-w-2xl flex items-center justify-center">
              {/* Discard Pile in Center */}
              {playedCard && (
                <div className="absolute z-30 transition-all duration-300 -translate-y-8 animate-bounce">
                  <div className="text-[10px] font-black uppercase tracking-widest text-uno-yellow mb-1 text-center bg-black/60 px-2 py-0.5 rounded-full">
                    Played Card!
                  </div>
                  <InteractiveCard3D
                    color={playedCard.color}
                    value={playedCard.value}
                    skin={playedCard.skin}
                    size="md"
                    interactive={false}
                  />
                </div>
              )}

              {/* Fanned Hand of Cards */}
              <div className="flex items-center justify-center -space-x-12 sm:-space-x-16 pt-10">
                {heroHand.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handlePlayHeroCard(card)}
                    style={{
                      transform: `rotate(${card.rotation}deg) translateY(${card.offsetY}px)`,
                    }}
                    className="transition-all duration-300 hover:!-translate-y-12 hover:!scale-110 hover:z-40 cursor-pointer drop-shadow-2xl"
                    title="Click to play card!"
                  >
                    <InteractiveCard3D
                      color={card.color}
                      value={card.value}
                      skin={card.skin}
                      size="sm"
                      interactive={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mt-2 flex items-center gap-2">
              <Play size={12} className="text-uno-red fill-uno-red" />
              Tap any card in hand to play it into the center discard pile!
            </p>
          </motion.div>
        </div>
      </header>

      {/* MAIN FEATURE HIGHLIGHTS GRID */}
      <section className="w-full py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Sparkles size={24} className="text-uno-yellow" />,
              title: '3D Card Customizations',
              desc: 'Choose from Gold Foil, Dark Obsidian, Aurora, Neon Cyber, and Champion decks with real specular glare.',
              action: () => scrollToSection('customizations'),
            },
            {
              icon: <ArrowRight size={24} className="text-uno-blue" />,
              title: '5 Official House Rules',
              desc: 'Play with 7-0 hand swapping, stacking penalties (+2 on +2), Jump-In reflex mode, and Draw-to-Match.',
              action: () => scrollToSection('modes'),
            },
            {
              icon: <Layers size={24} className="text-uno-red" />,
              title: 'Continuous Seasons',
              desc: 'Season 1 to 7 plus automatic continuous dynamic seasons with lifetime permanent VIP pass retention.',
              action: () => scrollToSection('pass'),
            },
            {
              icon: <Gift size={24} className="text-uno-green" />,
              title: 'Daily Lucky Spinner',
              desc: 'Free daily spin wheel granting coins, solo passes, and quick match energy tokens every 24 hours.',
              action: () => scrollToSection('spinner'),
            },
          ].map((feat, i) => (
            <div
              key={i}
              onClick={feat.action}
              className="glass-dark p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all hover:scale-105 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-black italic text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
              <span className="text-xs font-black uppercase text-uno-yellow flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
                Explore Feature →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* COMPONENT 1: LIVE CUSTOMIZATION STUDIO */}
      <CustomizationStudio />

      {/* COMPONENT 2: INTERACTIVE GAME RULES SIMULATOR */}
      <GameRulesSimulator />

      {/* COMPONENT 3: UNO PASS REWARD ROADMAP */}
      <UnoPassRoadmap />

      {/* COMPONENT 4: DAILY LUCKY SPINNER */}
      <DailyLuckySpinner />

      {/* COMPONENT 5: LIVE LEADERBOARD PODIUM */}
      <LiveLeaderboardPodium />

      {/* COMPONENT 6: DOWNLOAD SECTION WITH REAL DEVICE QR CODE */}
      <DownloadSection />

      {/* FOOTER */}
      <Footer />

      {/* INTERACTIVE FEATURE MODALS */}
      <StoreModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} />
      <UnoPassModal isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />

      {isSpinnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <DailyLuckySpinner onClose={() => setIsSpinnerModalOpen(false)} />
          </div>
        </div>
      )}

      <GameModeModal
        isOpen={isGameModeOpen}
        onClose={() => setIsGameModeOpen(false)}
        onStartBotGame={() => navigate('/play')}
        onRoomJoined={(room) => {
          setIsGameModeOpen(false);
          setActiveRoom(room);
          setIsWaitingRoomOpen(true);
        }}
      />

      <WaitingRoomModal
        isOpen={isWaitingRoomOpen}
        room={activeRoom}
        onClose={() => setIsWaitingRoomOpen(false)}
        onGameStart={() => {
          setIsWaitingRoomOpen(false);
          navigate('/play');
        }}
      />
    </div>
  );
};

export default Home;
