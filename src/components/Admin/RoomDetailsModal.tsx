import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lock, 
  Globe, 
  Shield, 
  UserX,
  Play,
  Activity,
  Trash2
} from 'lucide-react';

interface RoomDetailsModalProps {
  room: {
    id: string;
    name: string;
    hostName: string;
    playerCount: number;
    maxPlayers: number;
    status: string;
    isPrivate: boolean;
    createdAt: number;
    gameMode?: string;
    players?: any; // To list player details if available
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, isOpen, onClose }) => {
  if (!room) return null;

  // Real player list from RTDB players object
  const players = room.players
    ? Object.values(room.players).map((p: any) => ({
        uid: p.uid || '',
        name: p.name || 'Unknown',
        isHost: !!p.isHost,
        status: p.status || 'unknown',
        joinedAt: p.joinedAt || 0,
      }))
    : [];

  // Real elapsed time
  const elapsedMs = room.createdAt ? Date.now() - room.createdAt : 0;
  const elapsedMin = Math.floor(elapsedMs / 60000);
  const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
  const elapsedStr = room.createdAt ? `${elapsedMin}m ${elapsedSec}s` : 'Unknown';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-uno-dark border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Left Sidebar - Session Status */}
            <div className="w-full md:w-80 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black italic text-2xl border ${
                  room.status === 'playing' ? 'bg-uno-green/20 border-uno-green/30 text-uno-green shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-uno-blue/20 border-uno-blue/30 text-uno-blue'
                }`}>
                  {room.name[0].toUpperCase()}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                  room.status === 'playing' ? 'bg-uno-green/10 text-uno-green border-uno-green/20' : 'bg-uno-blue/10 text-uno-blue border-uno-blue/20'
                }`}>
                  {room.status}
                </div>
              </div>

              <h2 className="text-2xl font-black italic text-white mb-1 uppercase tracking-tighter truncate">{room.name}</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-8">{room.gameMode} Mode</p>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">Visibility</span>
                    <span className="text-white font-black flex items-center gap-2">
                        {room.isPrivate ? <><Lock size={12} className="text-uno-yellow" /> Private</> : <><Globe size={12} className="text-uno-blue" /> Public</>}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">Created</span>
                    <span className="text-white font-black opacity-70">{room.createdAt ? new Date(room.createdAt).toLocaleTimeString() : '—'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">Session ID</span>
                    <span className="text-white font-black opacity-50">{room.id.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">Elapsed</span>
                    <span className="text-white font-black">{elapsedStr}</span>
                </div>
              </div>

              <div className="mt-auto pt-8 flex flex-col gap-3">
                <button className="w-full py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Play size={14} /> Force Start
                </button>
                <button className="w-full py-4 px-6 rounded-2xl bg-uno-red/10 text-uno-red hover:bg-uno-red/20 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Trash2 size={14} /> Terminate Room
                </button>
              </div>
            </div>

            {/* Right Content - Player Roster & Feed */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-2">Live Roster</h3>
                   <h4 className="text-3xl font-black italic uppercase italic">Active <span className="text-uno-red">Players</span></h4>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Player Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {players.length === 0 ? (
                <div className="col-span-2 py-10 text-center text-gray-600 font-bold text-xs uppercase tracking-widest">
                  No player data available
                </div>
              ) : players.map((p: any, i: number) => (
                <div key={p.uid || i} className="bg-white/5 rounded-3xl p-5 border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic shadow-lg ${
                      p.isHost ? 'bg-uno-red text-white' : 'bg-uno-blue/20 text-uno-blue'
                    }`}>
                      {(p.name?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {p.name} {p.isHost && <Shield size={12} className="text-uno-red" />}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest leading-none mt-1 ${
                        p.status === 'quit' || p.status === 'disconnected' ? 'text-uno-red' : 'text-gray-500'
                      }`}>
                        {p.status}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-uno-red/20 text-uno-red rounded-xl transition-all cursor-pointer">
                    <UserX size={16} />
                  </button>
                </div>
              ))}
              </div>

              <div className="glass-dark rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
                      <Activity size={12} className="text-uno-red" /> Room Info
                    </h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      room.status === 'playing' ? 'text-uno-green' : 'text-uno-blue'
                    }`}>
                      Status: {room.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-bold">Room Code</span>
                      <span className="font-black text-white">{(room as any).roomCode || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-bold">Host UID</span>
                      <span className="font-mono text-xs text-gray-400">{(room as any).hostUid?.slice(0, 16) || '—'}...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-bold">Auto-Dispose At</span>
                      <span className="font-black text-uno-yellow">
                        {(room as any).autoDisposeAt
                          ? new Date((room as any).autoDisposeAt).toLocaleString()
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-bold">Total Players</span>
                      <span className="font-black">{players.length} / {room.maxPlayers}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-uno-red/5 rounded-full blur-[60px] pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoomDetailsModal;
