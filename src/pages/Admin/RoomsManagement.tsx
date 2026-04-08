import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Users, 
  Clock, 
  Lock, 
  Globe, 
  Trash2, 
  Eye, 
  Search,
  Activity,
  AlertTriangle,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ref, onValue, off, remove } from 'firebase/database';
import { rtdb } from '../../firebase/config';
import RoomDetailsModal from '../../components/Admin/RoomDetailsModal';

// Real RTDB schema:
// rooms/{id}/info  → { status, createdAt, autoDisposeAt, hostUid, roomCode, isPublic, maxPlayers, lastActivityAt }
// rooms/{id}/players/{uid} → { name, isHost, status, joinedAt, uid }
// roomCodes/{roomCode} → true (or roomId)

interface RoomData {
  id: string;
  name: string;
  hostName: string;
  hostUid: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
  isPrivate: boolean;
  createdAt: number;
  autoDisposeAt: number;
  roomCode: string;
  players: Record<string, any>;
  // Staleness flags
  isStale?: boolean;
  staleReason?: string;
}


function checkIfAbandoned(room: RoomData): { abandoned: boolean; reason: string } {
  // Use the explicit status from the database
  if (room.status === 'abandoned') {
    return { abandoned: true, reason: 'System Flagged: Abandoned' };
  }

  // Fallback: 0 players for more than 5 minutes (optional, but requested just status)
  // Let's stick strictly to status as requested.
  return { abandoned: false, reason: '' };
}

const RoomsManagement: React.FC = () => {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'playing' | 'waiting' | 'abandoned'>('all');
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);

  // Room Modal State
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openRoomDetails = (room: RoomData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const roomsRef = ref(rtdb, 'rooms');
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomsList: RoomData[] = Object.entries(data).map(([key, value]: [string, any]) => {
          // Map real RTDB schema: data lives under `info` sub-key
          const info = value.info || {};
          const players = value.players || {};
          const playerList = Object.values(players) as any[];
          const host = playerList.find((p: any) => p.isHost) || playerList[0];

          const room: RoomData = {
            id: key,
            name: `Room ${info.roomCode || key.slice(0, 6)}`,
            hostName: host?.name || info.hostUid?.slice(0, 8) || 'Unknown',
            hostUid: info.hostUid || '',
            playerCount: playerList.length,
            maxPlayers: info.maxPlayers || 4,
            status: info.status || 'waiting',
            isPrivate: !info.isPublic,
            createdAt: info.createdAt || 0,
            autoDisposeAt: info.autoDisposeAt || 0,
            roomCode: info.roomCode || '',
            players,
          };

          const { abandoned, reason } = checkIfAbandoned(room);
          room.isStale = abandoned;
          room.staleReason = reason;
          return room;
        });
        setRooms(roomsList);
      } else {
        setRooms([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('RTDB Error:', error);
      setLoading(false);
    });

    return () => off(ref(rtdb, 'rooms'));
  }, []);

  // Delete a single room + its roomCode entry
  const deleteRoom = async (room: RoomData) => {
    try {
      await remove(ref(rtdb, `rooms/${room.id}`));
      if (room.roomCode) {
        await remove(ref(rtdb, `roomCodes/${room.roomCode}`));
      }
    } catch (e) {
      console.error('Delete failed:', e);
      throw e;
    }
  };

  // Bulk delete selected rooms
  const bulkDelete = async (onlyStale = false) => {
    setIsDeleting(true);
    setDeleteResult(null);
    const toDelete = onlyStale
      ? rooms.filter(r => r.isStale)
      : rooms.filter(r => selectedRoomIds.has(r.id));

    let succeeded = 0;
    let failed = 0;
    for (const room of toDelete) {
      try {
        await deleteRoom(room);
        succeeded++;
      } catch {
        failed++;
      }
    }
    setSelectedRoomIds(new Set());
    setIsDeleting(false);
    setDeleteResult(`Deleted ${succeeded} room${succeeded !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}.`);
    setTimeout(() => setDeleteResult(null), 5000);
  };

  const toggleSelect = (id: string) => {
    setSelectedRoomIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomCode.includes(searchTerm);
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'abandoned' ? room.isStale : room.status === activeFilter);
    return matchesSearch && matchesFilter;
  });

  const abandonedCount = rooms.filter(r => r.isStale).length;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic">
            Live <span className="text-uno-red">Rooms</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Monitor active game sessions.{' '}
            <span className="text-uno-red font-bold">{abandonedCount} abandoned</span> room{abandonedCount !== 1 ? 's' : ''} eligible for deletion.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-uno-green/10 rounded-xl border border-uno-green/20">
            <div className="w-2 h-2 bg-uno-green rounded-full animate-ping" />
            <span className="text-[10px] font-black text-uno-green uppercase tracking-widest">Live</span>
          </div>
          {abandonedCount > 0 && (
            <button
              onClick={() => bulkDelete(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-3 bg-uno-red text-white hover:bg-uno-red/90 border border-uno-red/20 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-uno-red/20"
            >
              <Trash2 size={16} />
              {isDeleting ? 'Purging...' : `Purge ${abandonedCount} Abandoned`}
            </button>
          )}
          {selectedRoomIds.size > 0 && (
            <button
              onClick={() => bulkDelete(false)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-3 bg-uno-red hover:bg-uno-red/80 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-uno-red/25"
            >
              <Trash2 size={16} />
              Delete {selectedRoomIds.size} Selected
            </button>
          )}
        </div>
      </div>

      {/* Delete Result Banner */}
      <AnimatePresence>
        {deleteResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-6 py-4 bg-uno-green/10 border border-uno-green/20 rounded-2xl text-uno-green font-bold text-sm"
          >
            <CheckSquare size={18} /> {deleteResult}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Rooms', value: rooms.length, icon: <Gamepad2 size={20} />, color: 'uno-red' },
          { label: 'Active Players', value: rooms.reduce((acc, r) => acc + r.playerCount, 0), icon: <Users size={20} />, color: 'uno-blue' },
          { label: 'In Match', value: rooms.filter(r => r.status === 'playing').length, icon: <Activity size={20} />, color: 'uno-green' },
          { label: 'Abandoned', value: abandonedCount, icon: <AlertTriangle size={20} />, color: 'uno-yellow' },
        ].map((stat, i) => (
          <div key={i} className="glass-dark p-5 rounded-3xl border border-white/5 flex items-center gap-4 shadow-xl">
            <div className={`p-3 rounded-2xl bg-${stat.color}/10 text-${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black italic">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search by room code, host name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-uno-red/50 transition-all text-white font-medium"
          />
        </div>
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
          {(['all', 'waiting', 'playing', 'abandoned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeFilter === f
                  ? f === 'abandoned' ? 'bg-uno-yellow text-black shadow-lg' : 'bg-uno-red text-white shadow-lg'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {f === 'abandoned' ? ` Abandoned (${abandonedCount})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-12 h-12 border-4 border-uno-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Connecting to game server...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-dark rounded-3xl border border-dashed border-white/10">
              <Gamepad2 size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">No rooms found</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`glass-dark rounded-3xl border overflow-hidden group transition-all shadow-xl relative ${
                  room.isStale
                    ? 'border-uno-yellow/30 hover:border-uno-yellow/50'
                    : selectedRoomIds.has(room.id)
                    ? 'border-uno-red/50'
                    : 'border-white/5 hover:border-uno-red/30'
                }`}
              >
                {/* Abandoned Badge - Adjusted to prevent overlap */}
                {room.isStale && (
                  <div className="absolute top-0 right-0 left-0 h-8 bg-uno-yellow/10 border-b border-uno-yellow/20 flex items-center justify-center gap-2">
                    <AlertTriangle size={12} className="text-uno-yellow animate-pulse" />
                    <span className="text-[10px] font-black text-uno-yellow uppercase tracking-widest">{room.staleReason}</span>
                  </div>
                )}

                <div className={`p-6 ${room.isStale ? 'pt-12' : ''}`}>
                  <div className="flex justify-between items-start mb-6">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(room.id)}
                      className="p-1 text-gray-600 hover:text-white transition-colors cursor-pointer flex-shrink-0 mt-1"
                    >
                      {selectedRoomIds.has(room.id)
                        ? <CheckSquare size={18} className="text-uno-red" />
                        : <Square size={18} />
                      }
                    </button>

                    <div className="flex items-center gap-3 flex-1 ml-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic border ${
                        room.status === 'playing'
                          ? 'bg-uno-green/20 border-uno-green/30 text-uno-green'
                          : 'bg-uno-blue/20 border-uno-blue/30 text-uno-blue'
                      }`}>
                        {room.roomCode?.[0] || '#'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-uno-red transition-colors">
                          #{room.roomCode || room.id.slice(0, 6)}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
                          {room.isPrivate ? 'Private' : 'Public'} · {room.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {room.isPrivate
                        ? <Lock size={14} className="text-uno-yellow" />
                        : <Globe size={14} className="text-uno-blue" />
                      }
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        room.status === 'playing' ? 'bg-uno-green/10 text-uno-green' : 'bg-uno-blue/10 text-uno-blue'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Users size={11} />
                        <span className="text-[10px] font-black uppercase">Players</span>
                      </div>
                      <p className="text-lg font-black italic">
                        {room.playerCount}<span className="text-gray-600 text-xs ml-1">/{room.maxPlayers}</span>
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock size={11} />
                        <span className="text-[10px] font-black uppercase">Host</span>
                      </div>
                      <p className="text-sm font-bold truncate">{room.hostName}</p>
                    </div>
                  </div>

                  {/* Created time */}
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">
                    Created {room.createdAt ? new Date(room.createdAt).toLocaleString() : 'Unknown'}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => openRoomDetails(room, e)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete room #${room.roomCode || room.id}?`)) {
                          try {
                            await deleteRoom(room);
                          } catch {
                            alert('Delete failed. Check permissions.');
                          }
                        }
                      }}
                      className="p-3 bg-uno-red/10 hover:bg-uno-red/20 text-uno-red rounded-xl transition-all cursor-pointer"
                      title="Delete Room"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Playing progress bar */}
                {room.status === 'playing' && (
                  <div className="h-1 w-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                      className="h-full bg-uno-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    />
                  </div>
                )}
                {/* Stale warning bar */}
                {room.isStale && (
                  <div className="h-1 w-full bg-uno-yellow/40" />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <RoomDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={selectedRoom}
      />
    </div>
  );
};

export default RoomsManagement;
