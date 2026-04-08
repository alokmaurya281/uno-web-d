import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gamepad2, 
  Activity,
  Clock,
  Globe,
  Lock
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '../../firebase/config';

interface LiveRoom {
  id: string;
  roomCode: string;
  status: string;
  hostName: string;
  playerCount: number;
  isPublic: boolean;
  createdAt: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    players: 0,
    totalRoomCodes: 0,
    activeRooms: 0,
    activePlayers: 0
  });
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);

  useEffect(() => {
    // 1. Listen to Total Players (Firestore 'users' collection)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setCounts(prev => ({ ...prev, players: snapshot.size }));
    });

    // 2. Listen to Active Rooms + Live Rooms list (RTDB)
    const roomsRef = ref(rtdb, 'rooms');
    const unsubRooms = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data) as [string, any][];
        const roomsList: LiveRoom[] = entries.map(([key, value]) => {
          const info = value.info || {};
          const players = value.players || {};
          const playerList = Object.values(players) as any[];
          const host = playerList.find((p: any) => p.isHost) || playerList[0];
          return {
            id: key,
            roomCode: info.roomCode || key.slice(0, 6),
            status: info.status || 'waiting',
            hostName: host?.name || 'Unknown',
            playerCount: playerList.length,
            isPublic: !!info.isPublic,
            createdAt: info.createdAt || 0,
          };
        });
        
        const activePlayersCount = entries.reduce((acc, [, v]: [string, any]) => 
          acc + (v.players ? Object.keys(v.players).length : 0), 0);
        
        setCounts(prev => ({
          ...prev,
          activeRooms: roomsList.length,
          activePlayers: activePlayersCount,
        }));
        setLiveRooms(roomsList.slice(0, 8)); // Show latest 8
      } else {
        setCounts(prev => ({ ...prev, activeRooms: 0, activePlayers: 0 }));
        setLiveRooms([]);
      }
      setLoading(false);
    });

    // 3. Listen to total room codes (RTDB)
    const codesRef = ref(rtdb, 'roomCodes');
    const unsubCodes = onValue(codesRef, (snapshot) => {
      const data = snapshot.val();
      setCounts(prev => ({ ...prev, totalRoomCodes: data ? Object.keys(data).length : 0 }));
    });

    return () => {
      unsubUsers();
      unsubRooms();
      unsubCodes();
    };
  }, []);

  function timeAgo(ts: number): string {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="space-y-8 p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic">Admin <span className="text-uno-red">Overview</span></h1>
          <p className="text-gray-500 font-medium">Platform state as of {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-uno-red/10 border border-uno-red/20 rounded-xl">
          <div className="w-2 h-2 bg-uno-red rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-uno-red uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {/* Hero Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-dark rounded-3xl border border-uno-blue/20 p-6 flex items-center gap-5 shadow-xl shadow-uno-blue/5">
          <div className="w-14 h-14 rounded-2xl bg-uno-blue/20 flex items-center justify-center flex-shrink-0">
            <Users size={28} className="text-uno-blue" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-1">Users</p>
            <p className="text-3xl font-black italic tracking-tight">{loading ? '...' : counts.players.toLocaleString()}</p>
          </div>
        </div>
        <div className="glass-dark rounded-3xl border border-uno-red/20 p-6 flex items-center gap-5 shadow-xl shadow-uno-red/5">
          <div className="w-14 h-14 rounded-2xl bg-uno-red/20 flex items-center justify-center flex-shrink-0">
            <Gamepad2 size={28} className="text-uno-red" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-1">Live Rooms</p>
            <p className="text-3xl font-black italic tracking-tight">{loading ? '...' : counts.activeRooms}</p>
          </div>
        </div>
        <div className="glass-dark rounded-3xl border border-uno-green/20 p-6 flex items-center gap-5 shadow-xl shadow-uno-green/5">
          <div className="w-14 h-14 rounded-2xl bg-uno-green/20 flex items-center justify-center flex-shrink-0">
            <Activity size={28} className="text-uno-green" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-1">Active Players</p>
            <p className="text-3xl font-black italic tracking-tight">{loading ? '...' : counts.activePlayers}</p>
          </div>
        </div>
        <div className="glass-dark rounded-3xl border border-uno-yellow/20 p-6 flex items-center gap-5 shadow-xl shadow-uno-yellow/5">
          <div className="w-14 h-14 rounded-2xl bg-uno-yellow/20 flex items-center justify-center flex-shrink-0">
            <Clock size={28} className="text-uno-yellow" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-1">Room Codes</p>
            <p className="text-3xl font-black italic tracking-tight">{loading ? '...' : counts.totalRoomCodes}</p>
          </div>
        </div>
      </div>

      {/* Live Rooms Feed */}
      <div className="glass-dark rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-3 italic">
            <Activity size={20} className="text-uno-red" /> Live Rooms
          </h2>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{liveRooms.length} sessions</span>
        </div>

        <div className="space-y-4 relative z-10">
          {liveRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-600 font-bold text-xs uppercase tracking-widest">
              No active rooms right now
            </div>
          ) : (
            liveRooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-5 rounded-3xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/10 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-sm shadow-xl border ${
                    room.status === 'playing'
                      ? 'bg-uno-green/20 border-uno-green/30 text-uno-green'
                      : 'bg-uno-blue/20 border-uno-blue/30 text-uno-blue'
                  }`}>
                    #{room.roomCode.slice(-2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-uno-red transition-colors">
                      Room #{room.roomCode}
                    </p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      {room.hostName} · {room.playerCount} player{room.playerCount !== 1 ? 's' : ''} · {timeAgo(room.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {room.isPublic 
                    ? <Globe size={12} className="text-uno-blue" /> 
                    : <Lock size={12} className="text-uno-yellow" />
                  }
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    room.status === 'playing'
                      ? 'bg-uno-green/10 text-uno-green border-uno-green/20'
                      : 'bg-uno-blue/10 text-uno-blue border-uno-blue/20'
                  }`}>
                    {room.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 right-0 w-64 h-64 bg-uno-blue/5 rounded-full blur-[100px] -mr-32 -mb-32 pointer-events-none" />
      </div>
    </div>
  );
};

export default Dashboard;
