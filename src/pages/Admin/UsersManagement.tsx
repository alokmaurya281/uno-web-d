import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Shield, 
  UserX, 
  Eye, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { collection, query, limit, getDocs, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import UserProfileModal from '../../components/Admin/UserProfileModal';

interface UserData {
  uid: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  gamesPlayed?: number;
  totalScore?: number;
  createdAt?: any;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Profile Modal State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openProfile = (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Fetch users from Firestore
  const fetchUsers = async (isNextPage = false) => {
    setIsRefreshing(true);
    try {
      // Trying 'users' first as established in the diagnostic phase
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('isAdmin', 'desc'), limit(10));

      if (isNextPage && lastDoc) {
        q = query(usersRef, orderBy('isAdmin', 'desc'), startAfter(lastDoc), limit(10));
      }

      const snapshot = await getDocs(q);
      const fetchedUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
      
      if (isNextPage) {
        setUsers(prev => [...prev, ...fetchedUsers]);
      } else {
        setUsers(fetchedUsers);
      }
      
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic">User <span className="text-uno-red">Management</span></h1>
          <p className="text-gray-500 font-medium">Search, monitor, and regulate player accounts across the platform.</p>
        </div>
        <button className="bg-uno-red hover:bg-uno-red/90 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-2 shadow-xl shadow-uno-red/20 transition-all uppercase italic text-sm">
          <UserPlus size={18} /> Add New Admin
        </button>
      </div>

      {/* Filters & Actions bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email or UID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-uno-red/50 transition-all text-white font-medium"
          />
        </div>
        <button className="glass-dark border border-white/5 px-6 rounded-2xl flex items-center gap-3 text-gray-400 font-bold hover:text-white transition-colors">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Player</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Stats</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Last Seen</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium animate-pulse">
                    Synchronizing user data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No players found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={user.uid} 
                    onClick={() => openProfile(user)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-uno-blue/20 border border-uno-blue/30 flex items-center justify-center font-black text-uno-blue text-xl">
                              {user.name?.[0] || 'U'}
                            </div>
                          )}
                          {user.isAdmin && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-uno-red rounded-full flex items-center justify-center border-2 border-uno-dark shadow-lg">
                              <Shield size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-uno-red transition-colors">{user.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500 font-medium tracking-tight truncate max-w-[150px]">{user.email || user.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {user.isBanned ? (
                        <span className="px-3 py-1 rounded-full bg-uno-red/10 text-uno-red text-[10px] font-black uppercase tracking-widest border border-uno-red/20 shadow-sm shadow-uno-red/5">Banned</span>
                      ) : user.isAdmin ? (
                        <span className="px-3 py-1 rounded-full bg-uno-blue/10 text-uno-blue text-[10px] font-black uppercase tracking-widest border border-uno-blue/20 shadow-sm shadow-uno-blue/5">Admin</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-uno-green/10 text-uno-green text-[10px] font-black uppercase tracking-widest border border-uno-green/20 shadow-sm shadow-uno-green/5">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-white">{user.gamesPlayed || 0} <span className="text-gray-500 font-medium uppercase tracking-tighter ml-1">Matches</span></p>
                        <p className="text-[10px] font-black text-uno-yellow uppercase tracking-widest">Score: {user.totalScore || 0}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">Recent</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-uno-blue/20 text-uno-blue rounded-xl transition-all" title="View Profile">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-uno-red/20 text-uno-red rounded-xl transition-all" title="Ban Player">
                          <UserX size={18} />
                        </button>
                        <div className="w-[1px] h-4 bg-white/10 mx-1" />
                        <button className="p-2 hover:bg-white/10 text-gray-400 rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing {filteredUsers.length} of global players
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white disabled:opacity-30" disabled>
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => fetchUsers(true)}
              className="px-6 py-2 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 text-white transition-all flex items-center gap-2"
              disabled={isRefreshing}
            >
              Load More {isRefreshing && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            </button>
            <button className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white disabled:opacity-30" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <UserProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
};

export default UsersManagement;
