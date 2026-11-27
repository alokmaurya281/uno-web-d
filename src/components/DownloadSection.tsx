import React from 'react';
import { Download, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { sfx } from '../services/soundEffects';

export const DownloadSection: React.FC = () => {
  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tanoxcards.game';
  const EDITION_LINKS = [
    {
      label: 'Tanox Offline',
      url: 'https://play.google.com/store/apps/details?id=com.tanoxcards.offline',
    },
    {
      label: 'Tanox 7-0 Cards',
      url: 'https://play.google.com/store/apps/details?id=com.tanoxcards.sevenzero',
    },
    {
      label: 'Tanox Stacking',
      url: 'https://play.google.com/store/apps/details?id=com.tanoxcards.stacking',
    },
  ];

  return (
    <section id="download" className="w-full py-24 px-4 sm:px-6 relative z-10">
      <div className="max-w-6xl mx-auto rounded-[3rem] p-8 sm:p-14 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border-2 border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-uno-red rounded-full filter blur-[140px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-uno-blue rounded-full filter blur-[140px] opacity-20 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* TEXT & CTA (7 COLS) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-uno-red/10 border border-uno-red/30 text-uno-red text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} /> Android Production Release
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white leading-tight">
              READY TO PLAY? <br />
              <span className="text-uno-yellow uppercase">GET TANOX CARDS NOW</span>
            </h2>

            <p className="text-gray-300 text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Download the official release on your phone or tablet. Experience instant matchmaking, custom 7-0 rules, stacking penalties, and lifetime Tanox Pass rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playCardPlay()}
                className="px-8 py-5 rounded-2xl bg-gradient-to-r from-uno-red via-orange-500 to-amber-500 text-white font-black text-base uppercase tracking-wider shadow-2xl shadow-uno-red/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
              >
                <Download size={22} />
                <span>GET IT ON GOOGLE PLAY</span>
              </a>

              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={20} className="text-uno-green" />
                <span>Verified Clean & Secure</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
              {EDITION_LINKS.map((edition) => (
                <a
                  key={edition.label}
                  href={edition.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sfx.playCardClick()}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all"
                >
                  {edition.label} →
                </a>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="text-2xl font-black text-white">4.8 ★</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">App Rating</span>
              </div>
              <div>
                <span className="text-2xl font-black text-white">100K+</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Downloads</span>
              </div>
              <div>
                <span className="text-2xl font-black text-white">&lt; 35MB</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Fast Install</span>
              </div>
            </div>
          </div>

          {/* QR CODE & REAL DEVICE SCANNER (5 COLS) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="glass-dark p-7 rounded-3xl border border-white/15 text-center space-y-4 max-w-xs shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-gray-300">
                <QrCode size={16} className="text-uno-yellow" />
                <span>Scan with Real Device</span>
              </div>

              {/* High Contrast Stylized SVG QR Code */}
              <div className="bg-white p-4 rounded-2xl shadow-inner flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-44 h-44">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="#121212" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="#ff3b3b" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="#121212" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="#008cff" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="#121212" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="#37b54a" />

                  {/* Matrix Dots */}
                  <rect x="38" y="10" width="6" height="6" fill="#121212" />
                  <rect x="48" y="10" width="6" height="6" fill="#121212" />
                  <rect x="38" y="20" width="6" height="6" fill="#121212" />
                  <rect x="48" y="20" width="6" height="6" fill="#121212" />
                  <rect x="56" y="20" width="6" height="6" fill="#121212" />

                  <rect x="10" y="38" width="6" height="6" fill="#121212" />
                  <rect x="20" y="38" width="6" height="6" fill="#121212" />
                  <rect x="38" y="38" width="8" height="8" rx="2" fill="#ffcc00" />
                  <rect x="50" y="38" width="6" height="6" fill="#121212" />
                  <rect x="65" y="38" width="6" height="6" fill="#121212" />
                  <rect x="78" y="38" width="6" height="6" fill="#121212" />
                  <rect x="88" y="38" width="6" height="6" fill="#121212" />

                  <rect x="10" y="48" width="6" height="6" fill="#121212" />
                  <rect x="25" y="48" width="6" height="6" fill="#121212" />
                  <rect x="38" y="50" width="6" height="6" fill="#121212" />
                  <rect x="50" y="50" width="6" height="6" fill="#121212" />
                  <rect x="65" y="50" width="6" height="6" fill="#121212" />
                  <rect x="80" y="48" width="6" height="6" fill="#121212" />

                  <rect x="38" y="65" width="6" height="6" fill="#121212" />
                  <rect x="48" y="65" width="6" height="6" fill="#121212" />
                  <rect x="58" y="65" width="6" height="6" fill="#121212" />
                  <rect x="70" y="65" width="6" height="6" fill="#121212" />
                  <rect x="85" y="65" width="6" height="6" fill="#121212" />

                  <rect x="38" y="78" width="6" height="6" fill="#121212" />
                  <rect x="50" y="78" width="6" height="6" fill="#121212" />
                  <rect x="65" y="78" width="6" height="6" fill="#121212" />
                  <rect x="80" y="78" width="6" height="6" fill="#121212" />

                  <rect x="48" y="88" width="6" height="6" fill="#121212" />
                  <rect x="60" y="88" width="6" height="6" fill="#121212" />
                  <rect x="75" y="88" width="6" height="6" fill="#121212" />
                </svg>
              </div>

              <p className="text-[11px] font-bold text-gray-400">
                Point your phone camera here to open directly on Google Play Store
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
