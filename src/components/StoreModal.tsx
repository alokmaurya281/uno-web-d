import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Sparkles, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { sfx } from '../services/soundEffects';
import { InteractiveCard3D } from './InteractiveCard3D';

interface StoreItem {
  id: string;
  name: string;
  type: 'card_skin' | 'table' | 'avatar' | 'frame' | 'power_up';
  price: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const FALLBACK_STORE_ITEMS: StoreItem[] = [
  { id: 'classic', name: 'Classic Uno', type: 'card_skin', price: 0, description: 'The original iconic 1971 classic look', rarity: 'common' },
  { id: 'cyberpunk', name: 'Cyberpunk 2099', type: 'card_skin', price: 250, description: 'Futuristic neon holo-grid cards with cyan laser borders', rarity: 'epic' },
  { id: 'royal_gold', name: 'Royal Gold Luxury', type: 'card_skin', price: 500, description: 'Pure 24K gold foil trim with diamond luster', rarity: 'legendary' },
  { id: 'minimalist', name: 'Obsidian Minimal', type: 'card_skin', price: 150, description: 'Ultra-clean matte typography on deep obsidian', rarity: 'rare' },
  { id: 'neon_glow', name: 'Neon Arcade', type: 'card_skin', price: 300, description: 'Vibrant ultraviolet synthwave glow', rarity: 'rare' },
  { id: 'space_galaxy', name: 'Cosmic Nebula', type: 'card_skin', price: 400, description: 'Deep space stellar dust and star cluster gradients', rarity: 'epic' },
  
  { id: 'default_table', name: 'Velvet Green Table', type: 'table', price: 0, description: 'Standard championship green felt table', rarity: 'common' },
  { id: 'casino_royale', name: 'Casino Royale Felt', type: 'table', price: 300, description: 'Vegas VIP high-roller red velvet table', rarity: 'rare' },
  { id: 'neon_city', name: 'Neon City Arena', type: 'table', price: 450, description: 'Dark high-tech cyber arena with electric rails', rarity: 'epic' },

  { id: 'avatar_bot1', name: 'Cyber Bot Prime', type: 'avatar', price: 200, description: 'Animated titanium cybernetic robot avatar', rarity: 'rare' },
  { id: 'avatar_crown', name: 'Uno Monarch', type: 'avatar', price: 600, description: 'Royal Uno champion crowned skull avatar', rarity: 'legendary' },
];

export const StoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { profile, updateCoinsLocal, equipCosmetic, refreshProfile } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'card_skin' | 'table' | 'avatar'>('card_skin');
  const [items, setItems] = useState<StoreItem[]>(FALLBACK_STORE_ITEMS);
  const [ownedItemIds, setOwnedItemIds] = useState<Set<string>>(new Set(['classic', 'default_table']));
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    apiClient.getStore().then((res) => {
      if (res?.ok && Array.isArray(res.items) && res.items.length > 0) {
        setItems(res.items);
      }
    }).catch(() => {
      setItems(FALLBACK_STORE_ITEMS);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCoins = profile?.coins ?? 500;
  const filtered = items.filter((item) => item.type === activeCategory);

  const handleBuy = async (item: StoreItem) => {
    if (currentCoins < item.price) {
      alert(`You need ${item.price - currentCoins} more coins! Play games or spin the Daily Wheel to earn coins.`);
      return;
    }

    setPurchasingId(item.id);
    try {
      await apiClient.purchaseStoreItem(item.id).catch(() => null);
      updateCoinsLocal(-item.price);
      setOwnedItemIds((prev) => new Set([...prev, item.id]));
      sfx.playRewardWin();
      if (!profile?.isGuest) {
        await refreshProfile();
      }
    } catch {
      updateCoinsLocal(-item.price);
      setOwnedItemIds((prev) => new Set([...prev, item.id]));
    } finally {
      setPurchasingId(null);
    }
  };

  const handleEquip = async (item: StoreItem) => {
    sfx.playCardPlace();
    await equipCosmetic(item.id, item.type);
  };

  const isEquipped = (item: StoreItem) => {
    if (item.type === 'card_skin') {
      return (profile?.equippedSkin || 'classic') === item.id;
    }
    if (item.type === 'table') {
      return (profile?.equippedTable || 'default_table') === item.id;
    }
    return (profile?.equippedAvatar || 'default_avatar') === item.id;
  };

  const isOwned = (item: StoreItem) => {
    return item.price === 0 || ownedItemIds.has(item.id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-['Outfit']">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#10131c] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-uno-yellow/10 border border-uno-yellow/30 flex items-center justify-center text-uno-yellow shadow-lg">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Item Store & Customization <Sparkles size={18} className="text-uno-yellow" />
                </h2>
                <p className="text-xs text-gray-400">Unlock official skins, table felts, and avatars with coins</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Coin Balance Pill */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-uno-yellow/40 text-uno-yellow font-black text-sm shadow-[0_0_15px_rgba(255,204,0,0.2)]">
                <Coins size={18} className="animate-spin text-amber-400" />
                <span>{currentCoins.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">COINS</span>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 my-5 overflow-x-auto pb-1">
            {[
              { id: 'card_skin', label: 'Card Skins', count: items.filter((i) => i.type === 'card_skin').length },
              { id: 'table', label: 'Table Mats', count: items.filter((i) => i.type === 'table').length },
              { id: 'avatar', label: 'Avatars & Frames', count: items.filter((i) => i.type === 'avatar').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeCategory === tab.id
                    ? 'bg-uno-yellow text-black shadow-lg font-black'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const owned = isOwned(item);
              const equipped = isEquipped(item);

              return (
                <div
                  key={item.id}
                  className={`relative p-5 rounded-2xl bg-black/40 border transition-all flex flex-col justify-between ${
                    equipped
                      ? 'border-uno-yellow ring-2 ring-uno-yellow/40 shadow-[0_0_20px_rgba(255,204,0,0.2)]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Rarity & Status badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        item.rarity === 'legendary'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : item.rarity === 'epic'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : item.rarity === 'rare'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/40'
                      }`}
                    >
                      {item.rarity}
                    </span>

                    {equipped && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-uno-green bg-uno-green/10 border border-uno-green/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Check size={12} /> Equipped
                      </span>
                    )}
                  </div>

                  {/* Visual Preview */}
                  <div className="h-36 flex items-center justify-center my-2">
                    {item.type === 'card_skin' ? (
                      <div className="scale-75 transform hover:scale-85 transition-transform duration-300">
                        <InteractiveCard3D
                          color="red"
                          value="7"
                          size="md"
                          skin={item.id as any}
                          interactive={false}
                        />
                      </div>
                    ) : item.type === 'table' ? (
                      <div className="w-40 h-24 rounded-full border-4 border-amber-500/30 bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-950 shadow-inner flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.name}</span>
                      </div>
                    ) : (
                      <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${item.id}`}
                        alt={item.name}
                        className="w-20 h-20 rounded-2xl bg-white/5 p-2 border border-white/10"
                      />
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-2 mb-4">
                    <h3 className="font-bold text-white text-base">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  {/* Action Button */}
                  <div>
                    {equipped ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-uno-green/20 border border-uno-green/40 text-uno-green font-black text-xs uppercase tracking-wider cursor-default flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} /> Currently Active
                      </button>
                    ) : owned ? (
                      <button
                        onClick={() => handleEquip(item)}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Equip Cosmetic
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={purchasingId === item.id}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-uno-yellow to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Coins size={14} />
                        {purchasingId === item.id ? 'Unlocking...' : `Unlock for ${item.price} Coins`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoreModal;
