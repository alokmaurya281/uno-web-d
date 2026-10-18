import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Copy, Check, Play, MessageSquare, Send, Shield, Sparkles } from 'lucide-react';
import socketService, { type PublicRoom } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import { sfx } from '../../services/soundEffects';

interface WaitingRoomModalProps {
  room: PublicRoom | null;
  isOpen: boolean;
  onClose: () => void;
  onGameStart: () => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onGameStart,
}) => {
  const { profile } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<PublicRoom | null>(room);
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; isHost?: boolean }>>([
    { sender: 'System', text: 'Waiting room created! Share your 6-digit room code with friends.' },
  ]);

  useEffect(() => {
    setCurrentRoom(room);
  }, [room]);

  useEffect(() => {
    if (!isOpen) return;

    const unsubRoomUpdate = socketService.on('room_update', (updated: PublicRoom) => {
      setCurrentRoom(updated);
    });

    const unsubGameStarted = socketService.on('game_started', () => {
      sfx.playWinfare();
      onGameStart();
    });

    const unsubChat = socketService.on('room_chat_message', (msg: any) => {
      setMessages((prev) => [...prev, { sender: msg.sender?.name || 'Player', text: msg.message }]);
    });

    return () => {
      unsubRoomUpdate();
      unsubGameStarted();
      unsubChat();
    };
  }, [isOpen, onGameStart]);

  if (!isOpen || !currentRoom) return null;

  const isHost = currentRoom.hostId === (profile?.uid || socketService['socket']?.id);
  const canStart = currentRoom.players.length >= 2;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    setCopied(true);
    sfx.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (!canStart) {
      alert('At least 2 players are needed to start an UNO match!');
      return;
    }
    sfx.playClick();
    socketService.startRoomGame();
  };

  const handleLeave = () => {
    sfx.playClick();
    socketService.leaveRoom();
    onClose();
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    socketService.sendRoomChat(chatMessage.trim());
    setMessages((prev) => [
      ...prev,
      { sender: profile?.displayName || 'You', text: chatMessage.trim() },
    ]);
    setChatMessage('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-['Outfit']">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl bg-[#0f121a] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-uno-blue/10 border border-uno-blue/30 flex items-center justify-center text-uno-blue shadow-lg">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {currentRoom.name} <Sparkles size={16} className="text-uno-yellow" />
                </h3>
                <p className="text-xs text-gray-400">
                  {currentRoom.players.length} / {currentRoom.maxPlayers} Players Joined
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Room Code Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-uno-yellow/40">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ROOM CODE:</span>
                <span className="font-mono text-base font-black text-uno-yellow tracking-widest">{currentRoom.code}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Copy room code"
                >
                  {copied ? <Check size={16} className="text-uno-green" /> : <Copy size={16} />}
                </button>
              </div>

              <button
                onClick={handleLeave}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Area: Players & Chat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            {/* Players Grid */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                <span>Player Slots</span>
                <span className="text-uno-yellow">Bet: {currentRoom.betAmount} Coins</span>
              </h4>

              <div className="space-y-2.5">
                {Array.from({ length: currentRoom.maxPlayers }).map((_, idx) => {
                  const player = currentRoom.players[idx];
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        player
                          ? 'bg-white/5 border-white/10 shadow-sm'
                          : 'bg-black/30 border-dashed border-white/10 text-gray-500'
                      }`}
                    >
                      {player ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`}
                            alt={player.name}
                            className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 p-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{player.name}</span>
                              {player.isHost && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                                  HOST
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">Ready to play</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-2 py-1 text-xs">
                          <div className="w-8 h-8 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-gray-500">
                            {idx + 1}
                          </div>
                          <span>Waiting for player to join...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Game Rules summary badge */}
              <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-400 flex items-center gap-3">
                <Shield size={14} className="text-uno-yellow shrink-0" />
                <span>
                  Stacking: <b className="text-white">{currentRoom.rules?.allowDrawStacking ?? currentRoom.rules?.allowStacking ? 'Enabled (+2/+4)' : 'Disabled'}</b> • 
                  7-0 Swap: <b className="text-white">{currentRoom.rules?.allowSevenZero ? 'Enabled' : 'Disabled'}</b>
                </span>
              </div>
            </div>

            {/* Room Chat */}
            <div className="flex flex-col bg-black/30 rounded-2xl border border-white/5 p-4 h-72">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                <MessageSquare size={14} /> Room Chat
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                {messages.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-bold text-uno-yellow mr-1.5">{m.sender}:</span>
                    <span className="text-gray-200">{m.text}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-uno-yellow"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-uno-yellow text-black font-bold hover:brightness-110 transition-all"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={handleLeave}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Leave Room
            </button>

            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-uno-green via-emerald-400 to-green-500 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(55,181,74,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center gap-2"
              >
                <Play size={16} fill="currentColor" /> Start UNO Match
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold animate-pulse">
                <span>Waiting for Host to start the match...</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WaitingRoomModal;
