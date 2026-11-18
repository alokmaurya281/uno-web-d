import { auth } from '../firebase/config';
import { getIdToken } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

class ApiClientError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) {
    // If not logged in with Firebase, check for guest token or return empty
    const guestToken = localStorage.getItem('uno_guest_token');
    if (guestToken) {
      return { Authorization: `Bearer ${guestToken}` };
    }
    return {};
  }
  try {
    const token = await getIdToken(user);
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  const authHeaders = await getAuthHeader();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new ApiClientError(errorMsg, response.status);
  }

  return data as T;
}

export const apiClient = {
  // Config
  async getConfig(id: string) {
    return request<{ ok: boolean; settings?: any; config?: any }>(`/api/config/${id}`, {
      method: 'GET',
    });
  },

  // User Profile
  async getMe() {
    return request<{ ok: boolean; user: any }>('/api/me', { method: 'GET' });
  },

  async updateMe(userData: Partial<{ username: string; avatarUrl: string; selectedAvatar: string; selectedSkin: string }>) {
    return request<{ ok: boolean; user: any }>('/api/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Coins & Economy
  async getCoinsSnapshot() {
    return request<{
      ok: boolean;
      coins: number;
      gems?: number;
      transactions?: any[];
      dailyLoginRewardAvailable?: boolean;
    }>('/api/coins', { method: 'GET' });
  },

  async claimDailyLoginReward() {
    return request<{ ok: boolean; reward: number; coins: number; message?: string }>(
      '/api/coins/daily-login',
      { method: 'POST', body: JSON.stringify({}) }
    );
  },

  async claimGameReward(payload: { gameMode: string; won: boolean; score?: number; coins?: number }) {
    return request<{ ok: boolean; reward: number; coins: number; message?: string }>(
      '/api/coins/game-reward',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  },

  async changeCoins(amount: number, reason: string) {
    return request<{ ok: boolean; coins: number }>('/api/coins/change', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },

  async getCoinsHistory(limit = 20) {
    return request<{ ok: boolean; history: any[] }>(`/api/coins/history?limit=${limit}`, {
      method: 'GET',
    });
  },

  // Daily Spinner
  async getSpinnerStatus() {
    return request<{
      ok: boolean;
      canSpin: boolean;
      nextSpinAvailableAt?: string;
      remainingSpins?: number;
    }>('/api/spinner', { method: 'GET' });
  },

  async markSpinnerUsed(date?: string) {
    return request<{ ok: boolean }>('/api/spinner/free', {
      method: 'POST',
      body: JSON.stringify({ date: date || new Date().toISOString().split('T')[0] }),
    });
  },

  async grantSpinnerReward(reward: { type: string; amount: number; label?: string }) {
    return request<{ ok: boolean; coins: number; reward: any }>('/api/spinner/reward', {
      method: 'POST',
      body: JSON.stringify(reward),
    });
  },

  // Store & Catalog
  async getStore() {
    return request<{ ok: boolean; items: any[]; categories?: string[] }>('/api/store', {
      method: 'GET',
    });
  },

  async purchaseStoreItem(itemId: string) {
    return request<{ ok: boolean; item: any; coins: number }>('/api/store/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  },

  async equipStoreItem(itemId: string, itemType: string) {
    return request<{ ok: boolean; equipped: any }>('/api/store/equip', {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType }),
    });
  },

  async unequipStoreItem(itemType: string) {
    return request<{ ok: boolean }>('/api/store/unequip', {
      method: 'POST',
      body: JSON.stringify({ itemType }),
    });
  },

  // Leaderboard
  async getLeaderboard(limit = 50) {
    return request<{ ok: boolean; leaderboard: any[] }>(`/api/leaderboard?limit=${limit}`, {
      method: 'GET',
    });
  },

  async getUserRank() {
    return request<{ ok: boolean; rank: number; score: number }>('/api/leaderboard/rank', {
      method: 'GET',
    });
  },

  // Achievements
  async getAchievements() {
    return request<{ ok: boolean; achievements: any[] }>('/api/achievements', {
      method: 'GET',
    });
  },

  async claimAchievement(achievementId: string) {
    return request<{ ok: boolean; reward: number; coins: number }>(
      '/api/achievements/claim',
      { method: 'POST', body: JSON.stringify({ achievementId }) }
    );
  },

  // Uno Pass & Missions
  async getMissions() {
    return request<{ ok: boolean; missions: any[]; progress: any }>('/api/coins/missions', {
      method: 'POST',
      body: JSON.stringify({ action: 'get' }),
    });
  },

  // Inbox & Gifts
  async getInbox() {
    return request<{ ok: boolean; messages: any[] }>('/api/inbox', { method: 'GET' });
  },

  async markInboxRead(messageId?: string) {
    return request<{ ok: boolean }>('/api/inbox/read', {
      method: 'POST',
      body: JSON.stringify(messageId ? { messageId } : {}),
    });
  },

  async getFriends() {
    return request<{ ok: boolean; friends: any[] }>('/api/friends', { method: 'GET' });
  },

  async searchFriends(query: string) {
    return request<{ ok: boolean; users: any[] }>(
      `/api/friends/search?q=${encodeURIComponent(query)}`,
      { method: 'GET' }
    );
  },

  async sendFriendRequest(targetUid: string) {
    return request<{ ok: boolean }>('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ targetUid }),
    });
  },

  // Game History
  async getGameHistory(limit = 20) {
    return request<{ ok: boolean; history: any[] }>(`/api/game-history?limit=${limit}`, {
      method: 'GET',
    });
  },

  async saveGameHistory(record: any) {
    return request<{ ok: boolean; record: any }>('/api/game-history', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
};

export default apiClient;
