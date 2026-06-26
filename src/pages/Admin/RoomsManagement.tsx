import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Clock, Gamepad2, Lock, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import { cleanupInactiveRooms, closeRoom, getLiveRooms, bulkCloseRooms, type LiveRoom } from '../../services/adminApi';
import RoomDetailsModal from '../../components/Admin/RoomDetailsModal';

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

const RoomsManagement: React.FC = () => {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<LiveRoom | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getLiveRooms();
      setRooms(response.live.roomList || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredRooms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rooms.filter((room) => !term || room.roomCode.toLowerCase().includes(term) || room.hostName.toLowerCase().includes(term) || room.id.toLowerCase().includes(term));
  }, [rooms, search]);

  const inactiveRooms = useMemo(() => {
    const cutoff = Date.now() - FOUR_HOURS_MS;
    return rooms.filter((room) => {
      const lastActivity = Number(room.updatedAt || room.createdAt || 0);
      return lastActivity > 0 && lastActivity < cutoff;
    });
  }, [rooms]);

  const deleteRoom = async (room: LiveRoom) => {
    await closeRoom(room.id);
    await load();
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredRooms.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRooms.map((r) => r.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to close the ${selectedIds.size} selected room(s)?`)) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const idsArray = Array.from(selectedIds);
      const result = await bulkCloseRooms(idsArray);
      setMessage(`Successfully closed ${result.closedCount} room(s).`);
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete selected rooms.');
    } finally {
      setLoading(false);
    }
  };

  const cleanInactiveRooms = async () => {
    setCleaning(true);
    setError('');
    setMessage('');
    try {
      const result = await cleanupInactiveRooms();
      setMessage(`Removed ${result.removedCount} inactive room${result.removedCount === 1 ? '' : 's'} from Redis.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clean inactive rooms.');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight">Live <span className="text-uno-red">Rooms</span></h1>
          <p className="text-sm text-gray-500">Monitor and close Socket.IO rooms through backend admin APIs.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => void cleanInactiveRooms()} disabled={cleaning} className="inline-flex items-center gap-2 rounded-lg bg-uno-red/15 px-4 py-3 text-xs font-black uppercase tracking-widest text-uno-red hover:bg-uno-red/25 disabled:opacity-50">
            <Clock size={16} className={cleaning ? 'animate-spin' : ''} /> Clean 4h Inactive
          </button>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/10">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <Gamepad2 className="mb-3 text-uno-red" size={22} />
          <div className="text-2xl font-black">{rooms.length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Rooms</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <Users className="mb-3 text-uno-blue" size={22} />
          <div className="text-2xl font-black">{rooms.reduce((sum, room) => sum + Number(room.playerCount || 0), 0)}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Players</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <Activity className="mb-3 text-uno-green" size={22} />
          <div className="text-2xl font-black">{rooms.filter((room) => room.status === 'playing').length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">In Match</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <Clock className="mb-3 text-uno-yellow" size={22} />
          <div className="text-2xl font-black">{inactiveRooms.length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">4h Inactive</div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedIds(new Set());
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 outline-none focus:border-uno-red/60 text-white placeholder-gray-500"
            placeholder="Search room code, host, or room id"
          />
        </div>
        
        {filteredRooms.length > 0 && (
          <div className="flex items-center gap-4 self-end md:self-auto select-none">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredRooms.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-uno-red focus:ring-uno-red/60 cursor-pointer accent-uno-red"
              />
              Select All
            </label>
            
            {selectedIds.size > 0 && (
              <button
                onClick={() => void deleteSelected()}
                className="inline-flex items-center gap-2 rounded-lg bg-uno-red/20 border border-uno-red/30 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-uno-red hover:bg-uno-red/30"
              >
                <Trash2 size={14} /> Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="rounded-lg border border-uno-red/30 bg-uno-red/10 px-4 py-3 text-sm font-bold text-uno-red">{error}</div>}
      {message && <div className="rounded-lg border border-uno-green/30 bg-uno-green/10 px-4 py-3 text-sm font-bold text-uno-green">{message}</div>}

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredRooms.map((room) => (
          <div key={room.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-5 flex gap-4 items-start">
            <div className="pt-1.5 shrink-0 select-none">
              <input
                type="checkbox"
                checked={selectedIds.has(room.id)}
                onChange={() => handleSelectToggle(room.id)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-uno-red focus:ring-uno-red/60 cursor-pointer accent-uno-red"
              />
            </div>
            
            <div className="flex-1 flex items-start justify-between gap-4">
              <button onClick={() => setSelectedRoom(room)} className="min-w-0 w-full text-left">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-uno-red/10 px-2 py-1 text-xs font-black text-uno-red">#{room.roomCode || room.id.slice(0, 6)}</span>
                  <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-black uppercase text-gray-300">{room.status}</span>
                  {inactiveRooms.some((r) => r.id === room.id) && (
                    <span className="rounded bg-uno-yellow/10 px-2 py-1 text-[10px] font-black uppercase text-uno-yellow">Inactive</span>
                  )}
                  {!room.isPublic && <Lock size={14} className="text-uno-yellow" />}
                </div>
                <p className="mt-3 truncate font-bold text-white">Host: {room.hostName || 'Unknown host'}</p>
                <p className="text-xs text-gray-500">{room.playerCount}/{room.maxPlayers} players · {room.id}</p>
                
                {room.players && room.players.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Roster:</span>
                    {room.players.map((p, idx) => (
                      <span key={p.id || idx} className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        p.isHost ? 'bg-uno-red/25 text-uno-red border border-uno-red/35' : 'bg-white/5 text-gray-300'
                      }`}>
                        {p.name}
                        {p.isBot && <span className="text-[8px] bg-uno-yellow/20 text-uno-yellow px-1 rounded-sm">BOT</span>}
                      </span>
                    ))}
                  </div>
                )}
              </button>
              <button onClick={() => void deleteRoom(room)} className="rounded-lg bg-uno-red/10 p-2 text-uno-red hover:bg-uno-red/20 shrink-0" title="Close room">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
        {filteredRooms.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-10 text-center text-sm font-bold text-gray-500">
            {loading ? 'Loading rooms...' : 'No live rooms found.'}
          </div>
        )}
      </div>

      <RoomDetailsModal
        isOpen={selectedRoom != null}
        onClose={() => setSelectedRoom(null)}
        room={selectedRoom ? {
          id: selectedRoom.id,
          name: `Room ${selectedRoom.roomCode || selectedRoom.id.slice(0, 6)}`,
          hostName: selectedRoom.hostName,
          playerCount: selectedRoom.playerCount,
          maxPlayers: selectedRoom.maxPlayers,
          status: selectedRoom.status,
          isPrivate: !selectedRoom.isPublic,
          createdAt: Number(selectedRoom.createdAt || 0),
          gameMode: 'Socket',
          players: selectedRoom.players || [],
        } : null}
      />
    </div>
  );
};

export default RoomsManagement;
