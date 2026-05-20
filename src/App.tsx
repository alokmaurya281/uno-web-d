import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { setUser, setLoading, logout } from './store/slices/authSlice';
import { getMe } from './services/adminApi';
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
import Settings from './pages/Admin/Settings';
import SupportTickets from './pages/Admin/SupportTickets';
import AccountDeletionRequests from './pages/Admin/AccountDeletionRequests';
import Transactions from './pages/Admin/Transactions';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await getMe();
          const admin = profile.user?.isAdmin === true;
          dispatch(setUser({ 
            user: { 
              uid: user.uid, 
              email: profile.user?.email || user.email,
              displayName: profile.user?.name || user.displayName,
              photoURL: profile.user?.avatarUrl || user.photoURL
            }, 
            isAdmin: admin
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
        <Route path="/terms-of-service" element={<PrivacyPolicy />} />
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
          <Route path="support" element={<SupportTickets />} />
          <Route path="account-deletion-requests" element={<AccountDeletionRequests />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
