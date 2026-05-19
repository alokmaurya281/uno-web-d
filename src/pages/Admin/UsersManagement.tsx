import React, { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Coins, RefreshCw, Search, Shield, UserCog } from 'lucide-react';
import { listUsers, updateUser, type AdminUser } from '../../services/adminApi';
import UserProfileModal from '../../components/Admin/UserProfileModal';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const load = async (nextSkip = 0, append = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await listUsers(search, nextSkip, 50);
      setUsers((current) => append ? [...current, ...response.users] : response.users);
      setTotal(response.total);
      setSkip(nextSkip + response.users.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(0, false), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const patchUser = async (user: AdminUser, patch: Partial<AdminUser>) => {
    const response = await updateUser(user.uid, patch);
    setUsers((current) => current.map((entry) => entry.uid === user.uid ? response.user : entry));
    setSelectedUser((current) => current?.uid === user.uid ? response.user : current);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight">User <span className="text-uno-red">Management</span></h1>
          <p className="text-sm text-gray-500">Manage admin access, bans, coin balances, and player account state through backend APIs.</p>
        </div>
        <button onClick={() => void load(0, false)} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/10">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 outline-none focus:border-uno-red/60"
          placeholder="Search name, email, or UID"
        />
      </div>

      {error && <div className="rounded-lg border border-uno-red/30 bg-uno-red/10 px-4 py-3 text-sm font-bold text-uno-red">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-5 py-4">Player</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Stats</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <button onClick={() => setSelectedUser(user)} className="text-left">
                      <p className="font-bold text-white">{user.name || 'Player'}</p>
                      <p className="max-w-[260px] truncate text-xs text-gray-500">{user.email || user.uid}</p>
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.isAdmin && <span className="rounded bg-uno-blue/10 px-2 py-1 text-[10px] font-black uppercase text-uno-blue">Admin</span>}
                      {user.isBanned ? <span className="rounded bg-uno-red/10 px-2 py-1 text-[10px] font-black uppercase text-uno-red">Banned</span> : <span className="rounded bg-uno-green/10 px-2 py-1 text-[10px] font-black uppercase text-uno-green">Active</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300">
                    <div>{Number(user.gamesPlayed || 0).toLocaleString()} matches</div>
                    <div className="text-xs text-uno-yellow">{Number(user.coins || 0).toLocaleString()} coins · {Number(user.totalScore || 0).toLocaleString()} score</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => void patchUser(user, { isAdmin: !user.isAdmin })} className="rounded-lg bg-white/5 p-2 text-uno-blue hover:bg-uno-blue/10" title="Toggle admin">
                        <Shield size={17} />
                      </button>
                      <button onClick={() => void patchUser(user, { isBanned: !user.isBanned })} className="rounded-lg bg-white/5 p-2 text-uno-red hover:bg-uno-red/10" title="Toggle ban">
                        {user.isBanned ? <CheckCircle2 size={17} /> : <Ban size={17} />}
                      </button>
                      <button onClick={() => void patchUser(user, { coins: Number(user.coins || 0) + 1000 })} className="rounded-lg bg-white/5 p-2 text-uno-yellow hover:bg-uno-yellow/10" title="Grant 1000 coins">
                        <Coins size={17} />
                      </button>
                      <button onClick={() => setSelectedUser(user)} className="rounded-lg bg-white/5 p-2 text-white hover:bg-white/10" title="View">
                        <UserCog size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm font-bold text-gray-500">{loading ? 'Loading users...' : 'No users found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
          <span className="text-xs font-bold text-gray-500">Showing {users.length} of {total}</span>
          <button disabled={loading || users.length >= total} onClick={() => void load(skip, true)} className="rounded-lg bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest disabled:opacity-40">
            Load More
          </button>
        </div>
      </div>

      <UserProfileModal isOpen={selectedUser != null} onClose={() => setSelectedUser(null)} user={selectedUser} />
    </div>
  );
};

export default UsersManagement;
