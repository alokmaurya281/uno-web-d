import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Gamepad2, RefreshCw, Users } from 'lucide-react';
import { getOverview, type LiveRoom } from '../../services/adminApi';

interface AnalyticsOverview {
  users?: { total?: number; admins?: number; banned?: number };
  live?: { rooms?: number; waitingRooms?: number; playingRooms?: number; onlineUsers?: number; roomList?: LiveRoom[] };
  games?: { histories?: number };
  economy?: { coins?: number; totalScore?: number };
}

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getOverview();
      setOverview(response.overview as AnalyticsOverview);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const roomSizes = useMemo(() => (overview.live?.roomList || []).slice(0, 12), [overview.live?.roomList]);
  const maxPlayers = Math.max(...roomSizes.map((room) => Number(room.playerCount || 0)), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight">Platform <span className="text-uno-red">Analytics</span></h1>
          <p className="text-sm text-gray-500">Operational metrics from backend APIs.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/10">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Users', value: overview.users?.total, icon: <Users size={22} />, tone: 'text-uno-blue' },
          { label: 'Online Users', value: overview.live?.onlineUsers, icon: <Activity size={22} />, tone: 'text-uno-green' },
          { label: 'Live Rooms', value: overview.live?.rooms, icon: <Gamepad2 size={22} />, tone: 'text-uno-red' },
          { label: 'Game Records', value: overview.games?.histories, icon: <BarChart3 size={22} />, tone: 'text-uno-yellow' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className={item.tone}>{item.icon}</div>
            <div className="mt-4 text-3xl font-black italic">{Number(item.value || 0).toLocaleString()}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5 xl:col-span-2">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-black"><BarChart3 className="text-uno-red" /> Players Per Room</h2>
          <p className="mb-6 text-sm text-gray-500">Top live rooms by current player count.</p>
          <div className="flex h-56 items-end gap-2">
            {roomSizes.map((room) => (
              <div key={room.id} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end rounded bg-white/5">
                  <div
                    className={`w-full rounded ${room.status === 'playing' ? 'bg-uno-green/70' : 'bg-uno-blue/70'}`}
                    style={{ height: `${(Number(room.playerCount || 0) / maxPlayers) * 100}%` }}
                  />
                </div>
                <span className="max-w-full truncate text-[9px] font-black text-gray-500">{room.roomCode || room.id.slice(0, 4)}</span>
              </div>
            ))}
            {roomSizes.length === 0 && <div className="flex flex-1 items-center justify-center text-sm font-bold text-gray-500">No live room data.</div>}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-5 text-lg font-black">Room State</h2>
          <div className="space-y-5">
            <Metric label="Waiting" value={overview.live?.waitingRooms || 0} total={overview.live?.rooms || 0} color="bg-uno-blue" />
            <Metric label="Playing" value={overview.live?.playingRooms || 0} total={overview.live?.rooms || 0} color="bg-uno-green" />
            <Metric label="Admins" value={overview.users?.admins || 0} total={overview.users?.total || 0} color="bg-uno-red" />
            <Metric label="Banned" value={overview.users?.banned || 0} total={overview.users?.total || 0} color="bg-uno-yellow" />
          </div>
        </section>
      </div>
    </div>
  );
};

function Metric({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const width = total > 0 ? `${Math.min(100, (value / total) * 100)}%` : '0%';
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-bold text-gray-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded bg-white/5">
        <div className={`h-full rounded ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

export default Analytics;
