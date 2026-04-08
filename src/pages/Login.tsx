import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ShieldCheck, Mail, Lock, AlertCircle, Globe, Terminal, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { auth, db, rtdb } from '../firebase/config';
import { setUser } from '../store/slices/authSlice';
import type { RootState } from '../store';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warn';
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showConsole, setShowConsole] = useState(true); // Keep it open during troubleshooting
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useSelector((state: RootState) => state.auth);
  const isMounted = useRef(true);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [entry, ...prev].slice(0, 50));
    console.log(`[AUTH-DIAGNOSTIC] ${message}`);
  };

  useEffect(() => {
    addLog("Diagnostic console initialized.");
    addLog("Ready for Login. Popup mode enabled.");
    return () => { isMounted.current = false; };
  }, []);

  // Display error if user arrives authenticated but is not an admin
  useEffect(() => {
    if (user && !isAdmin && !isProcessing) {
      setError('Access Denied: Your account does not have administrative privileges.');
    }
  }, [user, isAdmin, isProcessing]);

  // Global Redirect if isAdmin becomes true
  useEffect(() => {
    if (isAdmin) {
      const target = (location.state as any)?.from?.pathname || '/admin';
      addLog(`ADMIN CONFIRMED. Attempting redirect to: ${target}`, 'success');
      
      // Use a small timeout to ensure Redux state is settled and logs are visible
      const timer = setTimeout(() => {
        navigate(target, { replace: true });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAdmin, navigate, location]);

  const verifyAdmin = async (uid: string, user: any) => {
    if (!isMounted.current) return;
    setIsProcessing(true);
    setError('');
    
    addLog(`STARTING VERIFICATION FOR UID: ${uid}`);
    addLog(`Email: ${user.email}`);

    // Collections to check in Firestore
    const firestoreCollections = ['users', 'Players', 'admins', 'Admin'];
    let adminFound = false;

    // 1. Try Firestore checks
    for (const colName of firestoreCollections) {
      addLog(`[Firestore] Querying '${colName}/${uid}'...`);
      try {
        const userDoc = await getDoc(doc(db, colName, uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          addLog(`[Firestore] DOC FOUND in '${colName}'!`, 'success');
          addLog(`[Firestore] isAdmin field value: ${data.isAdmin} (${typeof data.isAdmin})`);
          
          if (data.isAdmin === true || data.isAdmin === "true") {
            addLog("Admin validation passed (Firestore).", 'success');
            dispatch(setUser({ 
              user: { 
                uid: user.uid, 
                email: user.email, 
                displayName: user.displayName,
                photoURL: user.photoURL 
              }, 
              isAdmin: true 
            }));
            adminFound = true;
            break;
          }
        }
      } catch (err: any) {
        addLog(`[Firestore] Error: ${err.message}`, 'error');
      }
    }

    // 2. Try Realtime Database fallback if not found in Firestore
    if (!adminFound) {
      addLog("[RTDB] No admin found in Firestore. Checking Realtime DB fallbacks...");
      const rtdbPaths = ['users', 'Players', 'admins', 'Admins'];
      
      for (const path of rtdbPaths) {
        try {
          const rtdbRef = ref(rtdb, `${path}/${uid}`);
          addLog(`[RTDB] Querying '${path}/${uid}'...`);
          const snapshot = await get(rtdbRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            addLog(`[RTDB] DOC FOUND in '${path}'!`, 'success');
            addLog(`[RTDB] isAdmin field value: ${data.isAdmin} (${typeof data.isAdmin})`);
            
            if (data.isAdmin === true || data.isAdmin === "true") {
              addLog("Admin validation passed (RTDB).", 'success');
              dispatch(setUser({ 
                user: { 
                  uid, 
                  email: user.email, 
                  displayName: user.displayName,
                  photoURL: user.photoURL 
                }, 
                isAdmin: true 
              }));
              adminFound = true;
              break;
            }
          }
        } catch (err: any) {
          addLog(`[RTDB] Error checking '${path}': ${err.message}`, 'error');
        }
      }
    }

    if (!adminFound && isMounted.current) {
      setError('Access Denied: Administrative privileges not found.');
      addLog("All database checks failed.", 'error');
      await signOut(auth);
      dispatch(setUser({ user: null, isAdmin: false }));
      setIsProcessing(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    addLog(`Attempting Email Login: ${email}`);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      addLog("Email login success. Verifying role...", 'success');
      await verifyAdmin(userCredential.user.uid, userCredential.user);
    } catch (err: any) {
      if (isMounted.current) {
        setIsProcessing(false);
        addLog(`Login error: ${err.message}`, 'error');
        setError('Invalid admin email or password.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsProcessing(true);
    addLog("Opening Google Popup...");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      addLog(`Popup success: ${result.user.email}`, 'success');
      await verifyAdmin(result.user.uid, result.user);
    } catch (err: any) {
      if (isMounted.current) {
        setIsProcessing(false);
        addLog(`Popup error: ${err.message}`, 'error');
        setError('Google login failed or cancelled.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-uno-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-uno-red/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-uno-blue/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-uno-red/10 rounded-2xl mb-6 border border-uno-red/20 shadow-xl shadow-uno-red/5">
            <ShieldCheck size={48} className="text-uno-red" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Admin <span className="text-uno-red">Gateway</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Identify to access administrative tools</p>
        </div>

        <div className="glass-dark p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-uno-dark/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
               <div className="w-12 h-12 border-4 border-uno-red border-t-transparent rounded-full animate-spin" />
               <p className="text-white font-black italic tracking-widest text-xs uppercase animate-pulse">
                Verifying Access...
               </p>
            </div>
          )}

          <div className="space-y-6">
            <motion.button 
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all border border-gray-200"
            >
              <Globe size={20} className="text-uno-blue" />
              SIGN IN WITH GOOGLE
            </motion.button>

            <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] bg-white/10 flex-1" />
                <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">OR EMAIL</span>
                <div className="h-[1px] bg-white/10 flex-1" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1 text-left text-gray-400">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all text-white font-medium"
                    placeholder="name@unogame.app"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1 text-left text-gray-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-uno-red/50 focus:ring-4 focus:ring-uno-red/5 transition-all text-white font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-uno-red/10 border border-uno-red/20 rounded-xl p-4 flex items-center gap-3 text-uno-red text-xs font-bold"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full bg-uno-red text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all border border-uno-red/50 mt-4"
              >
                <LogIn size={20} />
                ADMIN LOGIN
              </motion.button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-[10px] font-black tracking-widest uppercase mb-4">
          Restricted Access Zone
        </div>

        {/* Diagnostic Toggle */}
        <button 
          onClick={() => setShowConsole(!showConsole)}
          className="flex items-center gap-2 mx-auto text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors py-2"
        >
          <Terminal size={14} />
          {showConsole ? "Hide Diagnostics" : "Show Diagnostics"}
          {showConsole ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* UI Diagnostic Console */}
        <AnimatePresence>
          {showConsole && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 bg-black/80 rounded-2xl border border-white/10 p-4 font-mono text-[10px] overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="text-uno-red font-bold flex items-center gap-2 uppercase tracking-widest">
                  <Terminal size={12} /> Live Trace
                </span>
                <button onClick={() => setLogs([])} className="text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                  <RefreshCw size={10} /> RESET
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
                {logs.length === 0 ? (
                  <p className="text-gray-600 italic">No logs recorded yet...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                      <span className={
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'success' ? 'text-green-400' : 
                        log.type === 'warn' ? 'text-yellow-400' : 
                        'text-gray-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
