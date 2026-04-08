import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Gamepad2,  
  BarChart3, 
  Activity,
  Clock,
  Globe,
  Lock
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '../../firebase/config';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    liveRooms: 0,
    totalRoomCodes: 0,
    activePlayers: 0,
    waitingRooms: 0,
    playingRooms: 0,
    publicRooms: 0,
    privateRooms: 0,
  });

  // Per-room breakdown for bar chart
  const [roomSizes, setRoomSizes] = useState<{ code: string; players: number; status: string }[]>([]);

  useEffect(() => {
    // Firestore: total users
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        setStats(prev => ({ ...prev, totalUsers: snap.size }));
      } catch (e) {
        console.error('Error fetching users:', e);
      }
    };
    fetchUsers();

    // RTDB: rooms + roomCodes
    const roomsRef = ref(rtdb, 'rooms');
    const unsub1 = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data) as [string, any][];
        let actPlayers = 0, waiting = 0, playing = 0, pub = 0, priv = 0;
        const sizes: { code: string; players: number; status: string }[] = [];

        entries.forEach(([, v]: [string, any]) => {
          const info = v.info || {};
          const playerCount = v.players ? Object.keys(v.players).length : 0;
          actPlayers += playerCount;
          if (info.status === 'playing') playing++;
          else waiting++;
          if (info.isPublic) pub++;
          else priv++;
          sizes.push({
            code: info.roomCode || '???',
            players: playerCount,
            status: info.status || 'waiting',
          });
        });

        setStats(prev => ({
          ...prev,
          liveRooms: entries.length,
          activePlayers: actPlayers,
          waitingRooms: waiting,
          playingRooms: playing,
          publicRooms: pub,
          privateRooms: priv,
        }));
        setRoomSizes(sizes.sort((a, b) => b.players - a.players).slice(0, 12));
      } else {
        setStats(prev => ({ ...prev, liveRooms: 0, activePlayers: 0, waitingRooms: 0, playingRooms: 0, publicRooms: 0, privateRooms: 0 }));
        setRoomSizes([]);
      }
      setLoading(false);
    });

    const codesRef = ref(rtdb, 'roomCodes');
    const unsub2 = onValue(codesRef, (snapshot) => {
      const data = snapshot.val();
      setStats(prev => ({ ...prev, totalRoomCodes: data ? Object.keys(data).length : 0 }));
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  const maxPlayers = Math.max(...roomSizes.map(r => r.players), 1);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic">Platform <span className="text-uno-red">Analytics</span></h1>
        <p className="text-gray-500 font-medium">Real-time platform health from Firebase data.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {([
          { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: 'uno-blue' },
          { label: 'Live Rooms', value: stats.liveRooms, icon: <Gamepad2 size={22} />, color: 'uno-red' },
          { label: 'Active Players', value: stats.activePlayers, icon: <Activity size={22} />, color: 'uno-green' },
          { label: 'Room Codes', value: stats.totalRoomCodes, icon: <Clock size={22} />, color: 'uno-yellow' },
        ] as const).map((s, i) => (
          <div key={i} className="glass-dark p-6 rounded-3xl border border-white/5 shadow-xl">
            <div className={`p-3 bg-${s.color}/10 text-${s.color} rounded-2xl w-fit mb-4`}>{s.icon}</div>
            <h3 className="text-3xl font-black italic tracking-tight">{loading ? '...' : s.value.toLocaleString()}</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar chart: Players per Room */}
        <div className="lg:col-span-2 glass-dark p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-1">
              <BarChart3 className="text-uno-red" /> Players per Room
            </h2>
            <p className="text-gray-500 text-sm mb-8">Current player distribution across live rooms</p>

            {roomSizes.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-600 font-bold text-xs uppercase tracking-widest">
                No active rooms to display
              </div>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {roomSizes.map((room, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative h-full flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(room.players / maxPlayers) * 100}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8, ease: 'easeOut' }}
                        className={`w-full rounded-t-lg transition-all relative ${
                          room.status === 'playing'
                            ? 'bg-uno-green/60 group-hover:bg-uno-green/80'
                            : 'bg-white/10 group-hover:bg-white/20'
                        }`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-uno-dark text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {room.players}p
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">
                      {room.code.slice(-3)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-uno-red/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        </div>

        {/* Room Breakdown */}
        <div className="glass-dark p-8 rounded-[40px] border border-white/5 flex flex-col gap-8">
          <h2 className="text-xl font-bold italic">Room Breakdown</h2>

          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="text-gray-500">Waiting Rooms</span>
                <span className="text-uno-blue">{stats.waitingRooms}</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stats.liveRooms > 0 ? `${(stats.waitingRooms / stats.liveRooms) * 100}%` : '0%' }}
                  className="h-full bg-uno-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="text-gray-500">Playing Rooms</span>
                <span className="text-uno-green">{stats.playingRooms}</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stats.liveRooms > 0 ? `${(stats.playingRooms / stats.liveRooms) * 100}%` : '0%' }}
                  className="h-full bg-uno-green rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="text-gray-500 flex items-center gap-1"><Globe size={10} /> Public</span>
                <span className="text-white">{stats.publicRooms}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 mt-4">
                <span className="text-gray-500 flex items-center gap-1"><Lock size={10} /> Private</span>
                <span className="text-white">{stats.privateRooms}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
