import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import UserProfileModal from '../components/Admin/UserProfileModal';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <Gamepad2 size={20} />, label: 'Live Rooms', path: '/admin/rooms' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="glass-dark border-r border-white/5 h-screen sticky top-0 flex flex-col transition-all duration-300 z-50"
      >
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-uno-red rounded-xl flex-shrink-0 flex items-center justify-center font-black italic text-xl">U</div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter">ADMIN</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                location.pathname === item.path 
                  ? 'bg-uno-red text-white shadow-lg shadow-uno-red/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-gray-400 hover:text-uno-red transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-uno-red/50 transition-all cursor-text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-uno-red rounded-full shadow-[0_0_8px_rgba(200,56/43,0.5)]" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-6 border-l border-white/10 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black truncate max-w-[120px]">{user?.displayName || 'Admin User'}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{user?.email?.split('@')[0] || 'Super Admin'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-uno-red to-uno-accent p-[2px] shadow-lg">
                  <div className="w-full h-full rounded-full bg-uno-dark flex items-center justify-center font-black overflow-hidden border border-white/10">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-uno-red">{user?.displayName?.[0] || 'A'}</span>
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-64 glass-dark border border-white/10 rounded-3xl shadow-2xl p-2 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 mb-2">
                        <p className="font-bold text-white">{user?.displayName || 'Admin'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <button 
                          onClick={() => { setIsAdminProfileOpen(true); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-bold cursor-pointer"
                        >
                          <Users size={18} /> Account Settings
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-bold cursor-pointer">
                          <Settings size={18} /> Preferences
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-uno-red/10 text-uno-red transition-all text-sm font-black uppercase tracking-widest cursor-pointer"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* Admin Profile Modal Overlay */}
      <UserProfileModal 
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
        user={user ? {
          uid: user.uid,
          name: user.displayName || 'Admin',
          email: user.email || '',
          avatarUrl: user.photoURL || '',
          isAdmin: true,
          gamesPlayed: 142, // Simulated for admin
          totalScore: 8900   // Simulated for admin
        } : null}
      />
    </div>
  );
};

export default AdminLayout;
