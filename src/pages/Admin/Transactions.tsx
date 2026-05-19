import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Coins, Flag, RefreshCw, Search } from 'lucide-react';
import { listTransactions, updateTransaction, type AdminTransaction } from '../../services/adminApi';

const STATUSES = ['', 'open', 'reviewed', 'flagged', 'refunded', 'ignored'];

function text(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return amount > 0 ? `+${amount}` : `${amount}`;
}

function dateText(value: unknown) {
  if (!value) return 'No date';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function metadataValue(transaction: AdminTransaction, key: string) {
  return transaction.metadata && Object.hasOwn(transaction.metadata, key)
    ? transaction.metadata[key]
    : undefined;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async (nextSkip = 0, append = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await listTransactions({ search, type, status, skip: nextSkip, limit: 100 });
      setTransactions((current) => append ? [...current, ...response.transactions] : response.transactions);
      setTotal(response.total);
      setSkip(nextSkip + response.transactions.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [search, type, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(0, false), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const types = useMemo(() => {
    const found = new Set(transactions.map((entry) => entry.type).filter(Boolean));
    return ['', ...Array.from(found).sort()];
  }, [transactions]);

  const patch = async (transaction: AdminTransaction, adminStatus: string) => {
    const noteKey = `${transaction.uid}:${transaction.id}`;
    const response = await updateTransaction(transaction.uid, transaction.id, {
      adminStatus,
      adminNote: notes[noteKey] ?? text(metadataValue(transaction, 'adminNote')),
    });
    setTransactions((current) => current.map((entry) => (
      entry.uid === transaction.uid && entry.id === transaction.id ? response.transaction : entry
    )));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight">Transaction <span className="text-uno-yellow">Ledger</span></h1>
          <p className="text-sm text-gray-500">Review coin, store, IAP, reward, mission, and gameplay wallet events from backend.</p>
        </div>
        <button onClick={() => void load(0, false)} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/10">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 outline-none focus:border-uno-yellow/60"
            placeholder="Search uid, transaction, claim, item, product"
          />
        </div>
        <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-sm outline-none focus:border-uno-yellow/60">
          {types.map((entry) => <option key={entry || 'all'} value={entry}>{entry || 'All types'}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-sm outline-none focus:border-uno-yellow/60">
          {STATUSES.map((entry) => <option key={entry || 'all'} value={entry}>{entry || 'All status'}</option>)}
        </select>
      </div>

      {error && <div className="rounded-lg border border-uno-red/30 bg-uno-red/10 px-4 py-3 text-sm font-bold text-uno-red">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-5 py-4">Transaction</th>
                <th className="px-5 py-4">Player</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Admin</th>
                <th className="px-5 py-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((transaction) => {
                const noteKey = `${transaction.uid}:${transaction.id}`;
                const adminStatus = text(metadataValue(transaction, 'adminStatus'), 'open');
                const itemId = text(metadataValue(transaction, 'itemId') ?? metadataValue(transaction, 'productId') ?? metadataValue(transaction, 'achievementId'));
                return (
                  <tr key={noteKey} className="align-top hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-black text-white">{transaction.type}</p>
                      <p className="mt-1 text-xs text-gray-500">{transaction.id}</p>
                      {itemId && <p className="mt-1 text-xs text-uno-yellow">{itemId}</p>}
                      <p className="mt-1 text-[11px] text-gray-600">{dateText(transaction.timestamp || transaction.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[180px] truncate font-mono text-xs text-gray-300">{transaction.uid}</p>
                      <p className="mt-1 text-xs text-gray-500">Claim: {text(transaction.claimId, '-')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${Number(transaction.amount || 0) >= 0 ? 'bg-uno-yellow/10 text-uno-yellow' : 'bg-uno-red/10 text-uno-red'}`}>
                        <Coins size={14} /> {money(transaction.amount)}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Balance: {transaction.balanceAfter ?? 0}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${adminStatus === 'flagged' ? 'bg-uno-red/15 text-uno-red' : 'bg-white/5 text-gray-300'}`}>
                        {adminStatus === 'flagged' ? <Flag size={12} /> : <CheckCircle2 size={12} />}
                        {adminStatus}
                      </span>
                      <textarea
                        value={notes[noteKey] ?? text(metadataValue(transaction, 'adminNote'))}
                        onChange={(event) => setNotes((current) => ({ ...current, [noteKey]: event.target.value }))}
                        className="mt-3 h-16 w-64 rounded-lg border border-white/10 bg-black/20 p-2 text-xs outline-none focus:border-uno-yellow/60"
                        placeholder="Admin note"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {['reviewed', 'flagged', 'ignored'].map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() => void patch(transaction, nextStatus)}
                            className="rounded-lg bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/10"
                          >
                            {nextStatus}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && transactions.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {skip < total && (
        <div className="text-center">
          <button onClick={() => void load(skip, true)} className="rounded-lg bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/10">
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
