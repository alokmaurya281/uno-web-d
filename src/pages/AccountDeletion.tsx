import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { createAccountDeletionRequest } from '../services/adminApi';
import { auth } from '../firebase/config';

const AccountDeletion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setVerifiedUser(user);
      if (user?.email) setEmail((current) => current || user.email || '');
    });
  }, []);

  const emailMatches = useMemo(() => {
    if (!verifiedUser?.email) return false;
    return verifiedUser.email.toLowerCase() === email.trim().toLowerCase();
  }, [email, verifiedUser]);

  const canSubmit = Boolean(
    verifiedUser?.emailVerified === true
    && emailMatches
    && email.trim()
    && !submitting
  );

  const verifyWithFirebase = async () => {
    setVerifying(true);
    setMessage('');
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setVerifiedUser(result.user);
      if (result.user.email) setEmail(result.user.email);
      setMessage(
        result.user.emailVerified
          ? 'Firebase email verified. You can submit the deletion request now.'
          : 'Firebase sign-in complete. Please verify your email before submitting.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Firebase verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const sendVerification = async () => {
    if (!verifiedUser) return;
    setVerifying(true);
    setMessage('');
    setError('');
    try {
      await sendEmailVerification(verifiedUser);
      setMessage('Verification email sent. Open it, then refresh verification here.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification email.');
    } finally {
      setVerifying(false);
    }
  };

  const refreshVerification = async () => {
    if (!verifiedUser) return;
    setVerifying(true);
    setMessage('');
    setError('');
    try {
      await reload(verifiedUser);
      setVerifiedUser(auth.currentUser);
      setMessage(auth.currentUser?.emailVerified ? 'Email verified.' : 'Email is still not verified.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh Firebase verification.');
    } finally {
      setVerifying(false);
    }
  };

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!verifiedUser) {
      setError('Verify with Firebase before requesting account deletion.');
      return;
    }
    if (!verifiedUser.emailVerified) {
      setError('Please verify your Firebase email before submitting.');
      return;
    }
    if (!emailMatches) {
      setError('Form email must match your verified Firebase email.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await createAccountDeletionRequest({
        email: email.trim(),
        uid: uid.trim() || undefined,
        reason: reason.trim() || undefined,
      });
      setEmail('');
      setUid('');
      setReason('');
      setMessage('Account deletion request submitted. Admin will review and delete the matching user account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit account deletion request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Link 
        to="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-uno-red transition-colors font-medium text-sm"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[600px] w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/[0.03] border border-gray-100"
      >
        <div className="w-16 h-16 bg-red-50 text-uno-red rounded-2xl flex items-center justify-center mb-8 mx-auto">
          <Trash2 size={32} />
        </div>

        <h1 className="text-3xl font-black text-center text-gray-900 mb-4 tracking-tight">
          Account Deletion Request
        </h1>

        <p className="text-gray-500 text-center mb-10 leading-relaxed font-medium">
          If you want to delete your account and all associated data from our app, please submit the request below. We will process your request within 7 days.
        </p>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black text-gray-900">
                <ShieldCheck size={18} className="text-uno-red" />
                Firebase email verification
              </p>
              <p className="mt-1 text-xs font-bold text-gray-500">
                {verifiedUser?.email
                  ? `${verifiedUser.email} · ${verifiedUser.emailVerified ? 'verified' : 'not verified'}`
                  : 'Sign in with the same email before sending this request.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void verifyWithFirebase()}
              disabled={verifying}
              className="rounded-xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900 shadow-sm transition hover:text-uno-red disabled:opacity-60"
            >
              Verify with Firebase
            </button>
          </div>
          {verifiedUser && !verifiedUser.emailVerified && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void sendVerification()} disabled={verifying} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-60">
                Send verification email
              </button>
              <button type="button" onClick={() => void refreshVerification()} disabled={verifying} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-60">
                Refresh verification
              </button>
            </div>
          )}
          {verifiedUser && (
            <button type="button" onClick={() => void signOut(auth)} className="mt-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-uno-red">
              Use another email
            </button>
          )}
        </div>

        <form onSubmit={(event) => void submitRequest(event)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Your Email</label>
            <input 
              type="email" 
              name="email" 
            value={email}
            onChange={(event) => setEmail(event.target.value)}
              required 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">User ID (optional)</label>
            <input 
              type="text" 
              name="uid"
              value={uid}
              onChange={(event) => setUid(event.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all"
              placeholder="e.g. A7X9-2911"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Reason (optional)</label>
            <textarea 
              name="reason" 
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all resize-none"
              placeholder="Tell us why you're leaving..."
            />
          </div>

          {message && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-uno-red">
              {error}
            </div>
          )}

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={!canSubmit}
            className="w-full bg-[#0e0c0a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-uno-red transition-all shadow-lg shadow-black/10 disabled:opacity-60"
          >
            <Send size={18} />
            {submitting ? 'SUBMITTING...' : 'REQUEST ACCOUNT DELETION'}
          </motion.button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest leading-loose">
                Data removal complies with GDPR & COPPA regulations. <br />
                Process time: <strong>7 Business Days</strong>.
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountDeletion;
