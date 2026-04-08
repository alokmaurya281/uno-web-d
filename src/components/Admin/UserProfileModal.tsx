import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  UserX, 
  Mail, 
  Calendar, 
  Trophy, 
  Gamepad2, 
  ExternalLink
} from 'lucide-react';

interface UserProfileModalProps {
  user: {
    uid: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    isAdmin?: boolean;
    isBanned?: boolean;
    gamesPlayed?: number;
    totalScore?: number;
    createdAt?: any;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  // Parse real createdAt (could be Firestore Timestamp or epoch)
  const getRegisteredDate = () => {
    if (!user.createdAt) return '—';
    if (user.createdAt?.toDate) return user.createdAt.toDate().toLocaleDateString();
    if (typeof user.createdAt === 'number') return new Date(user.createdAt).toLocaleDateString();
    if (typeof user.createdAt === 'string') return new Date(user.createdAt).toLocaleDateString();
    return '—';
  };

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
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black italic text-uno-red">{user.name?.[0] || 'U'}</span>
                    )}
                  </div>
                </div>
                {user.isAdmin && (
                  <div className="absolute -bottom-2 -right-2 bg-uno-red text-white p-2 rounded-2xl shadow-xl border-4 border-uno-dark">
                    <Shield size={18} />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black italic text-white mb-1 uppercase tracking-tighter">{user.name || 'Anonymous'}</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Mail size={12} /> {user.email || 'No email associated'}
              </p>

              <div className="w-full space-y-3 pt-6 border-t border-white/5">
                <button className="w-full py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <ExternalLink size={14} /> View in Firebase
                </button>
                <button className={`w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    user.isBanned ? 'bg-uno-green/10 text-uno-green hover:bg-uno-green/20' : 'bg-uno-red/10 text-uno-red hover:bg-uno-red/20'
                }`}>
                  <UserX size={14} /> {user.isBanned ? 'Unban Player' : 'Ban Player'}
                </button>
              </div>

              <p className="mt-auto pt-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                UID: {user.uid.slice(0, 12)}...
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
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity"><Gamepad2 className="text-uno-red" /></div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Matches</p>
                  <p className="text-2xl font-black italic">{user.gamesPlayed ?? '—'}</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity"><Trophy className="text-uno-yellow" /></div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Global Score</p>
                  <p className="text-2xl font-black italic">{user.totalScore ?? '—'}</p>
                </div>
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
                        {user.isAdmin ? 'Admin' : 'Player'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                    <UserX size={16} className="text-gray-500" />
                    <div>
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.1em]">Ban Status</p>
                      <p className={`text-sm font-bold ${user.isBanned ? 'text-uno-red' : 'text-uno-green'}`}>
                        {user.isBanned ? 'Banned' : 'Clean'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full UID */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Full UID</p>
                <p className="text-xs font-mono text-gray-400 bg-white/5 p-4 rounded-2xl break-all border border-white/5">{user.uid}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;
