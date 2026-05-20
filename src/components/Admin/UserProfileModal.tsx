import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  UserX, 
  Mail, 
  Calendar, 
  Trophy, 
  Gamepad2, 
  ExternalLink,
  Coins,
  PackageCheck,
  Clock,
  Activity
} from 'lucide-react';
import { getUserDetail, type AdminUserDetail } from '../../services/adminApi';

interface UserProfileModalProps {
  user: {
    uid: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    isAdmin?: boolean;
    isBanned?: boolean;
    coins?: number;
    wins?: number;
    hasUnoPass?: boolean;
    gamesPlayed?: number;
    totalScore?: number;
    createdAt?: unknown;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    if (!isOpen || !user?.uid) return;
    let cancelled = false;

    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError('');
      try {
        const response = await getUserDetail(user.uid);
        if (!cancelled) setDetail(response);
      } catch (err) {
        if (!cancelled) setDetailError(err instanceof Error ? err.message : 'Failed to load user detail.');
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    void loadDetail();
    return () => { cancelled = true; };
  }, [isOpen, user?.uid]);

  if (!user) return null;

  const fullUser = detail?.user || user;
  const coinHistory = detail?.coinHistory || [];
  const ownedItems = detail?.ownedItems || [];
  const limits = detail?.limits || [];
  const gameHistory = detail?.gameHistory || [];

  // Parse real createdAt (could be Firestore Timestamp or epoch)
  const getRegisteredDate = () => {
    const value = fullUser.createdAt;
    if (!value) return '—';
    if (typeof value === 'object' && value != null && 'toDate' in value && typeof value.toDate === 'function') return value.toDate().toLocaleDateString();
    if (typeof value === 'number') return new Date(value).toLocaleDateString();
    if (typeof value === 'string') return new Date(value).toLocaleDateString();
    return '—';
  };

  const formatDate = (value: unknown) => {
    if (!value) return '—';
    if (typeof value === 'object' && value != null && 'toDate' in value && typeof value.toDate === 'function') return value.toDate().toLocaleString();
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  const textValue = (entry: Record<string, unknown>, keys: string[], fallback = '—') => {
    for (const key of keys) {
      const value = entry[key];
      if (value != null && value !== '') return String(value);
    }
    return fallback;
  };

  const numberValue = (value: unknown) => Number(value || 0).toLocaleString();

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
            {/* Left Sidebar - Identity */}
            <div className="w-full md:w-80 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-uno-red to-uno-accent p-[3px] shadow-2xl rotate-3">
                  <div className="w-full h-full rounded-[38px] bg-uno-dark overflow-hidden flex items-center justify-center border border-white/10">
                    {fullUser.avatarUrl ? (
                      <img src={fullUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black italic text-uno-red">{fullUser.name?.[0] || 'U'}</span>
                    )}
                  </div>
                </div>
                {fullUser.isAdmin && (
                  <div className="absolute -bottom-2 -right-2 bg-uno-red text-white p-2 rounded-2xl shadow-xl border-4 border-uno-dark">
                    <Shield size={18} />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black italic text-white mb-1 uppercase tracking-tighter">{fullUser.name || 'Anonymous'}</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Mail size={12} /> {fullUser.email || 'No email associated'}
              </p>

              <div className="w-full space-y-3 pt-6 border-t border-white/5">
                <button className="w-full py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <ExternalLink size={14} /> View in Firebase
                </button>
                <button className={`w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    fullUser.isBanned ? 'bg-uno-green/10 text-uno-green hover:bg-uno-green/20' : 'bg-uno-red/10 text-uno-red hover:bg-uno-red/20'
                }`}>
                  <UserX size={14} /> {fullUser.isBanned ? 'Unban Player' : 'Ban Player'}
                </button>
              </div>

              <p className="mt-auto pt-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                UID: {fullUser.uid.slice(0, 12)}...
              </p>
            </div>

            {/* Right Content - Stats */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-2">Player Data</h3>
                    <h4 className="text-3xl font-black italic uppercase">Account <span className="text-uno-red">Details</span></h4>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Stats Grid - real data only */}
              <div className="grid grid-cols-2 gap-4 mb-8 xl:grid-cols-4">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity"><Gamepad2 className="text-uno-red" /></div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Matches</p>
                  <p className="text-2xl font-black italic">{fullUser.gamesPlayed ?? '—'}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity"><Trophy className="text-uno-yellow" /></div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Global Score</p>
                  <p className="text-2xl font-black italic">{fullUser.totalScore ?? '—'}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity"><Coins className="text-uno-yellow" /></div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Coins</p>
                  <p className="text-2xl font-black italic">{numberValue(fullUser.coins)}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity"><PackageCheck className="text-uno-green" /></div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Inventory</p>
                  <p className="text-2xl font-black italic">{ownedItems.length}</p>
                </div>
              </div>

              {detailLoading && <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-gray-400">Loading account detail...</div>}
              {detailError && <div className="mb-6 rounded-2xl border border-uno-red/30 bg-uno-red/10 p-4 text-sm font-bold text-uno-red">{detailError}</div>}

              <div className="mb-8 grid gap-5 xl:grid-cols-2">
                <DetailPanel title="Coin History" icon={<Coins size={16} className="text-uno-yellow" />} empty="No coin events found.">
                  {coinHistory.slice(0, 8).map((entry, index) => (
                    <div key={`${textValue(entry, ['id', 'firestoreId'], String(index))}-${index}`} className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-white">{textValue(entry, ['type', 'reason', 'source'], 'coin event')}</p>
                        <p className="text-xs text-gray-500">{formatDate(entry.timestamp || entry.createdAt)}</p>
                      </div>
                      <span className={`text-sm font-black ${Number(entry.amount || 0) >= 0 ? 'text-uno-green' : 'text-uno-red'}`}>{numberValue(entry.amount)}</span>
                    </div>
                  ))}
                </DetailPanel>

                <DetailPanel title="Inventory" icon={<PackageCheck size={16} className="text-uno-green" />} empty="No owned items found.">
                  {ownedItems.slice(0, 8).map((entry, index) => (
                    <div key={`${textValue(entry, ['itemId', 'id', 'firestoreId'], String(index))}-${index}`} className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-white">{textValue(entry, ['itemId', 'id'], 'item')}</p>
                        <p className="text-xs text-gray-500">{textValue(entry, ['purchaseType', 'category'], 'owned')}</p>
                      </div>
                      {entry.isEquipped === true && <span className="rounded bg-uno-blue/10 px-2 py-1 text-[10px] font-black uppercase text-uno-blue">Equipped</span>}
                    </div>
                  ))}
                </DetailPanel>

                <DetailPanel title="Daily Limits" icon={<Clock size={16} className="text-uno-blue" />} empty="No daily limit records found.">
                  {limits.slice(0, 8).map((entry, index) => (
                    <div key={`${textValue(entry, ['type', 'id'], String(index))}-${index}`} className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-white">{textValue(entry, ['type'], 'limit')}</p>
                        <p className="text-xs text-gray-500">{textValue(entry, ['lastMatchDate', 'date'], 'today')}</p>
                      </div>
                      <span className="text-sm font-black text-white">{numberValue(entry.matchesPlayed)} played</span>
                    </div>
                  ))}
                </DetailPanel>

                <DetailPanel title="Match History" icon={<Activity size={16} className="text-uno-red" />} empty="No match history found.">
                  {gameHistory.slice(0, 8).map((entry, index) => (
                    <div key={`${textValue(entry, ['id', 'gameId', 'firestoreId'], String(index))}-${index}`} className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-white">{textValue(entry, ['mode', 'gameMode', 'result'], 'match')}</p>
                        <p className="text-xs text-gray-500">{formatDate(entry.playedAt || entry.date || entry.createdAt)}</p>
                      </div>
                      <span className="text-sm font-black text-uno-yellow">{numberValue(entry.score || entry.points)}</span>
                    </div>
                  ))}
                </DetailPanel>
              </div>

              {/* Account Info */}
              <div className="pt-8 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6">Account Info</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.1em]">Registered</p>
                      <p className="text-sm font-bold">{getRegisteredDate()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                    <Shield size={16} className="text-gray-500" />
                    <div>
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.1em]">Role</p>
                      <p className={`text-sm font-bold ${user.isAdmin ? 'text-uno-red' : 'text-uno-green'}`}>
                        {fullUser.isAdmin ? 'Admin' : 'Player'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                    <UserX size={16} className="text-gray-500" />
                    <div>
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.1em]">Ban Status</p>
                      <p className={`text-sm font-bold ${fullUser.isBanned ? 'text-uno-red' : 'text-uno-green'}`}>
                        {fullUser.isBanned ? 'Banned' : 'Clean'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full UID */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Full UID</p>
                <p className="text-xs font-mono text-gray-400 bg-white/5 p-4 rounded-2xl break-all border border-white/5">{fullUser.uid}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function DetailPanel({ title, icon, empty, children }: { title: string; icon: React.ReactNode; empty: string; children: React.ReactNode[] }) {
  const hasRows = React.Children.count(children) > 0;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-300">{icon} {title}</h3>
      <div className="max-h-72 overflow-y-auto">
        {hasRows ? children : <p className="py-6 text-center text-sm font-bold text-gray-500">{empty}</p>}
      </div>
    </section>
  );
}

export default UserProfileModal;
