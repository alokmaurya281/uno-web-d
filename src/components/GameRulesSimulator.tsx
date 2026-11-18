import React, { useState } from 'react';
import { Gamepad2, ArrowRightLeft, Layers, Zap, Shuffle, CheckCircle } from 'lucide-react';
import { InteractiveCard3D } from './InteractiveCard3D';
import { sfx } from '../services/soundEffects';

type GameModeKey = 'classic' | 'sevenZero' | 'stacking' | 'jumpIn' | 'drawToMatch';

interface ModeInfo {
  key: GameModeKey;
  title: string;
  badge: string;
  badgeClass: string;
  icon: React.ReactNode;
  summary: string;
  ruleExplanation: string[];
}

const MODES: ModeInfo[] = [
  {
    key: 'classic',
    title: 'Classic UNO Official',
    badge: 'Standard',
    badgeClass: 'bg-blue-900/60 text-blue-300 border-blue-500/40',
    icon: <Gamepad2 size={20} className="text-uno-blue" />,
    summary: 'The timeless traditional UNO rules played across the globe.',
    ruleExplanation: [
      'Match cards by color or number on top of the discard pile.',
      'Action cards (Skip, Reverse, Draw Two) directly penalize the immediate next player.',
      'Wild Draw Four is allowed only when you have no card of the current active color.',
      'Must press UNO before playing your second-to-last card, or draw 2 cards on challenge!',
    ],
  },
  {
    key: 'sevenZero',
    title: '7-0 Hand Swap Mode',
    badge: 'Tactical',
    badgeClass: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
    icon: <ArrowRightLeft size={20} className="text-uno-accent" />,
    summary: 'Card 7 swaps your hand with an opponent; Card 0 rotates all hands in turn order.',
    ruleExplanation: [
      'Playing a 7 forces you to select ANY opponent and swap your entire hand with theirs.',
      'Playing a 0 rotates all player hands simultaneously in the current play direction.',
      'Steal an opponent with 1 card left right before they win!',
      'Playing a 7 as your final card wins immediately without swapping.',
    ],
  },
  {
    key: 'stacking',
    title: 'Stacking Penalty Mode',
    badge: 'High Stakes',
    badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
    icon: <Layers size={20} className="text-uno-yellow" />,
    summary: 'Draw Twos and Wild Draw Fours stack, accumulating massive penalties.',
    ruleExplanation: [
      'Play a +2 on top of a +2 to pass the penalty and increase it to +4!',
      'Play a +4 on top of a +4 to escalate the penalty to +8 or more.',
      'The chain continues until a player cannot stack and must draw the entire accumulated sum.',
      'Mixed stacking allows +4 on +2 if configured in room settings.',
    ],
  },
  {
    key: 'jumpIn',
    title: 'Jump-In Reflex Mode',
    badge: 'Fast Paced',
    badgeClass: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
    icon: <Zap size={20} className="text-uno-green" />,
    summary: 'Play out-of-turn if you hold the exact matching card color and number.',
    ruleExplanation: [
      'Whenever ANY card is played, if you hold the identical card (exact color + value), tap Jump In!',
      'You play your card instantly, interrupting the turn order.',
      'Play continues forward from YOUR seat, skipping all players in between.',
      'Wild cards cannot be jumped in; only matching number and action cards.',
    ],
  },
  {
    key: 'drawToMatch',
    title: 'Draw to Match Mode',
    badge: 'Endurance',
    badgeClass: 'bg-rose-900/60 text-rose-300 border-rose-500/40',
    icon: <Shuffle size={20} className="text-uno-red" />,
    summary: 'No single draw passing. Players must draw continuously until finding a valid match.',
    ruleExplanation: [
      'When you have no playable card, you must draw from the deck repeatedly.',
      'You keep drawing until you draw a card that can legally be played.',
      'Creates giant hands, dramatic comebacks, and rapid score shifts.',
      'Great for endurance matches and private party lobbies.',
    ],
  },
];

export const GameRulesSimulator: React.FC = () => {
  const [activeMode, setActiveMode] = useState<GameModeKey>('sevenZero');
  
  // 7-0 Interactive simulator state
  const [playerHandCount, setPlayerHandCount] = useState(5);
  const [opponentHands, setOpponentHands] = useState([
    { name: 'Bot Alice', count: 1, avatar: '👩' },
    { name: 'Bot Bob', count: 6, avatar: '👨' },
    { name: 'Bot Charlie', count: 3, avatar: '🤖' },
  ]);
  const [simulationLog, setSimulationLog] = useState('Select an action or opponent to test mode mechanics.');

  // Stacking interactive simulator state
  const [stackAccumulator, setStackAccumulator] = useState(2);

  const selectedMode = MODES.find((m) => m.key === activeMode) || MODES[0];

  const handleSimulate7Swap = (targetIndex: number) => {
    sfx.playCardPlay();
    const target = opponentHands[targetIndex];
    const prevPlayer = playerHandCount;
    setPlayerHandCount(target.count);
    const updated = [...opponentHands];
    updated[targetIndex].count = prevPlayer;
    setOpponentHands(updated);
    setSimulationLog(`🔄 Swapped hands with ${target.name}! You now have ${target.count} cards; they have ${prevPlayer} cards.`);
  };

  const handleSimulate0Rotate = () => {
    sfx.playCardPlay();
    const prevPlayer = playerHandCount;
    setPlayerHandCount(opponentHands[2].count);
    setOpponentHands([
      { ...opponentHands[0], count: prevPlayer },
      { ...opponentHands[1], count: opponentHands[0].count },
      { ...opponentHands[2], count: opponentHands[1].count },
    ]);
    setSimulationLog(`🌀 Played Card 0! Rotated all 4 hands clockwise around the table!`);
  };

  const handleStackAdd = () => {
    sfx.playCardPlay();
    const next = stackAccumulator + 2;
    setStackAccumulator(next);
    setSimulationLog(`💥 Stacked +2! Accumulated penalty is now +${next} cards for the next player!`);
  };

  const handleStackReset = () => {
    sfx.playCardClick();
    setStackAccumulator(2);
    setSimulationLog(`Player drew penalty. Resetting stack to default.`);
  };

  return (
    <section id="modes" className="w-full py-24 px-4 sm:px-6 relative z-10 bg-black/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-uno-blue/10 border border-uno-blue/30 text-uno-blue text-xs font-black uppercase tracking-widest mb-4">
            <Gamepad2 size={14} /> Official Game Engine
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white mb-4">
            GAME MODES & <span className="text-uno-blue">RULES SIMULATOR</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Test custom house rules, 7-0 swaps, stacking chains, and reflexes before jumping into live matchmaking.
          </p>
        </div>

        {/* MODE SELECTOR PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => {
                sfx.playCardClick();
                setActiveMode(mode.key);
                setSimulationLog(`Switched to ${mode.title}.`);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeMode === mode.key
                  ? 'glass-dark border-uno-blue shadow-lg shadow-uno-blue/30 scale-[1.02]'
                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
              }`}
            >
              <div>
                <div className="mb-2">{mode.icon}</div>
                <h3 className="font-black text-white text-sm sm:text-base leading-snug">{mode.title}</h3>
              </div>
              <span className={`mt-3 inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full border self-start ${mode.badgeClass}`}>
                {mode.badge}
              </span>
            </button>
          ))}
        </div>

        {/* SIMULATOR STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-dark p-6 sm:p-10 rounded-[2.5rem] border border-white/15">
          {/* LEFT: RULES EXPLANATION (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {selectedMode.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white uppercase">{selectedMode.title}</h3>
                <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${selectedMode.badgeClass}`}>
                  {selectedMode.badge} Mode
                </span>
              </div>
            </div>

            <p className="text-gray-300 text-base font-medium leading-relaxed">
              {selectedMode.summary}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Core Tournament Rules:</h4>
              {selectedMode.ruleExplanation.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle size={16} className="text-uno-green shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: INTERACTIVE SIMULATOR TESTBENCH (7 COLS) */}
          <div className="lg:col-span-7 bg-black/60 rounded-3xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-uno-red animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Interactive Simulator Bench
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400">Status: LIVE TEST</span>
            </div>

            {/* SIMULATOR CONTENT DEPENDING ON ACTIVE MODE */}
            {activeMode === 'sevenZero' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-bold">Your Current Hand:</span>
                    <div className="text-2xl font-black text-white">{playerHandCount} Cards Remaining</div>
                  </div>
                  <button
                    onClick={handleSimulate0Rotate}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Shuffle size={14} /> Play 0 (Rotate Hands)
                  </button>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-black tracking-wider block mb-3">
                    Play Card 7: Tap Opponent to Steal Their Hand:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {opponentHands.map((opp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSimulate7Swap(idx)}
                        className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-uno-accent hover:bg-uno-accent/10 transition-all text-left group cursor-pointer"
                      >
                        <div className="text-3xl mb-2">{opp.avatar}</div>
                        <div className="font-bold text-white text-sm group-hover:text-uno-yellow">{opp.name}</div>
                        <div className="text-xs text-uno-red font-black mt-1">{opp.count} Card{opp.count !== 1 ? 's' : ''}</div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block mt-2 group-hover:underline">
                          Tap to Swap 🔄
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeMode === 'stacking' && (
              <div className="space-y-6 text-center py-4">
                <div className="inline-block p-6 rounded-3xl bg-gradient-to-br from-amber-950/80 to-black border-2 border-amber-500/60 shadow-xl shadow-amber-500/20">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-1">
                    Current Stacked Penalty
                  </span>
                  <div className="text-6xl font-black italic text-white tracking-tighter">
                    +{stackAccumulator} <span className="text-2xl text-uno-yellow">Cards</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-2 block">
                    Accumulated from consecutive Draw Two cards!
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleStackAdd}
                    className="px-6 py-3 rounded-xl bg-uno-yellow text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-uno-yellow/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    + Play +2 to Stack Penalty
                  </button>
                  <button
                    onClick={handleStackReset}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs tracking-wider transition-all cursor-pointer"
                  >
                    Resolve / Draw Penalty
                  </button>
                </div>
              </div>
            )}

            {activeMode === 'jumpIn' && (
              <div className="space-y-5 text-center py-4">
                <div className="flex justify-center items-center gap-6">
                  <div className="text-center">
                    <span className="text-xs text-gray-400 uppercase font-bold block mb-2">Discard Pile:</span>
                    <InteractiveCard3D color="red" value="5" size="sm" interactive={false} />
                  </div>
                  <div className="text-2xl text-gray-500 font-black">⚡ VS ⚡</div>
                  <div className="text-center">
                    <span className="text-xs text-gray-400 uppercase font-bold block mb-2">Your Hand Card:</span>
                    <InteractiveCard3D color="red" value="5" size="sm" interactive={false} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    sfx.playCardPlay();
                    setSimulationLog('🔥 JUMPED IN! You bypassed turn order and played out-of-turn!');
                  }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-uno-green to-emerald-600 text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-uno-green/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  ⚡ Tap JUMP-IN Out of Turn!
                </button>
              </div>
            )}

            {(activeMode === 'classic' || activeMode === 'drawToMatch') && (
              <div className="space-y-4 py-4 text-center">
                <div className="flex justify-center gap-4">
                  <InteractiveCard3D color="blue" value="skip" size="sm" interactive={false} />
                  <InteractiveCard3D color="green" value="reverse" size="sm" interactive={false} />
                  <InteractiveCard3D color="yellow" value="draw2" size="sm" interactive={false} />
                  <InteractiveCard3D color="black" value="draw4" size="sm" interactive={false} />
                </div>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  {activeMode === 'classic'
                    ? 'Strict official rules enforced by server authoritative game state. No unauthorized client overrides.'
                    : 'Draw card penalty keeps accumulating until a valid playable card appears in hand.'}
                </p>
              </div>
            )}

            {/* LIVE CONSOLE LOG */}
            <div className="bg-neutral-900/90 rounded-2xl p-4 border border-white/5 font-mono text-xs text-gray-300 flex items-center gap-2">
              <span className="text-uno-green">➜</span>
              <span className="text-uno-yellow font-bold">Simulator:</span>
              <span>{simulationLog}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
