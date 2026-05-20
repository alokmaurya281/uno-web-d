import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Trash2, UserX } from 'lucide-react';
import {
  deleteUserForAccountDeletionRequest,
  listAccountDeletionRequests,
  updateAccountDeletionRequest,
  type AccountDeletionRequest,
} from '../../services/adminApi';

const statusOptions: AccountDeletionRequest['status'][] = ['open', 'reviewing', 'deleted', 'rejected'];
const pageTitle = 'Account Deletion Requests';
const requestId = (request: AccountDeletionRequest) => request._id || request.id || '';

function dateLabel(value?: string | null) {
  if (!value) return 'Pending';
  return new Date(value).toLocaleString();
}

const AccountDeletionRequests: React.FC = () => {
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [selected, setSelected] = useState<AccountDeletionRequest | null>(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await listAccountDeletionRequests(status);
      setRequests(response.requests || []);
      setSelected((current) => {
        if (!current) return response.requests?.[0] || null;
        return response.requests.find((item) => requestId(item) === requestId(current)) || response.requests?.[0] || null;
      });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load account deletion requests.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setNotes(selected?.notes || '');
  }, [selected]);

  const updateSelected = (request: AccountDeletionRequest) => {
    setRequests((current) => current.map((item) => (requestId(item) === requestId(request) ? request : item)));
    setSelected(request);
  };

  const saveRequest = async (nextStatus?: AccountDeletionRequest['status']) => {
    if (!selected) return;
    const id = requestId(selected);
    if (!id) {
      setMessage('Deletion request id is missing.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const response = await updateAccountDeletionRequest(id, {
        status: nextStatus || selected.status,
        notes: notes.trim(),
      });
      updateSelected(response.request);
      setMessage('Deletion request updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not update deletion request.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRequestedUser = async () => {
    if (!selected) return;
    const id = requestId(selected);
    if (!id) {
      setMessage('Deletion request id is missing.');
      return;
    }
    const label = selected.uid || selected.email;
    if (!window.confirm(`Delete user data for ${label}? This cannot be undone.`)) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await deleteUserForAccountDeletionRequest(id);
      updateSelected(response.request);
      setMessage('User deleted and request marked as deleted.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not delete requested user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight">{pageTitle.split(' ')[0]} <span className="text-uno-red">{pageTitle.split(' ').slice(1).join(' ')}</span></h1>
          <p className="text-sm text-gray-500">Review public deletion requests, then delete the matching backend user from admin.</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg bg-white/5 p-3 hover:bg-white/10" title="Reload">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {message && <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400"><UserX size={16} /> Queue</h2>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-bold outline-none">
              <option value="">all</option>
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
            {requests.map((request) => (
              <button
                key={requestId(request)}
                onClick={() => setSelected(request)}
                className={`w-full rounded-lg border px-3 py-3 text-left ${selected && requestId(selected) === requestId(request) ? 'border-uno-red bg-uno-red/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black text-white">{request.email}</span>
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-300">{request.status}</span>
                </div>
                <p className="truncate text-xs font-bold text-gray-400">{request.uid || 'uid not provided'} · {dateLabel(request.createdAt)}</p>
              </button>
            ))}
            {!loading && requests.length === 0 && <p className="py-10 text-center text-sm font-bold text-gray-500">No account deletion requests found.</p>}
          </div>
        </aside>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          {!selected ? (
            <div className="flex min-h-[420px] items-center justify-center text-sm font-bold text-gray-500">Select an account deletion request.</div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-uno-red">Requested account</p>
                  <h2 className="text-2xl font-black">{selected.email}</h2>
                  <p className="text-sm text-gray-500">UID: {selected.uid || 'not provided'} · Requested: {dateLabel(selected.createdAt)}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(event) => void saveRequest(event.target.value as AccountDeletionRequest['status'])}
                  disabled={saving}
                  className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-black uppercase tracking-widest outline-none"
                >
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Reason</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-200">{selected.reason || 'No reason provided.'}</p>
              </div>

              {selected.status === 'deleted' && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
                  <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                  <span>Deleted UID: {selected.deletedUid || selected.uid || 'matched by email'} · {dateLabel(selected.processedAt)} · {selected.processedByName || 'Admin'}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Admin notes</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Internal note for this deletion request..."
                  className="min-h-[120px] w-full resize-y rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white outline-none focus:border-uno-red/60"
                />
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => void saveRequest()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-40">
                    Save notes/status
                  </button>
                  <button onClick={() => void deleteRequestedUser()} disabled={saving || selected.status === 'deleted'} className="inline-flex items-center gap-2 rounded-lg bg-uno-red px-4 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-40">
                    <Trash2 size={16} /> Delete user
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AccountDeletionRequests;
