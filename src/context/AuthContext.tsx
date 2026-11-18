import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut,
  type User as FirebaseUser,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import apiClient from '../services/apiClient';
import socketService from '../services/socketService';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  avatarUrl: string;
  coins: number;
  gems: number;
  level: number;
  xp: number;
  passLevel: number;
  isGuest: boolean;
  equippedSkin: string;
  equippedTable: string;
  equippedAvatar: string;
  equippedFrame: string;
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateCoinsLocal: (delta: number) => void;
  equipCosmetic: (itemId: string, itemType: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_GUEST_PROFILE: UserProfile = {
  uid: 'guest_' + Math.random().toString(36).substring(2, 9),
  email: null,
  displayName: 'Player ' + Math.floor(1000 + Math.random() * 9000),
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=LuckyPlayer',
  coins: 500,
  gems: 10,
  level: 1,
  xp: 0,
  passLevel: 1,
  isGuest: true,
  equippedSkin: 'classic',
  equippedTable: 'default_table',
  equippedAvatar: 'default_avatar',
  equippedFrame: 'default_frame',
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('uno_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_GUEST_PROFILE;
      }
    }
    return DEFAULT_GUEST_PROFILE;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync profile to localStorage
  const saveProfile = useCallback((p: UserProfile) => {
    setProfile(p);
    localStorage.setItem('uno_user_profile', JSON.stringify(p));
    socketService.updatePresence({
      uid: p.uid,
      name: p.displayName,
      avatar: p.avatarUrl,
      coins: p.coins,
    });
  }, []);

  // Fetch full data from backend APIs
  const refreshProfile = useCallback(async () => {
    try {
      // 1. Coins Snapshot
      const coinData = await apiClient.getCoinsSnapshot().catch(() => null);
      // 2. User Data
      const meData = await apiClient.getMe().catch(() => null);

      setProfile((prev) => {
        const current = prev || DEFAULT_GUEST_PROFILE;
        const fetchedCoins = (coinData as any)?.snapshot?.balance ?? (coinData as any)?.coins;
        const updated: UserProfile = {
          ...current,
          coins: typeof fetchedCoins === 'number' ? fetchedCoins : current.coins,
          gems: (coinData as any)?.gems ?? current.gems,
          displayName: meData?.user?.displayName || current.displayName,
          avatarUrl: meData?.user?.avatarUrl || current.avatarUrl,
          level: meData?.user?.level || current.level,
          passLevel: meData?.user?.passLevel || current.passLevel,
          equippedSkin: meData?.user?.equippedSkin || current.equippedSkin,
          equippedAvatar: meData?.user?.equippedAvatar || current.equippedAvatar,
          stats: meData?.user?.stats || current.stats,
        };
        localStorage.setItem('uno_user_profile', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.warn('Backend sync fallback to cached profile:', err);
    }
  }, []);

  // On Auth State Changed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        // Authenticated user
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Player',
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          coins: profile?.coins ?? 1000,
          gems: profile?.gems ?? 20,
          level: profile?.level ?? 1,
          xp: profile?.xp ?? 0,
          passLevel: profile?.passLevel ?? 1,
          isGuest: fbUser.isAnonymous,
          equippedSkin: profile?.equippedSkin ?? 'classic',
          equippedTable: profile?.equippedTable ?? 'default_table',
          equippedAvatar: profile?.equippedAvatar ?? 'default_avatar',
          equippedFrame: profile?.equippedFrame ?? 'default_frame',
        };
        saveProfile(newProfile);
        await refreshProfile();
      } else {
        // Fallback to Guest
        const existingGuest = localStorage.getItem('uno_user_profile');
        if (!existingGuest) {
          saveProfile(DEFAULT_GUEST_PROFILE);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshProfile, saveProfile]);

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    setUser(res.user);
    await refreshProfile();
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateFirebaseProfile(res.user, { displayName: name });
    setUser(res.user);
    await refreshProfile();
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    setUser(res.user);
    await refreshProfile();
  };

  const loginAsGuest = async (customName?: string) => {
    try {
      const res = await signInAnonymously(auth);
      if (customName) {
        await updateFirebaseProfile(res.user, { displayName: customName });
      }
      setUser(res.user);
    } catch {
      // Local Guest fallback
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      const guestName = customName || 'Guest ' + Math.floor(1000 + Math.random() * 9000);
      const guest: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        uid: guestId,
        displayName: guestName,
      };
      saveProfile(guest);
    }
    await refreshProfile();
  };

  const logout = async () => {
    await signOut(auth).catch(() => {});
    setUser(null);
    saveProfile({
      ...DEFAULT_GUEST_PROFILE,
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Player ' + Math.floor(1000 + Math.random() * 9000),
    });
  };

  const updateCoinsLocal = (delta: number) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, coins: Math.max(0, prev.coins + delta) };
      localStorage.setItem('uno_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const equipCosmetic = async (itemId: string, itemType: string) => {
    try {
      await apiClient.equipStoreItem(itemId, itemType);
    } catch {
      // Fallback local save
    }
    setProfile((prev) => {
      if (!prev) return null;
      const key = itemType === 'card_skin' || itemType === 'skin' ? 'equippedSkin' : 'equippedAvatar';
      const updated = { ...prev, [key]: itemId };
      localStorage.setItem('uno_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsGuest,
        logout,
        refreshProfile,
        updateCoinsLocal,
        equipCosmetic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
