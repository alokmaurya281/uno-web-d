import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, PlusCircle, LogIn, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import socketService, { type PublicRoom } from '../../services/socketService';
import { sfx } from '../../services/soundEffects';

interface GameModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBotGame: () => void;
  onRoomJoined: (room: PublicRoom) => void;
}

export const GameModeModal: React.FC<GameModeModalProps> = ({
  isOpen,
  onClose,
  onStartBotGame,
  onRoomJoined,
}) => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'select' | 'create' | 'join'>('select');
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Create room options
  const [roomName, setRoomName] = useState(`${profile?.displayName || 'Player'}'s Arena`);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [allowStacking, setAllowStacking] = useState<boolean>(true);
  const [allowSevenZero, setAllowSevenZero] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    const unsubRoomJoined = socketService.on('room_joined', (room: PublicRoom) => {
      setIsSearchingMatch(false);
      sfx.playWinfare();
      onRoomJoined(room);
    });

    const unsubMatchFound = socketService.on('match_found', (data: any) => {
      setIsSearchingMatch(false);
      sfx.playWinfare();
      if (data.room) {
        onRoomJoined(data.room);
      }
    });

    const unsubRoomError = socketService.on('room_error', (msg: string) => {
      setError(msg);
      setIsSearchingMatch(false);
    });

    return () => {
      unsubRoomJoined();
      unsubMatchFound();
      unsubRoomError();
    };
  }, [isOpen, onRoomJoined]);

  if (!isOpen) return null;

  const handleQuickMatch = () => {
    sfx.playClick();
    setIsSearchingMatch(true);
    setError(null);
    socketService.joinQueue({
      name: profile?.displayName || 'Player',
      avatar: profile?.avatarUrl,
      uid: profile?.uid,
      betAmount: 50,
      mode: 'classic',
    });
  };

  const handleCancelQuickMatch = () => {
    sfx.playClick();
    socketService.leaveQueue();
    setIsSearchingMatch(false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    sfx.playClick();
    setError(null);
    socketService.createRoom({
      roomName,
      maxPlayers,
      betAmount,
      name: profile?.displayName || 'Player',
      avatar: profile?.avatarUrl,
      uid: profile?.uid,
      rules: {
        allowStacking,
        allowSevenZero,
        drawToMatch: false,
        turnTimeLimitSeconds: 15,
      },
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      setError('Please enter a 6-digit room code');
      return;
    }
    sfx.playClick();
    setError(null);
    socketService.joinRoom({
      roomCode: roomCodeInput.trim().toUpperCase(),
      name: profile?.displayName || 'Player',
      avatar: profile?.avatarUrl,
      uid: profile?.uid,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-['Outfit']">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-[#0e111a] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-uno-red via-uno-yellow to-uno-blue flex items-center justify-center text-black font-black shadow-lg">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Choose Game Mode</h2>
                <p className="text-xs text-gray-400">Play real-time online multiplayer or practice vs smart bots</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Match Radar State */}
          {isSearchingMatch ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full border-4 border-uno-yellow/40 border-t-uno-yellow animate-spin flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-uno-blue/40 border-b-uno-blue animate-spin" />
                </div>
                <Zap size={30} className="absolute inset-0 m-auto text-uno-yellow animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white">Searching for Opponents...</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Matching you with live players across web & mobile platforms on backend server
              </p>
              <button
                onClick={handleCancelQuickMatch}
                className="mt-6 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel Matchmaking
              </button>
            </div>
          ) : tab === 'select' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              {/* Option 1: Quick Match */}
              <button
                onClick={handleQuickMatch}
                className="p-6 rounded-2xl bg-gradient-to-br from-uno-red/20 via-black/40 to-uno-yellow/10 border border-uno-red/40 hover:border-uno-yellow/70 transition-all text-left group relative overflow-hidden flex flex-col justify-between h-48 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-uno-red/30 flex items-center justify-center text-uno-red">
                    <Zap size={24} />
                  </div>
                  <span className="text-[10px] font-black text-uno-yellow bg-uno-yellow/10 border border-uno-yellow/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Instant Match
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-uno-yellow transition-colors">
                    Quick Match (Online)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Real-time online match against live players via Socket.IO
                  </p>
                </div>
              </button>

              {/* Option 2: Private Room */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-uno-blue/20 via-black/40 to-purple-600/10 border border-uno-blue/40 flex flex-col justify-between h-48 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-uno-blue/30 flex items-center justify-center text-uno-blue">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-black text-uno-blue bg-uno-blue/10 border border-uno-blue/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Custom Room
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Private Party</h3>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setTab('create')}
                      className="flex-1 py-2 px-3 rounded-xl bg-uno-blue text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={14} /> Create
                    </button>
                    <button
                      onClick={() => setTab('join')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogIn size={14} /> Join
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 3: Practice vs Bots */}
              <button
                onClick={() => {
                  onClose();
                  onStartBotGame();
                }}
                className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-black/40 to-uno-green/10 border border-uno-green/40 hover:border-uno-green text-left flex items-center justify-between group transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-uno-green/30 flex items-center justify-center text-uno-green">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-uno-green transition-colors">
                      Play with Computer (Practice Mode)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Instant 3D game against smart AI bots with Stacking & 7-0 rules
                    </p>
                  </div>
                </div>
                <span className="px-4 py-2 rounded-xl bg-uno-green/20 text-uno-green font-bold text-xs uppercase tracking-wider">
                  Play Now →
                </span>
              </button>
            </div>
          ) : tab === 'create' ? (
            /* CREATE ROOM FORM */
            <form onSubmit={handleCreateRoom} className="space-y-4 my-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uno-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Max Players
                  </label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uno-blue"
                  >
                    <option value={2}>2 Players (1v1)</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players (Classic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Bet Coins
                  </label>
                  <select
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uno-blue"
                  >
                    <option value={0}>Free (0 Coins)</option>
                    <option value={25}>25 Coins</option>
                    <option value={50}>50 Coins</option>
                    <option value={100}>100 Coins</option>
                  </select>
                </div>
              </div>

              {/* Rules Toggles */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white text-xs">Allow Draw Stacking (+2 on +2, +4 on +4)</h5>
                    <p className="text-[10px] text-gray-400">Pass accumulated draw penalties to the next player</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowStacking}
                    onChange={(e) => setAllowStacking(e.target.checked)}
                    className="w-4 h-4 accent-uno-yellow cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <div>
                    <h5 className="font-bold text-white text-xs">7-0 Hand Swap Rule</h5>
                    <p className="text-[10px] text-gray-400">7 swaps hand with any player; 0 rotates all hands</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowSevenZero}
                    onChange={(e) => setAllowSevenZero(e.target.checked)}
                    className="w-4 h-4 accent-uno-yellow cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('select')}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-uno-blue text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg"
                >
                  Create Room & Invite Friends
                </button>
              </div>
            </form>
          ) : (
            /* JOIN ROOM FORM */
            <form onSubmit={handleJoinRoom} className="space-y-4 my-6">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Enter 6-Digit Room Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 7K29XF"
                  className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-4 bg-black/50 border border-white/20 rounded-2xl text-uno-yellow focus:outline-none focus:border-uno-yellow uppercase"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('select')}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-uno-yellow to-amber-500 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg"
                >
                  Join Room
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GameModeModal;
