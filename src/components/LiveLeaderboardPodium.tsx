import React from 'react';
import { Trophy, Crown, Activity, ShieldCheck, Gamepad2, Users } from 'lucide-react';

interface LeaderboardPlayer {
  rank: number;
  name: string;
  avatar: string;
  score: string;
  winRate: string;
  badge: string;
  borderClass: string;
  glowClass: string;
}

const TOP_PLAYERS: LeaderboardPlayer[] = [
  { rank: 1, name: 'AlexTheChampion', avatar: '🦁', score: '48,920', winRate: '78.4%', badge: 'Grandmaster', borderClass: 'border-amber-400', glowClass: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]' },
  { rank: 2, name: 'SoniaWildMaster', avatar: '🦊', score: '42,150', winRate: '72.1%', badge: 'UNO Legend', borderClass: 'border-slate-300', glowClass: 'shadow-[0_0_20px_rgba(203,213,225,0.3)]' },
  { rank: 3, name: 'RajReverseKing', avatar: '🐯', score: '39,400', winRate: '69.8%', badge: 'Master Tier', borderClass: 'border-amber-700', glowClass: 'shadow-[0_0_20px_rgba(180,83,9,0.3)]' },
];

export const LiveLeaderboardPodium: React.FC = () => {
  return (
    <section id="leaderboard" className="w-full py-24 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-4">
            <Trophy size={14} /> Global Rankings
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white mb-4">
            LIVE MULTIPLAYER <span className="text-amber-400">LEADERBOARD</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Climb the global ranks in competitive multiplayer matches, maintain win streaks, and earn permanent cosmetic honors.
          </p>
        </div>

        {/* TOP 3 PODIUM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-16 max-w-5xl mx-auto">
          {/* #2 RUNNER UP */}
          <div className="order-2 md:order-1 glass-dark p-6 rounded-3xl border border-white/10 text-center relative hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full border-4 border-slate-300 mx-auto mb-3 flex items-center justify-center text-3xl bg-neutral-800 shadow-lg">
              {TOP_PLAYERS[1].avatar}
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-slate-300 text-black uppercase mb-2">
              #2 Silver Rank
            </span>
            <h3 className="font-black text-xl text-white">{TOP_PLAYERS[1].name}</h3>
            <p className="text-xs text-gray-400 mb-3">{TOP_PLAYERS[1].badge}</p>
            <div className="pt-3 border-t border-white/10 flex justify-around text-xs">
              <div>
                <span className="text-gray-500 block uppercase">Score</span>
                <span className="font-black text-white">{TOP_PLAYERS[1].score}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Win Rate</span>
                <span className="font-black text-uno-green">{TOP_PLAYERS[1].winRate}</span>
              </div>
            </div>
          </div>

          {/* #1 CHAMPION (TALLER PODIUM) */}
          <div className="order-1 md:order-2 glass-dark p-8 rounded-[2.5rem] border-2 border-amber-400 text-center relative hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(251,191,36,0.25)] md:-translate-y-4">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Crown size={32} className="text-amber-400 animate-bounce" />
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-amber-400 mx-auto mb-4 flex items-center justify-center text-4xl bg-neutral-900 shadow-2xl">
              {TOP_PLAYERS[0].avatar}
            </div>
            <span className="inline-block px-4 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-600 text-black uppercase mb-2 shadow">
              👑 #1 Global Champion
            </span>
            <h3 className="font-black text-2xl text-white">{TOP_PLAYERS[0].name}</h3>
            <p className="text-xs text-amber-300 font-bold mb-4">{TOP_PLAYERS[0].badge}</p>
            <div className="pt-4 border-t border-white/10 flex justify-around text-sm">
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold">Total Score</span>
                <span className="font-black text-white text-lg">{TOP_PLAYERS[0].score}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase font-bold">Win Rate</span>
                <span className="font-black text-uno-green text-lg">{TOP_PLAYERS[0].winRate}</span>
              </div>
            </div>
          </div>

          {/* #3 THIRD PLACE */}
          <div className="order-3 glass-dark p-6 rounded-3xl border border-white/10 text-center relative hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full border-4 border-amber-700 mx-auto mb-3 flex items-center justify-center text-3xl bg-neutral-800 shadow-lg">
              {TOP_PLAYERS[2].avatar}
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-700 text-white uppercase mb-2">
              #3 Bronze Rank
            </span>
            <h3 className="font-black text-xl text-white">{TOP_PLAYERS[2].name}</h3>
            <p className="text-xs text-gray-400 mb-3">{TOP_PLAYERS[2].badge}</p>
            <div className="pt-3 border-t border-white/10 flex justify-around text-xs">
              <div>
                <span className="text-gray-500 block uppercase">Score</span>
                <span className="font-black text-white">{TOP_PLAYERS[2].score}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Win Rate</span>
                <span className="font-black text-uno-green">{TOP_PLAYERS[2].winRate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE SERVER METRICS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 glass-dark p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-uno-blue/10 border border-uno-blue/20 flex items-center justify-center text-uno-blue">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-500">Live Matchmaking</span>
              <p className="text-base font-black text-white">Instant &lt; 2s</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-uno-green/10 border border-uno-green/20 flex items-center justify-center text-uno-green">
              <Activity size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-500">Server Latency</span>
              <p className="text-base font-black text-white">32ms Global</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-uno-yellow/10 border border-uno-yellow/20 flex items-center justify-center text-uno-yellow">
              <Gamepad2 size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-500">Match Rooms</span>
              <p className="text-base font-black text-white">2, 3 & 4 Players</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-uno-red/10 border border-uno-red/20 flex items-center justify-center text-uno-red">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-500">Anti-Cheat Engine</span>
              <p className="text-base font-black text-white">Server-Verified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
