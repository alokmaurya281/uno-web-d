import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { sfx } from '../services/soundEffects';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-16 border-t border-white/10 z-10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* BRAND */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-uno-red flex items-center justify-center font-black italic text-white text-base">
                U
              </div>
              <h4 className="text-white font-black italic text-xl tracking-tighter">
                UNO<span className="text-uno-red">.</span>MOBILE
              </h4>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Real-time competitive multiplayer UNO card game for Android. Custom house rules, 7-0 swaps, stacking chains, and permanent pass rewards.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-uno-green">
              <span className="w-2 h-2 rounded-full bg-uno-green animate-pulse" />
              <span>Multiplayer Engine v2.4 Active</span>
            </div>
          </div>

          {/* GAME FEATURES */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-white mb-3">Game Features</h5>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><a href="#customizations" onClick={() => sfx.playCardClick()} className="hover:text-white transition-colors">Customization Studio</a></li>
              <li><a href="#modes" onClick={() => sfx.playCardClick()} className="hover:text-white transition-colors">7-0 & House Rules</a></li>
              <li><a href="#pass" onClick={() => sfx.playCardClick()} className="hover:text-white transition-colors">UNO Pass Seasons</a></li>
              <li><a href="#spinner" onClick={() => sfx.playCardClick()} className="hover:text-white transition-colors">Daily Lucky Spinner</a></li>
              <li><a href="#leaderboard" onClick={() => sfx.playCardClick()} className="hover:text-white transition-colors">Global Leaderboard</a></li>
            </ul>
          </div>

          {/* LEGAL & SAFETY */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-white mb-3">Legal & Safety</h5>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/uno-delete" className="hover:text-uno-red transition-colors">Account Deletion Request</Link></li>
              <li><a href="mailto:support@unogame.com" className="hover:text-white transition-colors">Player Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} UNO Mobile Platform. Developed by Alok Maurya. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-400">
              Made with <Heart size={14} className="text-uno-red fill-uno-red" /> for card lovers worldwide
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
