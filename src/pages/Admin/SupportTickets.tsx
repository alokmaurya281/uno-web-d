import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import { listSupportTickets, updateSupportTicket, type SupportTicket } from '../../services/adminApi';

const statusOptions: Array<'open' | 'pending' | 'closed'> = ['open', 'pending', 'closed'];
const pageTitle = 'Support Tickets';

const ticketId = (ticket: SupportTicket) => ticket._id || ticket.id || '';

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await listSupportTickets(status);
      setTickets(response.tickets || []);
      setSelected((current) => {
        if (!current) return response.tickets?.[0] || null;
        return response.tickets.find((ticket) => ticketId(ticket) === ticketId(current)) || response.tickets?.[0] || null;
      });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveTicket = async (nextStatus?: 'open' | 'pending' | 'closed') => {
    if (!selected) return;
    const id = ticketId(selected);
    if (!id) {
      setMessage('Ticket id is missing.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const response = await updateSupportTicket(id, {
        status: nextStatus || selected.status,
        reply: reply.trim() || undefined,
      });
      setTickets((current) => current.map((ticket) => (ticketId(ticket) === id ? response.ticket : ticket)));
      setSelected(response.ticket);
      setReply('');
      setMessage('Support ticket updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not update ticket.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight">{pageTitle.split(' ')[0]} <span className="text-uno-red">{pageTitle.split(' ')[1]}</span></h1>
          <p className="text-sm text-gray-500">Reply to Contact, Help Center, and Report a Problem submissions.</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg bg-white/5 p-3 hover:bg-white/10" title="Reload">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {message && <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400"><MessageSquare size={16} /> Queue</h2>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-bold outline-none">
              <option value="">all</option>
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
            {tickets.map((ticket) => (
              <button
                key={ticketId(ticket)}
                onClick={() => setSelected(ticket)}
                className={`w-full rounded-lg border px-3 py-3 text-left ${selected && ticketId(selected) === ticketId(ticket) ? 'border-uno-red bg-uno-red/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black text-white">{ticket.subject}</span>
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-300">{ticket.status}</span>
                </div>
                <p className="truncate text-xs font-bold text-gray-400">{ticket.userName || ticket.uid} · {ticket.category}</p>
              </button>
            ))}
            {!loading && tickets.length === 0 && <p className="py-10 text-center text-sm font-bold text-gray-500">No support tickets found.</p>}
          </div>
        </aside>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          {!selected ? (
            <div className="flex min-h-[420px] items-center justify-center text-sm font-bold text-gray-500">Select a support ticket.</div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-uno-red">{selected.category}</p>
                  <h2 className="text-2xl font-black">{selected.subject}</h2>
                  <p className="text-sm text-gray-500">{selected.userName || selected.uid} · {selected.userEmail || 'no email'}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(event) => void saveTicket(event.target.value as 'open' | 'pending' | 'closed')}
                  disabled={saving}
                  className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-black uppercase tracking-widest outline-none"
                >
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-200">{selected.message}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Replies</h3>
                {(selected.replies || []).map((item, index) => (
                  <div key={`${item.createdAt || index}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">{item.authorName || 'Admin'}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{item.message}</p>
                  </div>
                ))}
                {(selected.replies || []).length === 0 && <p className="text-sm font-bold text-gray-500">No replies yet.</p>}
              </div>

              <div className="space-y-3">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[130px] w-full resize-y rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white outline-none focus:border-uno-red/60"
                />
                <button onClick={() => void saveTicket()} disabled={saving || !reply.trim()} className="inline-flex items-center gap-2 rounded-lg bg-uno-red px-4 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-40">
                  <Send size={16} /> Send reply
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SupportTickets;
