import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { auth, db, rtdb } from './firebase/config';
import { setUser, setLoading, logout } from './store/slices/authSlice';
import Home from './pages/Home';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AccountDeletion from './pages/AccountDeletion';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import UsersManagement from './pages/Admin/UsersManagement';
import RoomsManagement from './pages/Admin/RoomsManagement';
import Analytics from './pages/Admin/Analytics';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          let isAdminConfirmed = false;
          
          // 1. Try Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data()?.isAdmin === true) {
            isAdminConfirmed = true;
          }

          // 2. Try RTDB Fallback
          if (!isAdminConfirmed) {
            const rtdbRef = ref(rtdb, `users/${user.uid}`);
            const snapshot = await get(rtdbRef);
            if (snapshot.exists() && snapshot.val().isAdmin === true) {
              isAdminConfirmed = true;
            }
          }

          dispatch(setUser({ 
            user: { 
              uid: user.uid, 
              email: user.email, 
              displayName: user.displayName,
              photoURL: user.photoURL
            }, 
            isAdmin: isAdminConfirmed 
          }));
        } catch (err) {
          console.error("Auth persistence error:", err);
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/uno-delete" element={<AccountDeletion />} />
        <Route path="/admin-login" element={<Login />} />
        
        {/* Admin Routes - Protected */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="rooms" element={<RoomsManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-3xl font-black">Settings</h1><p className="text-gray-500 mt-2">Coming Soon...</p></div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
