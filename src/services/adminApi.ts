import { auth } from '../firebase/config';
import { getIdToken } from 'firebase/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface AdminUser {
  uid: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  coins?: number;
  wins?: number;
  gamesPlayed?: number;
  totalScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserDetail {
  ok: boolean;
  user: AdminUser | null;
  ownedItems: Array<Record<string, unknown>>;
  coinHistory: Array<Record<string, unknown>>;
  limits: Array<Record<string, unknown>>;
  gameHistory: Array<Record<string, unknown>>;
}

export interface LiveRoom {
  id: string;
  roomCode: string;
  status: string;
  isPublic: boolean;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  createdAt?: string | number | null;
  updatedAt?: string | number | null;
  players?: Array<{
    id: string;
    name: string;
    isHost: boolean;
    status: string;
    joinedAt?: string | number | null;
    isBot: boolean;
  }>;
}

export interface AdminConfigSummary {
  id: string;
  label: string;
  source: string;
  updatedAt?: string | null;
}

export interface AdminSeason {
  id?: string;
  seasonId?: string;
  title?: string;
  seasonNumber?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  rewards?: Array<Record<string, unknown>>;
  missions?: Array<Record<string, unknown>>;
  rewardWarnings?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface SupportTicket {
  _id?: string;
  id?: string;
  uid: string;
  userName?: string;
  userEmail?: string | null;
  category: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'closed';
  priority?: string;
  replies?: Array<{ message: string; authorName?: string; createdAt?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountDeletionRequest {
  _id?: string;
  id?: string;
  email: string;
  uid?: string | null;
  reason?: string;
  status: 'open' | 'reviewing' | 'deleted' | 'rejected';
  notes?: string;
  deletedUid?: string | null;
  processedByName?: string | null;
  processedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTransaction {
  uid: string;
  id: string;
  type: string;
  amount?: number;
  balanceAfter?: number;
  claimId?: string | null;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('Admin login is required.');
  const token = await getIdToken(user);
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data as T;
}

async function publicRequestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data as T;
}

export function getMe() {
  return requestJson<{ ok: boolean; user: AdminUser }>('/api/me');
}

export function getOverview() {
  return requestJson<{ ok: boolean; overview: Record<string, unknown> }>('/api/admin/overview');
}

export function getLogs() {
  return requestJson<{ ok: boolean; logs: string; truncated: boolean }>('/api/admin/logs');
}

export function getLiveRooms() {
  return requestJson<{ ok: boolean; live: { roomList?: LiveRoom[]; [key: string]: unknown } }>('/api/admin/live-rooms');
}

export function closeRoom(roomId: string) {
  return requestJson<{ ok: boolean; closed: boolean }>(`/api/admin/live-rooms/${encodeURIComponent(roomId)}`, {
    method: 'DELETE',
  });
}

export function cleanupInactiveRooms() {
  return requestJson<{ ok: boolean; removedCount: number; removedRooms: Array<{ roomId: string; roomCode?: string; status?: string }> }>('/api/admin/live-rooms/cleanup-inactive', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function listUsers(search = '', skip = 0, limit = 50) {
  const params = new URLSearchParams({ search, skip: String(skip), limit: String(limit) });
  return requestJson<{ ok: boolean; users: AdminUser[]; total: number; skip: number; limit: number }>(`/api/admin/users?${params}`);
}

export function updateUser(uid: string, patch: Partial<AdminUser>) {
  return requestJson<{ ok: boolean; user: AdminUser }>(`/api/admin/users/${encodeURIComponent(uid)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function getUserDetail(uid: string) {
  return requestJson<AdminUserDetail>(`/api/admin/users/${encodeURIComponent(uid)}`);
}

export function listConfigs() {
  return requestJson<{ ok: boolean; configs: AdminConfigSummary[] }>('/api/admin/configs');
}

export function getConfig(id: string) {
  return requestJson<{ ok: boolean; id: string; settings: unknown }>(`/api/admin/configs/${encodeURIComponent(id)}`);
}

export function saveConfig(id: string, settings: unknown) {
  return requestJson<{ ok: boolean; id: string; settings: unknown }>(`/api/admin/configs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function sendNotification(payload: {
  title: string;
  body: string;
  targetEmails?: string;
  inApp?: boolean;
  push?: boolean;
  inAppStyle?: 'popup' | 'banner';
}) {
  return requestJson<{ ok: boolean; targetUserCount: number; tokenCount: number; successCount: number; failureCount: number }>('/api/admin/notifications/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listSupportTickets(status = '', skip = 0, limit = 50) {
  const params = new URLSearchParams({ status, skip: String(skip), limit: String(limit) });
  return requestJson<{ ok: boolean; tickets: SupportTicket[]; total: number; skip: number; limit: number }>(`/api/admin/support-tickets?${params}`);
}

export function updateSupportTicket(ticketId: string, patch: { status?: 'open' | 'pending' | 'closed'; reply?: string }) {
  return requestJson<{ ok: boolean; ticket: SupportTicket }>(`/api/admin/support-tickets/${encodeURIComponent(ticketId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function createAccountDeletionRequest(payload: { email: string; uid?: string; reason?: string }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Verify with Firebase before requesting account deletion.');
  return getIdToken(user).then((token) => publicRequestJson<{ ok: boolean; request: AccountDeletionRequest }>('/api/account-deletion-requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }));
}

export function listAccountDeletionRequests(status = '', skip = 0, limit = 50) {
  const params = new URLSearchParams({ status, skip: String(skip), limit: String(limit) });
  return requestJson<{ ok: boolean; requests: AccountDeletionRequest[]; total: number; skip: number; limit: number }>(`/api/admin/account-deletion-requests?${params}`);
}

export function updateAccountDeletionRequest(requestId: string, patch: { status?: AccountDeletionRequest['status']; notes?: string }) {
  return requestJson<{ ok: boolean; request: AccountDeletionRequest }>(`/api/admin/account-deletion-requests/${encodeURIComponent(requestId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function deleteUserForAccountDeletionRequest(requestId: string) {
  return requestJson<{ ok: boolean; request: AccountDeletionRequest }>(`/api/admin/account-deletion-requests/${encodeURIComponent(requestId)}/delete-user`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function listTransactions(filters: {
  search?: string;
  type?: string;
  status?: string;
  uid?: string;
  skip?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    search: filters.search || '',
    type: filters.type || '',
    status: filters.status || '',
    uid: filters.uid || '',
    skip: String(filters.skip || 0),
    limit: String(filters.limit || 100),
  });
  return requestJson<{ ok: boolean; transactions: AdminTransaction[]; total: number; skip: number; limit: number }>(`/api/admin/transactions?${params}`);
}

export function updateTransaction(uid: string, transactionId: string, patch: { adminStatus?: string; adminNote?: string }) {
  return requestJson<{ ok: boolean; transaction: AdminTransaction }>(`/api/admin/transactions/${encodeURIComponent(uid)}/${encodeURIComponent(transactionId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function runPassSeasonTransition() {
  return requestJson<{ ok: boolean; transitioned: string[] }>('/api/admin/pass/run-season-transition', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function getSeasons() {
  return requestJson<{ ok: boolean; seasons: AdminSeason[] }>('/api/admin/seasons');
}

export function saveSeason(season: AdminSeason) {
  return requestJson<{ ok: boolean; season: AdminSeason }>('/api/admin/seasons', {
    method: 'POST',
    body: JSON.stringify(season),
  });
}

export function seedPassSeasons(count = 7) {
  return requestJson<{ ok: boolean; seasons: AdminSeason[] }>('/api/admin/seasons/seed', {
    method: 'POST',
    body: JSON.stringify({ count }),
  });
}

export interface AdminBotProfile {
  _id: string;
  botId: string;
  name: string;
  avatarUrl?: string;
  region: string;
  skillLevel: number;
  personality: string;
  isActive: boolean;
  baseWinRate: number;
  playSpeedMs: number;
  mistakeRate: number;
  emoteFrequency: number;
  totalGames: number;
  wins: number;
}

export async function getBots(skip = 0, limit = 50) {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const response = await requestJson<{ success: boolean; bots: AdminBotProfile[]; pagination: unknown }>(`/api/admin/bots?${params}`);
  return { ...response, ok: response.success };
}

export async function updateBotProfile(botId: string, patch: Partial<AdminBotProfile>) {
  const response = await requestJson<{ success: boolean; bot: AdminBotProfile }>(`/api/admin/bots/${encodeURIComponent(botId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
  return { ...response, ok: response.success };
}

export async function triggerBotSeeding(force = false) {
  const response = await requestJson<{ success: boolean; message: string; seededCount?: number }>('/api/admin/bots/seed', {
    method: 'POST',
    body: JSON.stringify({ force })
  });
  return { ...response, ok: response.success };
}
