import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Volume2, VolumeX, Sparkles, Trophy, Gamepad2, Layers, Gift, Coins, User, LogOut, ShoppingBag } from 'lucide-react';
import { sfx } from '../services/soundEffects';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigateSection?: (sectionId: string) => void;
  onOpenStore?: () => void;
  onOpenPass?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenSpinner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateSection,
  onOpenStore,
  onOpenPass,
  onOpenLeaderboard,
  onOpenSpinner,
}) => {
  const { profile, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    sfx.enabled = next;
    setSoundEnabled(next);
    if (next) sfx.playCardClick();
  };

  const navItems = [
    { label: 'Store', icon: <ShoppingBag size={15} className="text-uno-yellow" />, action: onOpenStore },
    { label: 'Tanox Pass', icon: <Layers size={15} className="text-uno-red" />, action: onOpenPass },
    { label: 'Spinner', icon: <Gift size={15} className="text-uno-green" />, action: onOpenSpinner },
    { label: 'Rankings', icon: <Trophy size={15} className="text-amber-400" />, action: onOpenLeaderboard },
  ];

  const handleNavClick = (action?: () => void, sectionId?: string) => {
    sfx.playCardClick();
    setMobileMenuOpen(false);
    if (action) {
      action();
    } else if (sectionId) {
      if (onNavigateSection) {
        onNavigateSection(sectionId);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const coins = profile?.coins ?? 500;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 font-['Outfit']">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-2xl glass-dark border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* LOGO */}
        <Link
          to="/"
          onClick={() => sfx.playCardClick()}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-uno-red via-uno-yellow to-uno-blue p-0.5 group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(255,59,59,0.5)]">
            <div className="w-full h-full bg-uno-dark rounded-[10px] flex items-center justify-center font-black italic text-xs sm:text-sm tracking-tighter text-white">
              TANOX
            </div>
          </div>
          <span className="font-black italic text-lg sm:text-xl tracking-tight text-white hidden xs:inline">
            TANOX<span className="text-uno-red">.</span>CARDS
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.action)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* RIGHT ACTIONS: COINS, USER, SOUND, PLAY */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Coins Pill */}
          <div
            onClick={onOpenStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-uno-yellow/40 text-uno-yellow font-black text-xs cursor-pointer hover:border-uno-yellow hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_rgba(255,204,0,0.15)]"
            title="Your coin balance (click to visit store)"
          >
            <Coins size={14} className="text-amber-400" />
            <span>{coins.toLocaleString()}</span>
          </div>

          {/* User Profile Pill / Login Button */}
          {profile ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 sm:pr-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-7 h-7 rounded-lg border border-uno-yellow/40 bg-black/50 p-0.5"
                />
                <span className="hidden sm:inline max-w-[100px] truncate text-left">
                  {profile.displayName}
                </span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-[#11141c] border border-white/15 rounded-2xl p-4 shadow-2xl z-50 text-white"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-11 h-11 rounded-xl border-2 border-uno-yellow/50 bg-black/50 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{profile.displayName}</div>
                        <div className="text-[11px] text-gray-400">
                          {profile.isGuest ? 'Guest Player' : profile.email || 'Registered Player'}
                        </div>
                      </div>
                    </div>

                    <div className="py-2.5 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-gray-400 uppercase">Level</div>
                        <div className="font-black text-uno-yellow mt-0.5">{profile.level}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-gray-400 uppercase">Pass Tier</div>
                        <div className="font-black text-uno-blue mt-0.5">Tier {profile.passLevel}</div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-white/10 text-xs">
                      {profile.isGuest && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            openAuthModal();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-uno-yellow/15 hover:bg-uno-yellow/25 text-uno-yellow font-bold text-left flex items-center gap-2 transition-colors"
                        >
                          <Sparkles size={14} /> Link Account / Sign Up
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 rounded-xl hover:bg-red-500/15 text-red-400 font-bold text-left flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={14} /> {profile.isGuest ? 'Reset Guest' : 'Sign Out'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <User size={14} /> Sign In
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-90"
            title={soundEnabled ? 'Sound is ON' : 'Sound is OFF'}
          >
            {soundEnabled ? <Volume2 size={16} className="text-uno-green" /> : <VolumeX size={16} className="text-gray-500" />}
          </button>

          {/* Play CTA */}
          <Link
            to="/play"
            onClick={() => sfx.playCardPlay()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-uno-red via-red-600 to-amber-500 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-uno-red/30 hover:shadow-uno-red/50 hover:scale-105 active:scale-95 transition-all"
          >
            <Gamepad2 size={15} />
            <span>Play</span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => {
              sfx.playCardClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle menu"
            className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mt-2 p-4 rounded-2xl glass-dark border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col gap-2"
          >
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.action)}
                className="w-full px-4 py-3 rounded-xl text-left font-bold text-xs uppercase tracking-wider text-gray-200 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
