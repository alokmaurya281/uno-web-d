import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithEmail, registerWithEmail, loginWithGoogle, loginAsGuest } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Please provide a display name');
          setSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
      }
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginAsGuest();
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Guest sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#13161f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden font-['Outfit']"
        >
          {/* Ambient header glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-uno-red via-uno-yellow to-uno-blue rounded-full blur-xs" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Title and subtitle */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uno-yellow/10 text-uno-yellow text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Official UNO Account
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {tab === 'login' ? 'Welcome Back!' : 'Create Your Player Profile'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sync coins, Uno Pass tier, achievements, and multiplayer rank across web & mobile!
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl mb-6 border border-white/10">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login' ? 'bg-uno-yellow text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register' ? 'bg-uno-yellow text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={14} /> Register
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Player Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. MasterUno99"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uno-yellow/80 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uno-yellow/80 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uno-yellow/80 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-uno-yellow via-amber-400 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,204,0,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? 'Please wait...' : tab === 'login' ? 'Sign In & Play' : 'Create Free Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#13161f] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Or Instant Play
            </span>
          </div>

          {/* Social / Guest Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleGoogle}
              disabled={submitting}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.3 0 15.2c0 2.9.7 5.6 1.9 8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              Google
            </button>

            <button
              onClick={handleGuest}
              disabled={submitting}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <User size={14} className="text-uno-blue" /> Play as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
