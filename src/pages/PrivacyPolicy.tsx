import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Mail, Info, AlertTriangle, CheckCircle, ScrollText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'admob' | 'rules'>('privacy');
  const [showBackTop, setShowBackTop] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrolled = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      setReadProgress(Math.min(scrolled, 100));
      setShowBackTop(doc.scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const SectionNum = ({ num }: { num: string }) => (
    <span className="font-mono text-[0.7rem] font-medium text-muted bg-[#ede9e1] border border-black/10 rounded px-2 py-0.5 whitespace-nowrap mt-1 flex-shrink-0">
      § {num}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#0e0c0a] font-['DM_Sans'] selection:bg-red-100 selection:text-red-900 overflow-x-hidden relative">
      {/* Grain Texture Overflow */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.035] mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_256_256%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27noise%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23noise)%27/%3E%3C/svg%3E')]" />
      
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-0.5 bg-[#c8382b] z-[1000] transition-all duration-100"
        style={{ width: `${readProgress}%` }}
      />

      {/* Header */}
      <header className="bg-[#0e0c0a] text-[#f7f4ef] py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.015] bg-[repeating-linear-gradient(-45deg,white_0px,white_1px,transparent_1px,transparent_18px)]" />
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[0.68rem] tracking-[4px] uppercase text-white/35 mb-4 px-4"
        >
            Legal Documents
        </motion.div>
        <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="font-['Playfair_Display'] text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4"
        >
            <span className="text-[#e8102a]">U</span><span className="text-[#5b9bd5]">N</span><span className="text-[#70ad47]">O</span>
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-sm tracking-widest uppercase font-medium"
        >
            Platform Policies & Terms
        </motion.p>
      </header>

      {/* Tabs */}
      <nav className="bg-[#0e0c0a] border-t border-white/5 sticky top-0 z-[100] flex justify-center overflow-x-auto scrollbar-hide">
        {[
          { id: 'privacy', label: 'Privacy Policy' },
          { id: 'terms', label: 'Terms of Service' },
          { id: 'admob', label: 'Ad Policy' },
          { id: 'rules', label: 'Game Rules' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`font-mono text-[0.72rem] font-medium tracking-[2px] uppercase px-6 py-4 transition-all duration-300 border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-[#f7f4ef] border-[#c8382b]' 
                : 'text-white/35 border-transparent hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Wrap */}
      <main className="max-w-[820px] mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'privacy' && <PrivacyContent SectionNum={SectionNum} />}
            {activeTab === 'terms' && <TermsContent SectionNum={SectionNum} />}
            {activeTab === 'admob' && <AdPolicyContent SectionNum={SectionNum} />}
            {activeTab === 'rules' && <GameRulesContent SectionNum={SectionNum} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#ede9e1] border-t border-black/10 py-12 px-6 text-center">
        <div className="flex justify-center gap-2 mb-6">
          {['R','B','G','Y','W'].map((c, i) => (
            <div key={i} className={`w-7 h-10 rounded-md shadow-md border border-black/5 flex items-center justify-center font-['Playfair_Display'] font-black text-sm ${
                c === 'R' ? 'bg-[#e8102a] text-white' :
                c === 'B' ? 'bg-[#0057b7] text-white' :
                c === 'G' ? 'bg-[#00a550] text-white' :
                c === 'Y' ? 'bg-[#ffc000] text-black' :
                'bg-[#1a1a2e] text-[#ffd700]'
            }`}>{c}</div>
          ))}
        </div>
        <p className="font-mono text-[0.78rem] text-[#6b6560] tracking-wide">
          © 2026 UNO Game Platform &nbsp;·&nbsp; All rights reserved &nbsp;·&nbsp; Not affiliated with Mattel, Inc.
        </p>
      </footer>

      {/* Back to Top */}
      <motion.button
        animate={{ opacity: showBackTop ? 1 : 0, y: showBackTop ? 0 : 20 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#0e0c0a] text-white rounded-full flex items-center justify-center shadow-2xl z-[500] hover:bg-[#c8382b] transition-colors"
      >
        <ChevronUp size={24} />
      </motion.button>
    </div>
  );
};

// --- CONTENT COMPONENTS ---

const EffectiveDate = ({ date }: { date: string }) => (
  <div className="flex items-center gap-3 px-0 py-4 my-10 border-y border-black/10">
    <div className="w-2 h-2 rounded-full bg-[#15803d]" />
    <p className="font-mono text-[0.75rem] text-[#6b6560] tracking-wider uppercase">
      Effective Date: <strong className="text-[#0e0c0a]">{date}</strong>
    </p>
  </div>
);

const PrivacyContent = ({ SectionNum }: any) => (
  <div className="legal-doc">
    <EffectiveDate date="March 12, 2026" />
    
    <div className="bg-[#ede9e1] border-l-4 border-[#0e0c0a] rounded-r-lg p-6 mb-14">
      <h4 className="font-mono text-[0.65rem] font-semibold tracking-[3px] uppercase text-[#6b6560] mb-4">Contents</h4>
      <ol className="list-decimal list-inside space-y-2 text-sm font-medium">
        <li>Information We Collect</li>
        <li>How We Use Your Information</li>
        <li>Firebase Infrastructure</li>
        <li>Children's Privacy</li>
        <li>Data Retention</li>
      </ol>
    </div>

    <section className="mb-14">
      <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-6 flex items-start gap-4">
        <SectionNum num="01" /> Information We Collect
      </h2>
      <p className="text-[#2d2b28] leading-[1.8] mb-6">
        We collect only the information necessary to provide a functional, personalized gaming experience. Here is a full breakdown:
      </p>
      <div className="overflow-x-auto rounded-xl border border-black/10 shadow-sm mb-6">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-[#0e0c0a] text-white font-mono uppercase tracking-wider">
                <tr>
                    <th className="px-4 py-3 font-medium">Data Type</th>
                    <th className="px-4 py-3 font-medium">Required?</th>
                    <th className="px-4 py-3 font-medium">Purpose</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
                {[
                    { t: 'Display Name', r: 'Yes', p: 'Show in lobbies' },
                    { t: 'Email Address', r: 'No', p: 'Account identification' },
                    { t: 'Firebase UID', r: 'Yes', p: 'Unique ID' },
                    { t: 'Game Stats', r: 'Yes', p: 'Leaderboards' },
                ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#ede9e1]/30'}>
                        <td className="px-4 py-3 font-bold">{row.t}</td>
                        <td className="px-4 py-3 font-mono">{row.r}</td>
                        <td className="px-4 py-3 text-[#6b6560]">{row.p}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <div className="bg-[#15803d]/5 border border-[#15803d]/15 rounded-lg p-5 flex gap-4 items-start text-[#14532d] text-[0.88rem] leading-relaxed">
        <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
        <p>We do <strong>not</strong> collect your real name, phone number, physical address, or payment information.</p>
      </div>
    </section>

    <section className="mb-14">
      <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-6 flex items-start gap-4">
        <SectionNum num="02" /> How We Use Your Information
      </h2>
      <p className="text-[#2d2b28] leading-[1.8] mb-4">Your information is used exclusively for the following purposes:</p>
      <ul className="space-y-3 mb-6">
        {['Creating and managing game accounts (anonymous or Google)', 'Real-time multiplayer via Firebase', 'Displaying usernames in shared rooms', 'Maintaining leaderboard and records'].map((li, i) => (
            <li key={i} className="flex gap-3 text-[0.93rem] text-[#2d2b28]">
                <span className="text-[#6b6560] font-mono mt-1">—</span> {li}
            </li>
        ))}
      </ul>
    </section>

    <div className="bg-[#0e0c0a] text-[#f7f4ef] rounded-2xl p-8 mt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e8102a] via-[#1b4fd8] to-[#ffc000]" />
        <h3 className="font-['Playfair_Display'] text-xl mb-4">Contact & Privacy Requests</h3>
        <p className="text-white/50 text-sm mb-6">For any privacy-related questions, data requests, or concerns, reach us at:</p>
        <a href="mailto:privacy@unogame.app" className="inline-flex items-center gap-3 bg-white/10 border border-white/10 rounded-lg px-5 py-3 font-mono text-sm hover:bg-white/15 transition-all">
            <Mail size={16} /> privacy@unogame.app
        </a>
    </div>
  </div>
);

const TermsContent = ({ SectionNum }: any) => (
  <div className="legal-doc">
    <EffectiveDate date="March 12, 2026" />
    <section className="mb-14">
      <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-6 flex items-start gap-4">
        <SectionNum num="01" /> Acceptance of Terms
      </h2>
      <p className="text-[#2d2b28] leading-[1.8] mb-6">By downloading, installing, or using UNO Game, you agree to be bound by these Terms of Service. If you do not agree, do not use the App.</p>
      <div className="bg-[#c8382b]/5 border border-[#c8382b]/15 rounded-lg p-5 flex gap-4 items-start text-[#7a1e17] text-[0.88rem] leading-relaxed">
        <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
        <p>These Terms include an important <strong>limitation of liability clause</strong> in Section 10. Please read it carefully.</p>
      </div>
    </section>

    <section className="mb-14">
        <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-6 flex items-start gap-4">
            <SectionNum num="02" /> Intellectual Property
        </h2>
        <div className="bg-[#1b4fd8]/5 border border-[#1b4fd8]/15 rounded-lg p-5 flex gap-4 items-start text-[#1a3a7a] text-[0.88rem] leading-relaxed mb-6">
            <Info size={18} className="mt-0.5 flex-shrink-0" />
            <p>UNO® is a registered trademark of Mattel, Inc. This app is an independent fan-made implementation and is not affiliated with, endorsed by, or sponsored by Mattel, Inc.</p>
        </div>
        <p className="text-[#2d2b28] leading-[1.8]">The Developer is <strong>Alok Shiv</strong>. All code and logic developed for this implementation is proprietary.</p>
    </section>
  </div>
);

const AdPolicyContent = ({ SectionNum }: any) => (
  <div className="legal-doc">
    <EffectiveDate date="March 12, 2026" />
    <section className="mb-14">
        <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-6 flex items-start gap-4">
            <SectionNum num="01" /> Ad Display Standards
        </h2>
        <p className="text-[#2d2b28] leading-[1.8] mb-6">This app is free to play and supported by Google AdMob. To ensure fair gameplay, we follow strict display rules:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { t: 'Banners', d: 'Shown only in menus/lobbies' },
                { t: 'Interstitials', d: 'Shown only AFTER a game ends' },
                { t: 'Frequency', d: 'Approx. every 2-3 completed matches' },
                { t: 'In-Game', d: 'Ads are NEVER shown during active turns' }
            ].map((box, i) => (
                <div key={i} className="bg-white border border-black/5 p-4 rounded-xl shadow-sm">
                    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[#b8892a] mb-1 block">{box.t}</span>
                    <p className="text-sm font-semibold">{box.d}</p>
                </div>
            ))}
        </div>
    </section>
  </div>
);

const GameRulesContent = ({ SectionNum }: any) => (
  <div className="legal-doc">
    <EffectiveDate date="March 12, 2026" />
    <section className="mb-14">
        <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-6 flex items-start gap-4">
            <SectionNum num="01" /> Official Mattel Rules
        </h2>
        <p className="text-[#2d2b28] leading-[1.8] mb-6">We implement the standard 112-card ruleset including Action cards and Wilds.</p>
        <div className="bg-[#ede9e1] border border-black/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-[#b8892a]">
                <ScrollText size={20} />
                <h3 className="font-bold tracking-tight">Standard Penalty System</h3>
            </div>
            <ul className="space-y-4">
                {[
                    { l: 'UNO Call', d: 'Must be called with 1 card left or +2 draw penalty.' },
                    { l: 'Illegal Wild +4', d: 'If challenged and caught, must draw 4 cards instead.' },
                    { l: 'Draw Skip', d: 'Draw 1 card if no match, turn passes automatically.' }
                ].map((item, i) => (
                    <li key={i} className="border-b border-black/5 pb-4 last:border-0 last:pb-0">
                        <span className="font-mono text-[0.65rem] uppercase block mb-1 text-[#6b6560]">{item.l}</span>
                        <p className="text-sm font-medium">{item.d}</p>
                    </li>
                ))}
            </ul>
        </div>
    </section>
  </div>
);

export default PrivacyPolicy;
