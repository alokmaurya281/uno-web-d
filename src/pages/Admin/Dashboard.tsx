import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, Coins, Database, Gamepad2, PackageCheck, RefreshCw, Shield, ShoppingBag, Trophy, Users, Zap } from 'lucide-react';
import { getOverview, type AdminUser } from '../../services/adminApi';

interface Overview {
  users?: { total?: number; admins?: number; banned?: number };
  games?: { histories?: number };
  economy?: { coins?: number; totalScore?: number };
  live?: { rooms?: number; onlineUsers?: number; sockets?: number; waitingRooms?: number; playingRooms?: number };
  domainCounts?: Record<string, number>;
  recentUsers?: AdminUser[];
}

const numberText = (value: unknown) => Number(value || 0).toLocaleString();

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<Overview>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOverview();
      setOverview(response.overview as Overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const cards = useMemo(() => [
    { label: 'Players', value: overview.users?.total, icon: <Users size={22} />, tone: 'text-uno-blue' },
    { label: 'Live Rooms', value: overview.live?.rooms, icon: <Gamepad2 size={22} />, tone: 'text-uno-red' },
    { label: 'Online Users', value: overview.live?.onlineUsers, icon: <Activity size={22} />, tone: 'text-uno-green' },
    { label: 'Coin Supply', value: overview.economy?.coins, icon: <Coins size={22} />, tone: 'text-uno-yellow' },
  ], [overview]);

  const dataCoverage = useMemo(() => [
    { label: 'Store Items', key: 'store_items', icon: <ShoppingBag size={18} />, tone: 'text-uno-red' },
    { label: 'Achievements', key: 'achievements', icon: <Trophy size={18} />, tone: 'text-uno-yellow' },
    { label: 'Badges', key: 'badges', icon: <Shield size={18} />, tone: 'text-uno-blue' },
    { label: 'Card Skins', key: 'card_skins', icon: <PackageCheck size={18} />, tone: 'text-uno-green' },
    { label: 'Titles', key: 'titles', icon: <Users size={18} />, tone: 'text-white' },
    { label: 'Fragments', key: 'fragments', icon: <Database size={18} />, tone: 'text-gray-300' },
  ], []);

  const operations = useMemo(() => [
    { label: 'Coin Ledger', value: overview.domainCounts?.coin_transactions, detail: 'wallet audit events', icon: <Coins size={18} />, tone: 'text-uno-yellow' },
    { label: 'Quick Limits', value: overview.domainCounts?.quick_match_limits, detail: 'quick match limit docs', icon: <Zap size={18} />, tone: 'text-uno-blue' },
    { label: 'Solo Limits', value: overview.domainCounts?.solo_match_limits, detail: 'solo play limit docs', icon: <Gamepad2 size={18} />, tone: 'text-uno-green' },
    { label: 'IAP Attempts', value: overview.domainCounts?.iap_purchase_attempts, detail: 'purchase attempt records', icon: <ShoppingBag size={18} />, tone: 'text-uno-red' },
    { label: 'UNO Pass XP', value: overview.domainCounts?.pass_xp_events, detail: 'pass progress events', icon: <Trophy size={18} />, tone: 'text-uno-yellow' },
    { label: 'Notifications', value: overview.domainCounts?.notification_requests, detail: 'admin notification requests', icon: <Bell size={18} />, tone: 'text-uno-blue' },
  ], [overview.domainCounts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight">Admin <span className="text-uno-red">Overview</span></h1>
          <p className="text-sm text-gray-500">Backend API snapshot from MongoDB, Socket.IO, and Redis.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-uno-red/30 bg-uno-red/10 px-4 py-3 text-sm font-bold text-uno-red">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className={`mb-4 ${card.tone}`}>{card.icon}</div>
            <div className="text-3xl font-black italic">{loading ? '...' : numberText(card.value)}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">Recent Users</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{overview.recentUsers?.length || 0} records</span>
          </div>
          <div className="divide-y divide-white/5">
            {(overview.recentUsers || []).map((user) => (
              <div key={user.uid} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-bold text-white">{user.name || 'Player'}</p>
                  <p className="text-xs text-gray-500">{user.email || user.uid}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.isAdmin && <span className="rounded bg-uno-blue/10 px-2 py-1 text-[10px] font-black uppercase text-uno-blue">Admin</span>}
                  {user.isBanned && <span className="rounded bg-uno-red/10 px-2 py-1 text-[10px] font-black uppercase text-uno-red">Banned</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-5 text-lg font-black">Controls Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Admins</span>
              <span className="font-black">{numberText(overview.users?.admins)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Banned users</span>
              <span className="font-black">{numberText(overview.users?.banned)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Game histories</span>
              <span className="font-black">{numberText(overview.games?.histories)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-uno-green/20 bg-uno-green/10 p-3 text-uno-green">
              <Shield size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Admin API Protected</span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Data Coverage</h2>
              <p className="text-xs text-gray-500">Migrated catalog and reward documents in MongoDB.</p>
            </div>
            <Database className="text-gray-500" size={20} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {dataCoverage.map((item) => (
              <div key={item.key} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className={`mb-3 ${item.tone}`}>{item.icon}</div>
                <div className="text-2xl font-black italic">{loading ? '...' : numberText(overview.domainCounts?.[item.key])}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Economy Operations</h2>
              <p className="text-xs text-gray-500">Mutable systems that affect players, purchases, rewards, and limits.</p>
            </div>
            <Coins className="text-uno-yellow" size={20} />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {operations.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className={`mb-3 ${item.tone}`}>{item.icon}</div>
                <div className="text-2xl font-black italic">{loading ? '...' : numberText(item.value)}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</div>
                <p className="mt-2 text-xs text-gray-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
